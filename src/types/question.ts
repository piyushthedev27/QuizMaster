// Question types matching the JSON structure exactly

export interface Question {
  id: string;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: 'a' | 'b' | 'c' | 'd';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  createdAt?: Date;
}

export type AnswerOption = 'a' | 'b' | 'c' | 'd';

export interface QuizSession {
  id: string;
  userId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (AnswerOption | null)[]; // Allow null for skipped questions
  startTime: Date;
  endTime?: Date;
  timeRemaining: number;
  status: 'active' | 'completed' | 'abandoned';
  unit?: string;
  totalQuestions: number;
}

export interface Answer {
  questionId: string;
  selectedOption: AnswerOption;
  isCorrect: boolean;
  timeSpent: number;
}