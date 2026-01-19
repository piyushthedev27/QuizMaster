'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizResult } from '@/lib/result-calculator';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  RotateCcw, 
  Home, 
  Users,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  Medal,
  Crown
} from 'lucide-react';

interface QuizResultsProps {
  results: QuizResult;
  onRetakeQuiz?: () => void;
  onViewLeaderboard?: () => void;
  onBackToDashboard?: () => void;
  loading?: boolean;
}

export function QuizResults({ 
  results, 
  onRetakeQuiz, 
  onViewLeaderboard, 
  onBackToDashboard,
  loading = false 
}: QuizResultsProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
      if (results.accuracy >= 80) {
        setShowConfetti(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [results.accuracy]);

  useEffect(() => {
    if (showAnimation) {
      const interval = setInterval(() => {
        setCurrentMetric(prev => {
          if (prev < 4) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [showAnimation]);

  const getPerformanceLevel = () => {
    const { accuracy } = results;
    if (accuracy >= 95) return { 
      level: "Perfect!", 
      icon: Crown, 
      color: "from-yellow-400 to-yellow-600", 
      textColor: "text-yellow-700",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-300"
    };
    if (accuracy >= 90) return { 
      level: "Outstanding!", 
      icon: Trophy, 
      color: "from-yellow-500 to-orange-500", 
      textColor: "text-yellow-700",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      borderColor: "border-yellow-300"
    };
    if (accuracy >= 80) return { 
      level: "Excellent!", 
      icon: Medal, 
      color: "from-green-500 to-emerald-500", 
      textColor: "text-green-700",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-300"
    };
    if (accuracy >= 70) return { 
      level: "Great Job!", 
      icon: Award, 
      color: "from-blue-500 to-cyan-500", 
      textColor: "text-blue-700",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-300"
    };
    if (accuracy >= 60) return { 
      level: "Good Work!", 
      icon: Star, 
      color: "from-purple-500 to-pink-500", 
      textColor: "text-purple-700",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-300"
    };
    return null; // No performance badge for scores below 60%
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { suffix: 'st', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (rank === 2) return { suffix: 'nd', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    if (rank === 3) return { suffix: 'rd', color: 'text-amber-600', bgColor: 'bg-amber-100' };
    
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return { suffix: 'th', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    }
    
    switch (lastDigit) {
      case 1: return { suffix: 'st', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 2: return { suffix: 'nd', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 3: return { suffix: 'rd', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      default: return { suffix: 'th', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    }
  };

  const performance = getPerformanceLevel();
  const rankDisplay = results.globalRank ? getRankDisplay(results.globalRank) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center space-y-6 py-12">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </motion.div>
              <div className="space-y-2">
                <motion.h3 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-xl font-bold text-gray-900"
                >
                  Calculating Results...
                </motion.h3>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="text-sm text-gray-600"
                >
                  Computing your score and global ranking
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -100, 
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: 360,
                opacity: 0
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className={`absolute w-3 h-3 ${
                ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][i % 5]
              } rounded-full`}
            />
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Quiz Complete!
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Congratulations on completing the quiz! Here's your detailed performance breakdown.
          </motion.p>
        </motion.div>

        {/* Performance Badge */}
        {performance && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6, type: "spring", stiffness: 150 }}
            className="mb-12"
          >
            <Card className={`${performance.bgColor} ${performance.borderColor} border-2 shadow-xl`}>
              <CardContent className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 300 }}
                  className="flex items-center justify-center mb-4"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${performance.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <performance.icon className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className={`text-3xl font-bold ${performance.textColor} mb-2`}
                >
                  {performance.level}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="text-gray-600"
                >
                  You scored {results.accuracy}% accuracy with {results.correctAnswers} correct answers
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Score Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={showAnimation ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {currentMetric >= 0 && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {results.correctAnswers}<span className="text-2xl text-gray-400">/{results.totalQuestions}</span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        {results.correctAnswers} correct answers
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Accuracy Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={showAnimation ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 2.0, duration: 0.6 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {currentMetric >= 1 && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {results.accuracy}%
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <XCircle className="w-4 h-4 text-red-500 mr-1" />
                        {results.incorrectAnswers} incorrect answers
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={showAnimation ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 2.2, duration: 0.6 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Time Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {currentMetric >= 2 && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {formatTime(results.timeTaken)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total quiz duration
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rank Card */}
          {results.globalRank && rankDisplay && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={showAnimation ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 2.4, duration: 0.6 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    Global Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {currentMetric >= 3 && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                      >
                        <div className="flex items-baseline mb-2">
                          <span className="text-4xl font-bold text-yellow-600">#{results.globalRank}</span>
                          <Badge className={`ml-2 ${rankDisplay.bgColor} ${rankDisplay.color} border-0`}>
                            {rankDisplay.suffix}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Out of all participants
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={showAnimation ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 2.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          {onRetakeQuiz && (
            <Button 
              onClick={onRetakeQuiz}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake Quiz
            </Button>
          )}
          
          {onViewLeaderboard && (
            <Button 
              onClick={onViewLeaderboard}
              variant="outline"
              size="lg"
              className="border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              View Leaderboard
            </Button>
          )}
          
          {onBackToDashboard && (
            <Button 
              onClick={onBackToDashboard}
              variant="secondary"
              size="lg"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </motion.div>

        {/* Detailed Performance Breakdown */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={showAnimation ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 2.8, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{results.totalQuestions}</div>
                  <div className="text-sm font-medium text-blue-700">Total Questions</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">{results.correctAnswers}</div>
                  <div className="text-sm font-medium text-green-700">Correct</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                  <div className="text-3xl font-bold text-red-600 mb-1">{results.incorrectAnswers}</div>
                  <div className="text-sm font-medium text-red-700">Incorrect</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{results.accuracy}%</div>
                  <div className="text-sm font-medium text-purple-700">Accuracy Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}