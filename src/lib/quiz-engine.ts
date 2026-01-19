import { Question, QuizSession, AnswerOption } from '@/types/question';
import { prisma } from './prisma';
import { QuestionDeliveryService } from './question-delivery';
import { ErrorHandler } from './error-handling';

export class QuizEngine {
  private static readonly QUIZ_DURATION = 10; // seconds per question
  private static readonly DEFAULT_QUESTIONS_PER_QUIZ = 10;

  /**
   * Initialize a new quiz session with randomized questions from database
   */
  static async initializeQuizSession(
    userId: string, 
    questionCount: number = this.DEFAULT_QUESTIONS_PER_QUIZ,
    unit?: string
  ): Promise<QuizSession> {
    try {
      // Fetch questions from appropriate table
      let allQuestions;
      
      if (unit) {
        // Fetch questions from unit_questions table for specific unit
        console.log(`Fetching questions for unit: ${unit}`)
        allQuestions = await prisma.unitQuestion.findMany({
          where: { unit: unit }
        });
        console.log(`Found ${allQuestions.length} questions for ${unit}`)
      } else {
        // Fetch questions from main questions table
        console.log('Fetching questions from main table')
        allQuestions = await prisma.question.findMany();
        console.log(`Found ${allQuestions.length} main questions`)
      }
      
      if (allQuestions.length < questionCount) {
        const unitText = unit ? ` for ${unit}` : '';
        throw new Error(`Insufficient questions in database${unitText}. Found ${allQuestions.length}, need ${questionCount}`);
      }

      // Validate and convert questions to proper format
      const validQuestions = allQuestions.filter(q => {
        // Check if question has the expected structure
        const qAny = q as any;
        return q && q.id && q.question && 
               (qAny.options || qAny.optionA) && 
               (qAny.answer || qAny.correctOption);
      });

      if (validQuestions.length < questionCount) {
        const unitText = unit ? ` for ${unit}` : '';
        throw new Error(`Insufficient valid questions in database${unitText}. Found ${validQuestions.length} valid questions, need ${questionCount}`);
      }

      // Randomize question order for each attempt using Fisher-Yates shuffle
      const shuffledQuestions = this.shuffleArray([...validQuestions]);
      const selectedQuestions = shuffledQuestions.slice(0, questionCount);

      // Convert Prisma questions to Question type
      const questions: Question[] = selectedQuestions.map(q => {
        const qAny = q as any;
        
        // Handle both schema formats (new JSON format and old separate fields)
        let options: { a: string; b: string; c: string; d: string };
        let answer: AnswerOption;

        if (qAny.options && typeof qAny.options === 'object') {
          // New JSON format
          options = qAny.options as { a: string; b: string; c: string; d: string };
          answer = qAny.answer as AnswerOption;
        } else {
          // Old separate fields format (current generated schema)
          options = {
            a: qAny.optionA || '',
            b: qAny.optionB || '',
            c: qAny.optionC || '',
            d: qAny.optionD || ''
          };
          answer = qAny.correctOption as AnswerOption || 'a';
        }

        // Validate question structure
        if (!options.a || !options.b || !options.c || !options.d) {
          throw new Error(`Invalid question format for question ID ${q.id}: missing options`);
        }

        if (!['a', 'b', 'c', 'd'].includes(answer)) {
          throw new Error(`Invalid answer format for question ID ${q.id}: answer must be a, b, c, or d`);
        }

        return {
          id: q.id,
          question: q.question,
          options,
          answer,
          difficulty: q.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
          category: q.category,
          createdAt: q.createdAt
        };
      });

      const session: QuizSession = {
        id: `quiz_${Date.now()}_${userId}`,
        userId,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date(),
        timeRemaining: this.QUIZ_DURATION,
        status: 'active'
      };

      return session;
    } catch (error) {
      const appError = ErrorHandler.handleError(error, 'quiz');
      ErrorHandler.logError(appError, 'Quiz Initialization');
      throw appError;
    }
  }

  /**
   * Fisher-Yates shuffle algorithm for randomizing questions
   * Ensures each quiz attempt has different question order
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  /**
   * Get current question for the quiz session
   */
  static getCurrentQuestion(session: QuizSession): Question | null {
    return QuestionDeliveryService.getCurrentQuestionForDisplay(session);
  }

  /**
   * Submit answer for current question and advance to next
   */
  static submitAnswer(session: QuizSession, selectedOption: AnswerOption | null): QuizSession {
    try {
      // Validate session
      if (!session) {
        throw new Error('Quiz session is required');
      }

      if (session.status !== 'active') {
        throw new Error('Quiz session is not active');
      }

      // Validate answer option (allow null for skipped questions)
      if (selectedOption !== null && !['a', 'b', 'c', 'd'].includes(selectedOption)) {
        throw new Error('Invalid answer option. Must be a, b, c, d, or null for skipped questions');
      }

      const currentQuestion = this.getCurrentQuestion(session);
      if (!currentQuestion) {
        throw new Error('No current question available to answer');
      }

      // Check if we're at the end of questions
      if (session.currentQuestionIndex >= session.questions.length) {
        throw new Error('Quiz has already been completed');
      }

      // Add answer to session (null for skipped questions)
      const updatedAnswers: (AnswerOption | null)[] = [...session.answers, selectedOption];
      
      // Advance to next question
      const nextIndex = session.currentQuestionIndex + 1;
      const isCompleted = nextIndex >= session.questions.length;

      return {
        ...session,
        answers: updatedAnswers,
        currentQuestionIndex: nextIndex,
        timeRemaining: isCompleted ? 0 : this.QUIZ_DURATION,
        status: isCompleted ? 'completed' : 'active',
        endTime: isCompleted ? new Date() : undefined
      };
    } catch (error) {
      const appError = ErrorHandler.handleError(error, 'quiz');
      ErrorHandler.logError(appError, 'Submit Answer');
      throw appError;
    }
  }

  /**
   * Auto-submit when timer reaches zero (handles timeout)
   */
  static autoSubmitQuestion(session: QuizSession): QuizSession {
    try {
      // Validate session
      if (!session) {
        throw new Error('Quiz session is required');
      }

      if (session.status !== 'active') {
        throw new Error('Quiz session is not active');
      }

      // Check if we're at the end of questions
      if (session.currentQuestionIndex >= session.questions.length) {
        throw new Error('Quiz has already been completed');
      }

      // Auto-submit with no answer (treated as incorrect)
      const updatedAnswers = [...session.answers, null as any];
      
      const nextIndex = session.currentQuestionIndex + 1;
      const isCompleted = nextIndex >= session.questions.length;

      return {
        ...session,
        answers: updatedAnswers,
        currentQuestionIndex: nextIndex,
        timeRemaining: isCompleted ? 0 : this.QUIZ_DURATION,
        status: isCompleted ? 'completed' : 'active',
        endTime: isCompleted ? new Date() : undefined
      };
    } catch (error) {
      const appError = ErrorHandler.handleError(error, 'quiz');
      ErrorHandler.logError(appError, 'Auto Submit');
      throw appError;
    }
  }

  /**
   * Update timer state in session
   */
  static updateTimerState(session: QuizSession, timeRemaining: number): QuizSession {
    return {
      ...session,
      timeRemaining: Math.max(0, timeRemaining)
    };
  }
}