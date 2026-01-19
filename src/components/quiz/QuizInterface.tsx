'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuizSession } from '@/hooks/useQuizSession';
import { AnswerOption } from '@/types/question';
import { SimpleTimer } from './SimpleTimer';

interface QuizInterfaceProps {
  userId: string;
  questionCount?: number;
  unit?: string;
}

export function QuizInterface({ questionCount = 10, unit }: QuizInterfaceProps) {
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
  const [timerActive, setTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = getCurrentQuestion();

  // Reset answer selection and start timer when question changes
  useEffect(() => {
    if (session && session.status === 'active' && currentQuestion) {
      console.log('New question loaded, resetting state');
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
      
      // Start timer after a small delay to ensure state is stable
      setTimeout(() => {
        setTimerActive(true);
      }, 200);
    }
  }, [session?.currentQuestionIndex, currentQuestion]);

  // Handle quiz completion
  useEffect(() => {
    if (session?.status === 'completed') {
      setTimerActive(false);
      // Save session to localStorage for results page
      localStorage.setItem('quizSession', JSON.stringify(session));
      // Navigate to results page
      router.push('/quiz/results');
    }
  }, [session?.status, router]);

  const handleAnswerSelect = async (option: AnswerOption) => {
    if (showFeedback || !timerActive) return;

    console.log('Answer selected:', option);
    setSelectedAnswer(option);
    setShowFeedback(true);
    setTimerActive(false); // Stop timer

    // Show feedback for 2 seconds then submit
    setTimeout(async () => {
      console.log('Submitting answer:', option);
      await submitAnswer(option);
      setShowFeedback(false);
    }, 2000);
  };

  const handleTimerTimeout = async () => {
    if (showFeedback) return; // Don't auto-submit if already showing feedback
    
    console.log('Timer timeout - auto-skipping question');
    setTimerActive(false);
    setShowFeedback(true);
    setSelectedAnswer(null); // No answer selected
    
    // Show "Time's up" message briefly then submit null answer
    setTimeout(async () => {
      console.log('Auto-submitting due to timeout');
      await submitAnswer(null); // Submit null for skipped question
      setShowFeedback(false);
    }, 1500);
  };

  const handleStartQuiz = () => {
    console.log('Starting quiz with', questionCount, 'questions', unit ? `for ${unit}` : '');
    initializeQuiz(questionCount, unit);
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
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center space-y-6 py-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Ready to Start Quiz?</h2>
              <p className="text-gray-600 max-w-md">
                Test your knowledge with our comprehensive quiz featuring {questionCount} carefully selected questions.
              </p>
            </div>

            {/* Quiz Instructions */}
            <Card className="w-full bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <span>📋</span> Quiz Instructions
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p>You have <strong>10 seconds</strong> to answer each question</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p>Questions will <strong>auto-skip</strong> if time runs out</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p>Choose the <strong>best answer</strong> from the 4 options (A, B, C, D)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p>You'll see <strong>immediate feedback</strong> after each answer</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <p>Your results will be saved to the <strong>leaderboard</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button onClick={handleStartQuiz} size="lg" className="px-8 py-3 text-lg">
                Start Quiz ({questionCount} Questions)
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg"
              >
                Back to Dashboard
              </Button>
            </div>
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
            
            {/* Simple Timer Component */}
            <SimpleTimer
              duration={10}
              isActive={timerActive && !showFeedback}
              onTimeout={handleTimerTimeout}
              key={`timer-${session.currentQuestionIndex}-${questionStartTime}`}
            />
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            />
          </div>
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
                    disabled={showFeedback || !timerActive}
                    className={cn(
                      'w-full p-4 h-auto text-left justify-start transition-all duration-200',
                      'border-2 rounded-lg',
                      getOptionStyle(option),
                      (showFeedback || !timerActive) && 'cursor-not-allowed'
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
              {selectedAnswer === null ? (
                '⏰ Time\'s up!'
              ) : selectedAnswer === currentQuestion.answer ? (
                '✅ Correct!'
              ) : (
                '❌ Incorrect'
              )}
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