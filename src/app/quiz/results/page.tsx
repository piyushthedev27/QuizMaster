'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { QuizResults } from '@/components/quiz/QuizResults';
import { useQuizResults } from '@/hooks/useQuizResults';
import { useAuth } from '@/hooks/useAuth';
import { QuizSession } from '@/types/question';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function QuizResultsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { results, loading, error, completeQuiz } = useQuizResults();
  const hasSubmitted = React.useRef(false);
  const [sessionData, setSessionData] = useState<QuizSession | null>(null);

  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // If we already have results or have already submitted, don't do anything
    if (results || hasSubmitted.current) return;

    // Get session data from localStorage
    const savedSession = localStorage.getItem('quizSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setSessionData(session);
        
        // Complete the quiz if it's finished
        if (session.status === 'completed' && !hasSubmitted.current) {
          hasSubmitted.current = true;
          completeQuiz(session).then((res) => {
            if (res) {
              // Only clear if successful
              localStorage.removeItem('quizSession');
            } else {
              // If failed, allow retry
              hasSubmitted.current = false;
            }
          }).catch(() => {
            hasSubmitted.current = false;
          });
        }
      } catch (err) {
        console.error('Error parsing saved session:', err);
        router.push('/quiz');
      }
    } else if (!results && !loading) {
      // No session data found and not currently loading results, redirect to quiz
      router.push('/quiz');
    }
  }, [user, authLoading, router, completeQuiz, results, loading]);

  const handleRetakeQuiz = () => {
    // Clear any saved session data
    localStorage.removeItem('quizSession');
    router.push('/dashboard');
  };

  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 py-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-b-2 border-blue-600"
              />
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-lg font-medium"
              >
                Loading...
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 py-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-red-600 text-4xl"
              >
                ⚠️
              </motion.div>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-lg font-medium text-red-600"
              >
                Error Loading Results
              </motion.p>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="text-sm text-gray-600 text-center"
              >
                {error}
              </motion.p>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex gap-3"
              >
                <Button onClick={handleRetakeQuiz} variant="outline">
                  Retake Quiz
                </Button>
                <Button onClick={handleBackToDashboard}>
                  Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show results if available
  if (results) {
    return (
      <QuizResults
        results={results}
        onRetakeQuiz={handleRetakeQuiz}
        onViewLeaderboard={handleViewLeaderboard}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  // Show loading while calculating results
  return (
    <QuizResults
      results={{
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        timeTaken: 0,
        score: 0
      }}
      loading={true}
    />
  );
}

export default function QuizResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 py-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-b-2 border-blue-600"
              />
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-lg font-medium"
              >
                Loading Results...
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    }>
      <QuizResultsContent />
    </Suspense>
  );
}