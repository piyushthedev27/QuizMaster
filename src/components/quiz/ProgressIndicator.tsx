'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  className?: string;
}

export function ProgressIndicator({ 
  currentQuestion, 
  totalQuestions, 
  className 
}: ProgressIndicatorProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          className="h-full bg-blue-600 rounded-full"
        />
      </div>
      
      {/* Progress Text */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex justify-between items-center text-sm"
      >
        <span className="text-gray-600">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <motion.span 
          key={Math.round(progressPercentage)}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-medium text-gray-900"
        >
          {Math.round(progressPercentage)}% Complete
        </motion.span>
      </motion.div>
    </div>
  );
}