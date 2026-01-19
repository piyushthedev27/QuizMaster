'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnswerOption } from '@/types/question';
import { cn } from '@/lib/utils';

interface AnswerFeedbackProps {
  selectedAnswer: AnswerOption;
  correctAnswer: AnswerOption;
  isVisible: boolean;
  className?: string;
}

export function AnswerFeedback({ 
  selectedAnswer, 
  correctAnswer, 
  isVisible, 
  className 
}: AnswerFeedbackProps) {
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm',
            className
          )}
        >
          <motion.div 
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.5 
            }}
            className={cn(
              'bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4',
              isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            )}
          >
            {/* Feedback Icon and Message */}
            <div className="text-center space-y-4">
              {isCorrect ? (
                <>
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="text-6xl"
                  >
                    ✅
                  </motion.div>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="space-y-2"
                  >
                    <h3 className="text-2xl font-bold text-green-700">Correct!</h3>
                    <p className="text-gray-600">
                      Great job! You selected option <span className="font-semibold">{selectedAnswer.toUpperCase()}</span>
                    </p>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div 
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="text-6xl"
                  >
                    ❌
                  </motion.div>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="space-y-2"
                  >
                    <h3 className="text-2xl font-bold text-red-700">Incorrect</h3>
                    <p className="text-gray-600">
                      You selected <span className="font-semibold text-red-600">{selectedAnswer.toUpperCase()}</span>, 
                      but the correct answer was <span className="font-semibold text-green-600">{correctAnswer.toUpperCase()}</span>
                    </p>
                  </motion.div>
                </>
              )}
              
              {/* Progress indicator */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="pt-4"
              >
                <div className="text-sm text-gray-500">Moving to next question...</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "linear", delay: 0.8 }}
                    className="bg-blue-600 h-1 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}