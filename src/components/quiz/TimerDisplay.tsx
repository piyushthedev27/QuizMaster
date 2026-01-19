'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  timeRemaining: number;
  isActive: boolean;
  className?: string;
}

export function TimerDisplay({ timeRemaining, isActive, className }: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0');
  };

  const getTimerColor = () => {
    if (timeRemaining <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (timeRemaining <= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getProgressPercentage = () => {
    return (timeRemaining / 10) * 100;
  };

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      {/* Timer Circle */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          'relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300',
          getTimerColor(),
          !isActive && 'opacity-50'
        )}
        style={{
          animation: timeRemaining <= 3 && isActive ? 'pulse 0.5s infinite' : 'none'
        }}
      >
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 0 }}
            animate={{ 
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}` 
            }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        
        {/* Timer Text */}
        <motion.span 
          key={timeRemaining}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-bold"
        >
          {formatTime(timeRemaining)}
        </motion.span>
      </motion.div>

      {/* Timer Label */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-sm font-medium text-gray-600"
      >
        {isActive ? 'Time Remaining' : 'Timer Paused'}
      </motion.div>
    </div>
  );
}