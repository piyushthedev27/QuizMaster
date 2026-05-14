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
  
  const funnyMessages = [
    "Computing your score...",
    "Calling Modi for verification...",
    "Applying Newton's laws to your answers...",
    "Consulting with the AI overlords...",
    "Counting on our fingers...",
    "Checking if you used Google...",
    "Finding your global rank..."
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % funnyMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

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
                <div className="h-6 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={loadingMsgIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-gray-600 font-medium"
                    >
                      {funnyMessages[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12">
        {/* Compact Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg"
            >
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            
            <div className="text-center sm:text-left">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1"
              >
                Quiz Complete!
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-sm sm:text-base text-gray-600"
              >
                Congratulations! Here's your detailed performance breakdown.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Compact Performance Badge */}
        {performance && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6, type: "spring", stiffness: 150 }}
            className="mb-6 max-w-2xl mx-auto px-4"
          >
            <Card className={`${performance.bgColor} ${performance.borderColor} border shadow-md`}>
              <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-4 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 300 }}
                  className={`w-12 h-12 flex-shrink-0 bg-gradient-to-r ${performance.color} rounded-full flex items-center justify-center shadow-md`}
                >
                  <performance.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-center sm:text-left">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className={`text-xl sm:text-2xl font-bold ${performance.textColor} mb-1 leading-none`}
                  >
                    {performance.level}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                    className="text-sm text-gray-600 font-medium"
                  >
                    {results.accuracy}% accuracy • {results.correctAnswers} correct answers
                  </motion.p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 max-w-5xl mx-auto px-2 sm:px-4">
          {/* Score Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={showAnimation ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm shadow-md border-0 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center h-full">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-700">Score</span>
                </div>
                <AnimatePresence>
                  {currentMetric >= 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                        {results.correctAnswers}<span className="text-lg sm:text-xl text-gray-400">/{results.totalQuestions}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center font-medium">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                        {results.correctAnswers} correct
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Accuracy Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={showAnimation ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 2.0, duration: 0.5 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm shadow-md border-0 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center h-full">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-700">Accuracy</span>
                </div>
                <AnimatePresence>
                  {currentMetric >= 1 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                        {results.accuracy}%
                      </div>
                      <div className="text-xs text-gray-500 flex items-center font-medium">
                        <XCircle className="w-3 h-3 text-red-500 mr-1" />
                        {results.incorrectAnswers} incorrect
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={showAnimation ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm shadow-md border-0 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center h-full">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-700">Time</span>
                </div>
                <AnimatePresence>
                  {currentMetric >= 2 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                        {formatTime(results.timeTaken)}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Total duration
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
              initial={{ y: 30, opacity: 0 }}
              animate={showAnimation ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 2.4, duration: 0.5 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm shadow-md border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-center h-full">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Global Rank</span>
                  </div>
                  <AnimatePresence>
                    {currentMetric >= 3 && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: "spring" }}
                      >
                        <div className="flex items-baseline mb-1">
                          <span className="text-2xl sm:text-3xl font-bold text-yellow-600">#{results.globalRank}</span>
                          <Badge className={`ml-1 sm:ml-2 text-[10px] sm:text-xs ${rankDisplay.bgColor} ${rankDisplay.color} border-0 px-1.5 py-0`}>
                            {rankDisplay.suffix}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          All participants
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
          initial={{ y: 30, opacity: 0 }}
          animate={showAnimation ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 2.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
        >
          {onRetakeQuiz && (
            <Button 
              onClick={onRetakeQuiz}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto h-11"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          )}
          
          {onViewLeaderboard && (
            <Button 
              onClick={onViewLeaderboard}
              variant="outline"
              size="lg"
              className="border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto h-11 bg-white"
            >
              <Users className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          )}
          
          {onBackToDashboard && (
            <Button 
              onClick={onBackToDashboard}
              variant="secondary"
              size="lg"
              className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto h-11"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
}