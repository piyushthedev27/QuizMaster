import { useState, useCallback } from 'react';
import { QuizSession, AnswerOption, Question } from '@/types/question';

export function useQuizSession() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeQuiz = useCallback(async (questionCount: number = 10, unit?: string) => {
    console.log('Initializing quiz with', questionCount, 'questions', unit ? `for ${unit}` : '...');
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quiz/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionCount, unit })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to initialize quiz`;
        console.error('Quiz initialization failed:', errorMessage);
        setError(errorMessage);
        return;
      }

      const { session: newSession } = await response.json();
      console.log('Quiz initialized successfully:', newSession);
      setSession(newSession);
    } catch (error) {
      console.error('Quiz initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize quiz';
      setError(errorMessage);
    }
    
    setLoading(false);
  }, []);

  const submitAnswer = useCallback(async (selectedOption: AnswerOption | null) => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, selectedOption })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to submit answer`;
        console.error('Answer submission failed:', errorMessage);
        setError(errorMessage);
        return;
      }

      const { session: updatedSession } = await response.json();
      console.log('Answer submitted successfully:', updatedSession);
      setSession(updatedSession);
    } catch (error) {
      console.error('Answer submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      setError(errorMessage);
    }
  }, [session]);

  const getCurrentQuestion = useCallback((): Question | null => {
    if (!session || session.currentQuestionIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentQuestionIndex];
  }, [session]);

  const getResults = useCallback(() => {
    if (!session) return null;
    
    const totalQuestions = session.questions.length;
    let correctAnswers = 0;

    session.answers.forEach((answer, index) => {
      if (answer && session.questions[index]?.answer === answer) {
        correctAnswers++;
      }
    });

    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timeTaken = session.endTime && session.startTime 
      ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
      : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      timeTaken,
      score: correctAnswers
    };
  }, [session]);

  return {
    session,
    loading,
    error,
    initializeQuiz,
    submitAnswer,
    getCurrentQuestion,
    getResults,
    setSession
  };
}