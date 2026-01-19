import { useState, useCallback } from 'react';
import { QuizSession } from '@/types/question';
import { QuizResult } from '@/lib/result-calculator';

export function useQuizResults() {
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeQuiz = useCallback(async (session: QuizSession): Promise<QuizResult | null> => {
    if (session.status !== 'completed') {
      setError('Quiz session is not completed');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete quiz');
      }

      const { results: quizResults } = await response.json();
      setResults(quizResults);
      return quizResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete quiz';
      setError(errorMessage);
      console.error('Quiz completion error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    completeQuiz,
    clearResults
  };
}