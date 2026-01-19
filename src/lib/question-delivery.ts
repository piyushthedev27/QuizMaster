import { Question, QuizSession } from '@/types/question';

export class QuestionDeliveryService {
  /**
   * Get the current question for display
   */
  static getCurrentQuestionForDisplay(session: QuizSession): Question | null {
    if (!session || session.status !== 'active') {
      return null;
    }

    if (session.currentQuestionIndex >= session.questions.length) {
      return null;
    }

    return session.questions[session.currentQuestionIndex];
  }

  /**
   * Get question progress information
   */
  static getQuestionProgress(session: QuizSession) {
    return {
      current: session.currentQuestionIndex + 1,
      total: session.questions.length,
      percentage: Math.round(((session.currentQuestionIndex + 1) / session.questions.length) * 100)
    };
  }

  /**
   * Check if quiz has next question
   */
  static hasNextQuestion(session: QuizSession): boolean {
    return session.currentQuestionIndex < session.questions.length - 1;
  }

  /**
   * Check if current question is the last one
   */
  static isLastQuestion(session: QuizSession): boolean {
    return session.currentQuestionIndex === session.questions.length - 1;
  }

  /**
   * Get question navigation state
   */
  static getNavigationState(session: QuizSession) {
    return {
      canGoNext: this.hasNextQuestion(session),
      isLast: this.isLastQuestion(session),
      progress: this.getQuestionProgress(session)
    };
  }

  /**
   * Validate question structure from database
   */
  static validateQuestionStructure(question: any): question is Question {
    return (
      question &&
      typeof question.id === 'string' &&
      typeof question.question === 'string' &&
      question.options &&
      typeof question.options.a === 'string' &&
      typeof question.options.b === 'string' &&
      typeof question.options.c === 'string' &&
      typeof question.options.d === 'string' &&
      ['a', 'b', 'c', 'd'].includes(question.answer) &&
      ['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty)
    );
  }
}