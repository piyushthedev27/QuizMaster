'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { QuizResults } from '@/components/quiz/QuizResults';
import { useQuizResultsSimple } from '@/hooks/useQuizResultsSimple';
import { useAuth } from '@/hooks/useAuth';
import { QuizSession } from '@/types/question';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function QuizResultsTestContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { results, loading, error, completeQuiz } = useQuizResultsSimple();
  const [sessionData, setSessionData] = useState<QuizSession | null>(null);

  useEffect(() => {
    console.log('Test results page - checking auth and session');
    console.log('User:', user);
    console.log('Auth loading:', authLoading);
    
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      console.log('No user, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Get session data from localStorage
    const savedSession = localStorage.getItem('quizSession');
    console.log('Saved session from localStorage:', savedSession);
    
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        console.log('Parsed session:', session);
        console.log('Session status:', session.status);
        setSessionData(session);
        
        // Complete the quiz if it's finished
        if (session.status === 'completed') {
          console.log('Session is completed, calling completeQuiz');
          completeQuiz(session).then((result) => {
            console.log('CompleteQuiz result:', result);
            // Clear the saved session after successful completion
            localStorage.removeItem('quizSession');
          }).catch((error) => {
            console.error('CompleteQuiz error:', error);
          });
        } else {
          console.log('Session is not completed, status:', session.status);
        }
      } catch (err) {
        console.error('Error parsing saved session:', err);
        router.push('/quiz');
      }
    } else {
      console.log('No session data found, redirecting to quiz');
      // No session data found, redirect to quiz
      router.push('/quiz');
    }
  }, [user, authLoading, router, completeQuiz]);

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
                Error Loading Results (TEST)
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
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✅ TEST VERSION - Simple Quiz Completion Working!</p>
            <p className="text-green-600 text-sm mt-1">This is using the simplified endpoint without database operations.</p>
          </div>
          <QuizResults
            results={results}
            onRetakeQuiz={handleRetakeQuiz}
            onViewLeaderboard={handleViewLeaderboard}
            onBackToDashboard={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Show loading while calculating results OR if no session data
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">🧪 TEST VERSION - Processing Results...</p>
          <p className="text-blue-600 text-sm mt-1">Testing simple quiz completion without database operations.</p>
          <div className="mt-2 text-xs text-blue-500">
            <p>Session Data: {sessionData ? 'Found' : 'Not Found'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            {sessionData && (
              <div className="mt-1">
                <p>Session Status: {sessionData.status}</p>
                <p>Questions: {sessionData.questions?.length || 0}</p>
                <p>Answers: {sessionData.answers?.length || 0}</p>
              </div>
            )}
          </div>
        </div>
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
      </div>
    </div>
  );
}

export default function QuizResultsTestPage() {
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
                Loading Test Results...
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    }>
      <QuizResultsTestContent />
    </Suspense>
  );
}