import { useState, useCallback } from 'react';
import { QuizSession } from '@/types/question';
import { QuizResult } from '@/lib/result-calculator';

export function useQuizResultsSimple() {
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeQuiz = useCallback(async (session: QuizSession): Promise<QuizResult | null> => {
    console.log('useQuizResultsSimple - completeQuiz called with session:', session);
    
    if (session.status !== 'completed') {
      console.log('Session is not completed, status:', session.status);
      setError('Quiz session is not completed');
      return null;
    }

    console.log('Starting quiz completion...');
    setLoading(true);
    setError(null);

    try {
      console.log('Making API call to /api/quiz/complete-simple');
      const response = await fetch('/api/quiz/complete-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session })
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API error data:', errorData);
        throw new Error(errorData.error || 'Failed to complete quiz');
      }

      const responseData = await response.json();
      console.log('API response data:', responseData);
      
      const { results: quizResults } = responseData;
      console.log('Quiz results:', quizResults);
      
      setResults(quizResults);
      return quizResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete quiz';
      console.error('Quiz completion error:', err);
      setError(errorMessage);
      return null;
    } finally {
      console.log('Setting loading to false');
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