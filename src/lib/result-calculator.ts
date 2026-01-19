import { QuizSession, AnswerOption } from '@/types/question';
import { prisma } from './prisma';

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeTaken: number;
  score: number;
  globalRank?: number;
}

export interface QuizAttemptData {
  userId: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  answers: (AnswerOption | null)[];
  userEmail?: string;
  username?: string;
}

export class ResultCalculator {
  /**
   * Complete quiz session and return full results with ranking
   */
  static async calculateResults(session: QuizSession, userId?: string, userEmail?: string, username?: string): Promise<QuizResult> {
    if (session.status !== 'completed') {
      throw new Error('Quiz session is not completed');
    }

    // Calculate basic results
    const results = this.calculateBasicResults(session);

    // Prepare attempt data for database
    const attemptData: QuizAttemptData = {
      userId: session.userId,
      score: results.score,
      accuracy: results.accuracy,
      timeTaken: results.timeTaken,
      answers: session.answers,
      userEmail: userEmail || undefined,
      username: username || undefined
    };

    // Save to database
    await this.saveQuizAttempt(attemptData);

    // Calculate global ranking
    const globalRank = await this.calculateGlobalRank(
      session.userId,
      results.score,
      results.accuracy,
      results.timeTaken
    );

    return {
      ...results,
      globalRank
    };
  }

  /**
   * Calculate basic quiz results from a completed session (without database operations)
   */
  static calculateBasicResults(session: QuizSession): QuizResult {
    if (session.status !== 'completed') {
      throw new Error('Cannot calculate results for incomplete quiz session');
    }

    const totalQuestions = session.questions.length;
    let correctAnswers = 0;

    // Calculate correct answers
    session.answers.forEach((answer, index) => {
      if (answer && session.questions[index]?.answer === answer) {
        correctAnswers++;
      }
    });

    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Calculate time taken in seconds
    const timeTaken = session.endTime && session.startTime 
      ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
      : 0;

    const score = correctAnswers;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
      timeTaken,
      score
    };
  }

  /**
   * Save quiz attempt to database and return the saved attempt with ID
   */
  static async saveQuizAttempt(attemptData: QuizAttemptData) {
    try {
      // First, ensure the user exists in our database using upsert to handle race conditions
      await prisma.user.upsert({
        where: { id: attemptData.userId },
        update: {
          // Only update username if the user doesn't have one and we have a username to set
          ...(attemptData.username ? { username: attemptData.username } : {})
        },
        create: {
          id: attemptData.userId,
          email: attemptData.userEmail || `${attemptData.userId}@clerk.temp`,
          username: attemptData.username || null,
          role: 'STUDENT'
        }
      });
      
      const savedAttempt = await prisma.quizAttempt.create({
        data: {
          userId: attemptData.userId,
          score: attemptData.score,
          accuracy: attemptData.accuracy,
          timeTaken: attemptData.timeTaken,
          answers: attemptData.answers
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        }
      });

      return savedAttempt;
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      throw new Error(`Failed to save quiz attempt to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate global ranking for a user based on their latest attempt
   * Ranking algorithm: score (desc) -> accuracy (desc) -> time taken (asc)
   */
  static async calculateGlobalRank(userId: string, score: number, accuracy: number, timeTaken: number): Promise<number> {
    try {
      // Count users with better performance
      const betterPerformers = await prisma.quizAttempt.count({
        where: {
          OR: [
            // Higher score
            { score: { gt: score } },
            // Same score but higher accuracy
            { 
              AND: [
                { score: { equals: score } },
                { accuracy: { gt: accuracy } }
              ]
            },
            // Same score and accuracy but faster time
            {
              AND: [
                { score: { equals: score } },
                { accuracy: { equals: accuracy } },
                { timeTaken: { lt: timeTaken } }
              ]
            }
          ]
        }
      });

      // Rank is the number of better performers + 1
      return betterPerformers + 1;
    } catch (error) {
      console.error('Error calculating global rank:', error);
      throw new Error('Failed to calculate global ranking');
    }
  }

  /**
   * Get leaderboard data with ranking - showing only top 3 attempts per user
   */
  static async getLeaderboard(limit: number = 50, offset: number = 0) {
    try {
      // Get the best 3 attempts per user using Prisma (avoiding raw SQL BigInt issues)
      const allAttempts = await prisma.quizAttempt.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: [
          { score: 'desc' },
          { accuracy: 'desc' },
          { timeTaken: 'asc' }
        ]
      });

      // Group by user and take top 3 per user
      const userAttempts = new Map<string, any[]>();
      
      allAttempts.forEach(attempt => {
        const userId = attempt.userId;
        if (!userAttempts.has(userId)) {
          userAttempts.set(userId, []);
        }
        const userList = userAttempts.get(userId)!;
        if (userList.length < 3) {
          userList.push({
            ...attempt,
            userRank: userList.length + 1
          });
        }
      });

      // Flatten and sort all top attempts
      const topAttemptsPerUser = Array.from(userAttempts.values())
        .flat()
        .sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score;
          if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
          return a.timeTaken - b.timeTaken;
        });

      // Apply pagination
      const paginatedAttempts = topAttemptsPerUser.slice(offset, offset + limit);

      // Add global rank to each attempt
      const leaderboard = paginatedAttempts.map((attempt, index) => ({
        id: attempt.id,
        userId: attempt.userId,
        score: attempt.score,
        accuracy: attempt.accuracy,
        timeTaken: attempt.timeTaken,
        answers: attempt.answers,
        createdAt: attempt.createdAt,
        user: attempt.user,
        rank: offset + index + 1,
        userRank: attempt.userRank // Which attempt this is for the user (1st, 2nd, or 3rd best)
      }));

      return {
        leaderboard,
        totalCount: topAttemptsPerUser.length,
        hasMore: offset + limit < topAttemptsPerUser.length
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard data');
    }
  }

  /**
   * Get user's best attempt and current ranking
   */
  static async getUserStats(userId: string) {
    try {
      // Get user's best attempt (highest score, then accuracy, then fastest time)
      const bestAttempt = await prisma.quizAttempt.findFirst({
        where: { userId },
        orderBy: [
          { score: 'desc' },
          { accuracy: 'desc' },
          { timeTaken: 'asc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        }
      });

      if (!bestAttempt) {
        return null;
      }

      // Calculate current rank for best attempt
      const globalRank = await this.calculateGlobalRank(
        userId,
        bestAttempt.score,
        bestAttempt.accuracy,
        bestAttempt.timeTaken
      );

      // Get total attempts count for this user
      const totalAttempts = await prisma.quizAttempt.count({
        where: { userId }
      });

      return {
        ...bestAttempt,
        globalRank,
        totalAttempts
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }
}