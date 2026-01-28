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
  const [selectedTimePerQuestion, setSelectedTimePerQuestion] = useState<number | null>(null);
  const [showTimeSelection, setShowTimeSelection] = useState(true);

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
    if (!selectedTimePerQuestion) return;
    
    console.log('Starting quiz with', questionCount, 'questions', unit ? `for ${unit}` : '', `with ${selectedTimePerQuestion}s per question`);
    setShowTimeSelection(false);
    initializeQuiz(questionCount, unit);
  };

  const handleTimeSelection = (timeInSeconds: number) => {
    setSelectedTimePerQuestion(timeInSeconds);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6 py-8 sm:py-12">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </motion.div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Loading Quiz...</p>
              <p className="text-sm text-gray-600">Preparing your questions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6 py-8 sm:py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center"
            >
              <span className="text-2xl sm:text-3xl">⚠️</span>
            </motion.div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-bold text-red-600 mb-2">Quiz Error</p>
              <p className="text-sm sm:text-base text-gray-600 text-center px-4 mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleStartQuiz} variant="outline" size="sm" className="w-full sm:w-auto">
                  Try Again
                </Button>
                <Button onClick={() => router.push('/dashboard')} size="sm" className="w-full sm:w-auto">
                  Back to Dashboard
                </Button>
              </div>
            </div>
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

  if (!session || !currentQuestion || showTimeSelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6 py-6 sm:py-8 px-4 sm:px-6">
            {showTimeSelection ? (
              // Enhanced Time Selection Screen
              <>
                <div className="text-center space-y-3 sm:space-y-4 max-w-2xl">
                  <div className="p-3 sm:p-4 bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🧠</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 px-2">Ready to Start Quiz?</h2>
                  <p className="text-sm sm:text-base text-gray-600 px-4">
                    Test your knowledge with our comprehensive quiz featuring {questionCount} carefully selected questions.
                  </p>
                </div>

                {/* Enhanced Time Selection */}
                <Card className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-indigo-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="text-lg sm:text-xl">⏱️</span> 
                      <span>Choose Time Per Question</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      {[
                        { time: 10, label: 'Quick', description: 'Fast-paced challenge', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300', textColor: 'text-red-700' },
                        { time: 20, label: 'Standard', description: 'Balanced timing', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300', textColor: 'text-blue-700' },
                        { time: 30, label: 'Relaxed', description: 'Take your time', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300', textColor: 'text-green-700' }
                      ].map((option) => (
                        <motion.div
                          key={option.time}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-300 h-full ${
                              selectedTimePerQuestion === option.time 
                                ? `${option.bgColor} ${option.borderColor} border-2 shadow-lg ring-2 ring-opacity-50 ring-offset-2` 
                                : 'bg-white border-gray-200 hover:shadow-lg hover:border-gray-300'
                            }`}
                            onClick={() => handleTimeSelection(option.time)}
                          >
                            <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-between">
                              <div>
                                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${option.color} rounded-full mb-2 sm:mb-3 shadow-md`}>
                                  <span className="text-white font-bold text-base sm:text-lg">{option.time}</span>
                                </div>
                                <div className={`font-bold text-base sm:text-lg mb-1 ${selectedTimePerQuestion === option.time ? option.textColor : 'text-gray-900'}`}>
                                  {option.time} seconds
                                </div>
                                <div className={`text-xs sm:text-sm font-medium mb-1 ${selectedTimePerQuestion === option.time ? option.textColor : 'text-gray-700'}`}>
                                  {option.label}
                                </div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                              {selectedTimePerQuestion === option.time && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="mt-2"
                                >
                                  <span className="text-lg">✓</span>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-xs sm:text-sm text-indigo-700 bg-indigo-100 p-3 rounded-lg border border-indigo-200">
                      <strong>💡 Tip:</strong> Questions will auto-skip if time runs out. Choose a timing that matches your comfort level!
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Quiz Instructions */}
                <Card className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="text-lg sm:text-xl">📋</span> 
                      <span>Quiz Instructions</span>
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <p>You have <strong className="text-blue-900">{selectedTimePerQuestion || 'X'} seconds</strong> to answer each question</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <p>Questions will <strong className="text-blue-900">auto-skip</strong> if time runs out</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <p>Choose the <strong className="text-blue-900">best answer</strong> from the 4 options (A, B, C, D)</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <p>You'll see <strong className="text-blue-900">immediate feedback</strong> after each answer</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        <p>Your results will be saved to the <strong className="text-blue-900">leaderboard</strong></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full max-w-md">
                  <Button 
                    onClick={handleStartQuiz} 
                    size="lg" 
                    className={`px-6 sm:px-8 py-3 text-sm sm:text-lg w-full sm:w-auto font-semibold shadow-lg transition-all duration-300 ${
                      selectedTimePerQuestion 
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!selectedTimePerQuestion}
                  >
                    {selectedTimePerQuestion ? '🚀 Start Quiz' : 'Select Time First'} ({questionCount} Questions)
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    variant="outline" 
                    size="lg" 
                    className="px-6 sm:px-8 py-3 text-sm sm:text-lg w-full sm:w-auto border-2 hover:bg-gray-50 transition-all duration-300"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              // Loading/initializing screen
              <>
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <span className="text-3xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Initializing Quiz...</h2>
                  <p className="text-gray-600 max-w-md">
                    Setting up your quiz with {questionCount} questions and {selectedTimePerQuestion}s per question.
                  </p>
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-b-2 border-blue-600"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header with Timer and Progress */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {selectedTimePerQuestion}s per question • {Math.round(((session.currentQuestionIndex + 1) / session.questions.length) * 100)}% complete
              </div>
            </div>
            
            {/* Enhanced Timer Component */}
            <div className="flex justify-center sm:justify-end">
              <SimpleTimer
                duration={selectedTimePerQuestion || 10}
                isActive={timerActive && !showFeedback}
                onTimeout={handleTimerTimeout}
                key={`timer-${session.currentQuestionIndex}-${questionStartTime}`}
              />
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-3 sm:h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 sm:h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Enhanced Question Display */}
        <motion.div
          key={`question-${session.currentQuestionIndex}`}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className="mb-4 sm:mb-6"
        >
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-900 px-2 sm:px-0">
                {currentQuestion.question}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
                <span className="px-2 py-1 bg-gray-100 rounded-full">{currentQuestion.difficulty}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{currentQuestion.category}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
                  whileHover={!showFeedback && timerActive ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!showFeedback && timerActive ? { scale: 0.98 } : {}}
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
                      'w-full p-3 sm:p-4 lg:p-5 h-auto text-left justify-start transition-all duration-300',
                      'border-2 rounded-xl min-h-[60px] sm:min-h-[70px] whitespace-normal shadow-md hover:shadow-lg',
                      getOptionStyle(option),
                      (showFeedback || !timerActive) && 'cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0">
                      <span className={cn(
                        "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300",
                        selectedAnswer === option && !showFeedback && "animate-pulse"
                      )}>
                        {option.toUpperCase()}
                      </span>
                      <span className="flex-1 text-sm sm:text-base lg:text-lg leading-relaxed break-words min-w-0 quiz-option-text">
                        {currentQuestion.options[option]}
                      </span>
                      
                      {/* Enhanced Feedback Icons */}
                      {showFeedback && (
                        <motion.span 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                          className="flex-shrink-0"
                        >
                          {currentQuestion.answer === option ? (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm sm:text-lg font-bold">✓</span>
                            </div>
                          ) : selectedAnswer === option ? (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm sm:text-lg font-bold">✗</span>
                            </div>
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

        {/* Enhanced Status Message */}
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-center"
          >
            <Card className="inline-block bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="px-6 py-4">
                <p className="text-lg sm:text-xl font-bold mb-2">
                  {selectedAnswer === null ? (
                    <span className="text-orange-600">⏰ Time's up!</span>
                  ) : selectedAnswer === currentQuestion.answer ? (
                    <span className="text-green-600">✅ Correct!</span>
                  ) : (
                    <span className="text-red-600">❌ Incorrect</span>
                  )}
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  {session.currentQuestionIndex < session.questions.length - 1 
                    ? 'Moving to next question...' 
                    : 'Calculating your results...'}
                </p>
                {selectedAnswer !== currentQuestion.answer && selectedAnswer !== null && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Correct answer: <strong>{currentQuestion.answer.toUpperCase()}</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}