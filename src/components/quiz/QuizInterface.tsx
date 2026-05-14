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
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(questionCount);
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
    
    console.log('Starting quiz with', selectedQuestionCount, 'questions', unit ? `for ${unit}` : '', `with ${selectedTimePerQuestion}s per question`);
    setShowTimeSelection(false);
    initializeQuiz(selectedQuestionCount, unit);
  };

  const handleTimeSelection = (timeInSeconds: number) => {
    setSelectedTimePerQuestion(timeInSeconds);
  };

  const handleQuestionCountSelection = (count: number) => {
    setSelectedQuestionCount(count);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-md">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-md">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-4xl mx-auto border-0 bg-white/80 backdrop-blur-md shadow-2xl">
          <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6 py-4 sm:py-6 px-4 sm:px-6">
            {showTimeSelection ? (
              // Enhanced Time Selection Screen
              <div className="w-full flex flex-col items-center">
                <div className="text-center space-y-2 max-w-2xl mb-4 sm:mb-6">
                  <div className="p-3 bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-2 sm:mb-4 shadow-sm">
                    <span className="text-2xl sm:text-3xl">🧠</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 px-2 tracking-tight">
                    Ready to Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Quiz?</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 px-4 mt-2 leading-relaxed">
                    Test your knowledge with our comprehensive quiz featuring <strong className="text-indigo-900">{selectedQuestionCount}</strong> carefully selected questions.
                  </p>
                </div>

                {/* Number of Questions Selection */}
                <div className="w-full max-w-3xl mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center gap-2">
                    <span className="text-xl">🎯</span> 
                    <span>Choose Number of Questions</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { count: 10, label: 'Quick', color: 'from-green-400 to-emerald-500', activeRing: 'ring-green-400' },
                      { count: 30, label: 'Standard', color: 'from-blue-400 to-indigo-500', activeRing: 'ring-indigo-400' },
                      { count: 50, label: 'Long', color: 'from-purple-400 to-fuchsia-500', activeRing: 'ring-purple-400' },
                      { count: 100, label: 'Marathon', color: 'from-orange-400 to-red-500', activeRing: 'ring-orange-400' }
                    ].map((option) => (
                      <motion.div
                        key={option.count}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 h-full border-2 ${
                            selectedQuestionCount === option.count 
                              ? `border-transparent ring-2 ring-offset-1 ${option.activeRing} shadow-md bg-white` 
                              : 'border-gray-100 bg-white/50 hover:bg-white hover:shadow-sm hover:border-indigo-100'
                          }`}
                          onClick={() => handleQuestionCountSelection(option.count)}
                        >
                          <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-between relative overflow-hidden">
                            {selectedQuestionCount === option.count && (
                              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${option.color} opacity-5 rounded-bl-[80px] transition-all`} />
                            )}
                            <div className="relative z-10">
                              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${option.color} rounded-xl mb-2 sm:mb-3 shadow-md transform ${selectedQuestionCount === option.count ? 'scale-105' : ''} transition-all duration-300`}>
                                <span className="text-white font-bold text-lg">{option.count}</span>
                              </div>
                              <div className="font-bold text-sm sm:text-base mb-0.5 text-gray-900">
                                {option.label}
                              </div>
                            </div>
                            {selectedQuestionCount === option.count && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute bottom-2 right-2"
                              >
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white text-[8px] font-bold">✓</span>
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Time Selection */}
                <div className="w-full max-w-3xl mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center gap-2">
                    <span className="text-xl">⏱️</span> 
                    <span>Choose Time Per Question</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { time: 10, label: 'Quick', description: 'Fast-paced challenge', color: 'from-orange-400 to-red-500', activeRing: 'ring-red-400' },
                      { time: 20, label: 'Standard', description: 'Balanced timing', color: 'from-blue-400 to-indigo-500', activeRing: 'ring-indigo-400' },
                      { time: 30, label: 'Relaxed', description: 'Take your time', color: 'from-emerald-400 to-teal-500', activeRing: 'ring-teal-400' }
                    ].map((option) => (
                      <motion.div
                        key={option.time}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 h-full border-2 ${
                            selectedTimePerQuestion === option.time 
                              ? `border-transparent ring-2 ring-offset-1 ${option.activeRing} shadow-md bg-white` 
                              : 'border-gray-100 bg-white/50 hover:bg-white hover:shadow-sm hover:border-indigo-100'
                          }`}
                          onClick={() => handleTimeSelection(option.time)}
                        >
                          <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-between relative overflow-hidden">
                            {selectedTimePerQuestion === option.time && (
                              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${option.color} opacity-5 rounded-bl-[80px] transition-all`} />
                            )}
                            <div className="relative z-10">
                              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${option.color} rounded-xl mb-2 sm:mb-3 shadow-md transform ${selectedTimePerQuestion === option.time ? 'rotate-3 scale-105' : ''} transition-all duration-300`}>
                                <span className="text-white font-bold text-lg sm:text-xl">{option.time}s</span>
                              </div>
                              <div className="font-bold text-base sm:text-lg mb-0.5 text-gray-900">
                                {option.label}
                              </div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                            {selectedTimePerQuestion === option.time && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute bottom-2 right-2"
                              >
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white text-[10px] font-bold">✓</span>
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-indigo-800 bg-indigo-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-indigo-100 flex items-start gap-2 sm:gap-3 shadow-sm">
                    <span className="text-lg">💡</span>
                    <p className="pt-0.5 leading-relaxed">Questions will <strong>auto-skip</strong> if time runs out. Choose a timing that matches your comfort level and start learning!</p>
                  </div>
                </div>

                {/* Quiz Instructions and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl items-center">
                  <Card className="bg-white/60 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">📋</span> 
                        <span>Quick Instructions</span>
                      </h3>
                      <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm">1</div>
                          <p className="pt-0.5">You have <strong className="text-indigo-900">{selectedTimePerQuestion || 'X'} seconds</strong> per question.</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm">2</div>
                          <p className="pt-0.5">Choose the <strong className="text-indigo-900">best answer</strong> from the options.</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm">3</div>
                          <p className="pt-0.5">Get <strong className="text-indigo-900">immediate feedback</strong> after each answer.</p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-3 w-full justify-center h-full">
                    <Button 
                      onClick={handleStartQuiz} 
                      size="lg" 
                      className={`w-full py-4 sm:py-6 text-base sm:text-lg font-bold shadow-md transition-all duration-300 rounded-xl ${
                        selectedTimePerQuestion 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-[1.02] hover:shadow-indigo-500/25' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200 shadow-none'
                      }`}
                      disabled={!selectedTimePerQuestion}
                    >
                      {selectedTimePerQuestion ? '🚀 Start Challenge' : 'Select Time'} 
                    </Button>
                    <Button 
                      onClick={() => router.push('/dashboard')} 
                      variant="ghost" 
                      size="lg" 
                      className="w-full text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-xl py-3 sm:py-4 transition-colors text-sm sm:text-base"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Loading/initializing screen
              <>
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <span className="text-3xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Initializing Quiz...</h2>
                  <p className="text-gray-600 max-w-md">
                    Setting up your quiz with {selectedQuestionCount} questions and {selectedTimePerQuestion}s per question.
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
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* Enhanced Header with Timer and Progress */}
        <div className="flex-shrink-0 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
            <div className="text-center sm:text-left flex-1 w-full sm:w-auto">
              <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <span>Question {session.currentQuestionIndex + 1} of {session.questions.length}</span>
                <span className="text-[10px] sm:text-xs font-normal text-gray-600">
                  {selectedTimePerQuestion}s per question • {Math.round(((session.currentQuestionIndex + 1) / session.questions.length) * 100)}% complete
                </span>
              </div>
            </div>
            
            {/* Right Side: Timer & Grid Indicator */}
            <div className="flex flex-col items-center sm:items-end flex-shrink-0 gap-3">
              {/* Enhanced Timer Component */}
              <SimpleTimer
                duration={selectedTimePerQuestion || 10}
                isActive={timerActive && !showFeedback}
                onTimeout={handleTimerTimeout}
                key={`timer-${session.currentQuestionIndex}-${questionStartTime}`}
              />

              {/* Question Grid Indicator */}
              <div className="flex flex-wrap gap-[3px] sm:gap-1 max-w-[200px] sm:max-w-[280px] justify-center sm:justify-end max-h-[60px] sm:max-h-[80px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                {session.questions.map((q, idx) => {
                  const isLarge = session.questions.length > 50;
                  let boxClass = `${isLarge ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[2px]' : 'w-3 h-3 sm:w-4 sm:h-4 rounded-[3px]'} border shadow-sm transition-all duration-300 flex-shrink-0 `;
                  
                  if (idx < session.currentQuestionIndex) {
                    const ans = session.answers[idx];
                    if (ans === q.answer) {
                      boxClass += "bg-green-500 border-green-600";
                    } else if (ans === null) {
                      boxClass += "bg-orange-400 border-orange-500"; // Skipped/timeout
                    } else {
                      boxClass += "bg-red-500 border-red-600";
                    }
                  } else if (idx === session.currentQuestionIndex) {
                    if (showFeedback && selectedAnswer !== undefined) {
                      if (selectedAnswer === q.answer) {
                        boxClass += "bg-green-500 border-green-600 animate-pulse";
                      } else if (selectedAnswer === null) {
                        boxClass += "bg-orange-400 border-orange-500 animate-pulse";
                      } else {
                        boxClass += "bg-red-500 border-red-600 animate-pulse";
                      }
                    } else {
                      boxClass += "bg-indigo-500 border-indigo-600 animate-pulse ring-2 ring-indigo-300 ring-offset-1";
                    }
                  } else {
                    boxClass += "bg-white/60 border-indigo-200";
                  }
                  return <div key={idx} className={boxClass} title={`Question ${idx + 1}`} />;
                })}
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative w-full bg-white/50 backdrop-blur-sm rounded-full h-2 sm:h-3 shadow-inner border border-gray-100 mt-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out shadow-md relative overflow-hidden"
              style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
            </div>
          </div>
        </div>

        {/* Enhanced Question Display */}
        <motion.div
          key={`question-${session.currentQuestionIndex}`}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 overflow-hidden flex flex-col mb-2 sm:mb-4 min-h-0 relative z-0"
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md overflow-hidden ring-1 ring-white/50 flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3 sm:pb-4 bg-white/50 border-b border-gray-50/50 flex-shrink-0">
              <CardTitle className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-900 px-2 sm:px-0 font-bold">
                {currentQuestion.question}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
                <span className="px-2 py-1 bg-gray-100 rounded-full">{currentQuestion.difficulty}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{currentQuestion.category}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-5 flex-1 overflow-y-auto min-h-0">
              {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
                  whileHover={!showFeedback && timerActive ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!showFeedback && timerActive ? { scale: 0.99 } : {}}
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
                      'border-2 rounded-xl min-h-[50px] sm:min-h-[60px] whitespace-normal shadow-sm hover:shadow-md',
                      getOptionStyle(option),
                      (showFeedback || !timerActive) && 'cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                      <span className={cn(
                        "flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300",
                        selectedAnswer === option && !showFeedback && "animate-pulse"
                      )}>
                        {option.toUpperCase()}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm lg:text-base leading-relaxed break-words min-w-0 quiz-option-text">
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
            
            {/* Enhanced Status Message Overlay */}
            {showFeedback && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-[2px] rounded-xl transition-all duration-300">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-full max-w-sm"
                >
                  <Card className="bg-white shadow-2xl border-2 border-indigo-100">
                    <CardContent className="px-6 py-8 text-center flex flex-col items-center">
                      <div className="mb-4">
                        {selectedAnswer === null ? (
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <span className="text-3xl">⏰</span>
                          </div>
                        ) : selectedAnswer === currentQuestion.answer ? (
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner ring-4 ring-green-50">
                            <span className="text-3xl">✅</span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner ring-4 ring-red-50">
                            <span className="text-3xl">❌</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">
                        {selectedAnswer === null ? (
                          <span className="text-orange-600">Time's up!</span>
                        ) : selectedAnswer === currentQuestion.answer ? (
                          <span className="text-green-600">Correct!</span>
                        ) : (
                          <span className="text-red-600">Incorrect</span>
                        )}
                      </h3>
                      
                      <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">
                        {session.currentQuestionIndex < session.questions.length - 1 
                          ? 'Moving to next question...' 
                          : 'Calculating your results...'}
                      </p>
                      
                      {selectedAnswer !== currentQuestion.answer && selectedAnswer !== null && (
                        <div className="mt-4 w-full p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-xs sm:text-sm text-red-800">
                            Correct answer: <strong className="text-base ml-1">{currentQuestion.answer.toUpperCase()}</strong>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}