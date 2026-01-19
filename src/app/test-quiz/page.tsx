'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useTimer } from '@/hooks/useTimer';
import { AnswerOption } from '@/types/question';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

function TestQuizContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const {
    session,
    loading,
    error,
    initializeQuiz,
    submitAnswer,
    getCurrentQuestion
  } = useQuizSession();

  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = getCurrentQuestion();

  // Timer with auto-submit on timeout
  const timer = useTimer({
    onTimeout: () => {
      if (!showFeedback && currentQuestion) {
        console.log('Timer timeout - auto-submitting');
        handleAnswerSelect(null); // Auto-submit with no answer
      }
    }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Reset answer selection when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [session?.currentQuestionIndex]);

  // Start timer when session is active
  useEffect(() => {
    if (session && session.status === 'active' && !showFeedback) {
      console.log('Starting timer for test quiz');
      timer.resetAndStartTimer();
    }
  }, [session?.currentQuestionIndex, showFeedback, timer]);

  // Stop timer when showing feedback
  useEffect(() => {
    if (showFeedback) {
      timer.stopTimer();
    }
  }, [showFeedback, timer]);

  const handleAnswerSelect = async (option: AnswerOption | null) => {
    if (showFeedback) return;

    console.log('Test quiz - answer selected:', option);
    setSelectedAnswer(option);
    setShowFeedback(true);

    // Show feedback for 2 seconds then submit
    setTimeout(async () => {
      console.log('Test quiz - submitting answer:', option);
      await submitAnswer(option);
      setShowFeedback(false);
    }, 2000);
  };

  const handleStartQuiz = () => {
    console.log('Test quiz - starting quiz');
    initializeQuiz(10); // Start with 10 questions (minimum valid count)
  };

  const getOptionStyle = (option: AnswerOption) => {
    if (!showFeedback) {
      return selectedAnswer === option 
        ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-md transform scale-[1.02]' 
        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300';
    }

    // Show feedback
    const isCorrect = currentQuestion?.answer === option;
    const isSelected = selectedAnswer === option;

    if (isCorrect) {
      return cn(
        'bg-green-100 border-green-500 text-green-900 shadow-lg',
        'animate-pulse ring-2 ring-green-200',
        isSelected && 'ring-4 ring-green-300'
      );
    }
    
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-900 shadow-lg animate-pulse ring-2 ring-red-200';
    }

    return 'bg-gray-50 border-gray-200 text-gray-500 opacity-60';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 py-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-b-2 border-blue-600"
            />
            <p className="text-lg font-medium">Loading Quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 py-8">
            <div className="text-red-600 text-4xl">⚠️</div>
            <p className="text-lg font-medium text-red-600">Quiz Error</p>
            <p className="text-sm text-gray-600 text-center">{error}</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded max-w-full overflow-auto">
              <strong>Debug:</strong> {JSON.stringify({ error }, null, 2)}
            </div>
            <Button onClick={handleStartQuiz} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.status === 'completed') {
    const results = {
      totalQuestions: session.questions.length,
      correctAnswers: session.answers.filter((answer, index) => 
        answer === session.questions[index]?.answer
      ).length
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-600">
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <p className="text-lg">
                You scored {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
              </p>
              <Button onClick={handleStartQuiz} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 py-8">
            <p className="text-lg font-medium">Ready to Start Quiz?</p>
            <Button onClick={handleStartQuiz}>
              Start Test Quiz (10 Questions)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </div>
            <div className={cn(
              "text-2xl font-bold px-4 py-2 rounded-lg",
              timer.timeRemaining <= 3 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            )}>
              {timer.timeRemaining}s
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Timer Active: {timer.isActive ? 'Yes' : 'No'}</p>
          <p>Timer Remaining: {timer.timeRemaining}s</p>
          <p>Show Feedback: {showFeedback ? 'Yes' : 'No'}</p>
          <p>Selected Answer: {selectedAnswer || 'None'}</p>
          <p>Correct Answer: {currentQuestion.answer}</p>
        </div>

        {/* Question Display */}
        <motion.div
          key={`question-${session.currentQuestionIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option) => (
                <motion.div
                  key={option}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      console.log('Button clicked for option:', option);
                      handleAnswerSelect(option);
                    }}
                    disabled={showFeedback}
                    className={cn(
                      'w-full p-4 h-auto text-left justify-start transition-all duration-200',
                      'border-2 rounded-lg',
                      getOptionStyle(option),
                      showFeedback && 'cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm">
                        {option.toUpperCase()}
                      </span>
                      <span className="flex-1 text-base">
                        {currentQuestion.options[option]}
                      </span>
                      
                      {/* Feedback Icons */}
                      {showFeedback && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="flex-shrink-0"
                        >
                          {currentQuestion.answer === option ? (
                            <span className="text-green-600 text-xl">✓</span>
                          ) : selectedAnswer === option ? (
                            <span className="text-red-600 text-xl">✗</span>
                          ) : null}
                        </motion.span>
                      )}
                    </div>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Message */}
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4"
          >
            <p className="text-lg font-medium">
              {selectedAnswer === currentQuestion.answer 
                ? '✅ Correct!' 
                : '❌ Incorrect'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {session.currentQuestionIndex < session.questions.length - 1 
                ? 'Moving to next question...' 
                : 'Calculating results...'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TestQuizPage() {
  return <TestQuizContent />;
}