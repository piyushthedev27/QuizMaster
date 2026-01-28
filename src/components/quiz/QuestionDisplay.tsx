'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Question, AnswerOption } from '@/types/question';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: AnswerOption | null;
  showFeedback: boolean;
  onAnswerSelect: (option: AnswerOption) => void;
  disabled: boolean;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  onAnswerSelect,
  disabled
}: QuestionDisplayProps) {
  const getOptionStyle = (option: AnswerOption) => {
    if (!showFeedback) {
      return selectedAnswer === option 
        ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-md transform scale-[1.02]' 
        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300';
    }

    // Show feedback
    const isCorrect = question.answer === option;
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

  const getOptionLabel = (option: AnswerOption) => {
    return option.toUpperCase();
  };

  return (
    <motion.div
      key={`question-${questionNumber}`}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.5 
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="w-full">
        <CardHeader>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex justify-between items-center"
          >
            <CardTitle className="text-lg font-semibold">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {question.difficulty} • {question.category}
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Question Text */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-lg sm:text-xl font-medium text-gray-900 leading-relaxed"
          >
            {question.question}
          </motion.div>

          {/* Answer Options */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="grid gap-3"
          >
            {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option, index) => (
              <motion.div
                key={option}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.5 + (index * 0.1), 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={!disabled && !showFeedback ? { 
                  scale: 1.02, 
                  transition: { duration: 0.2 } 
                } : {}}
                whileTap={!disabled && !showFeedback ? { 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                } : {}}
              >
                  <Button
                    variant="outline"
                    size="lg"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Button clicked for option:', option, 'disabled:', disabled);
                      if (!disabled) {
                        console.log('Calling onAnswerSelect with:', option);
                        onAnswerSelect(option);
                      }
                    }}
                    disabled={disabled}
                    className={cn(
                      'w-full p-3 sm:p-4 h-auto text-left justify-start transition-all duration-200',
                      'border-2 rounded-lg min-h-[60px] whitespace-normal',
                      getOptionStyle(option),
                      disabled && 'cursor-not-allowed'
                    )}
                  >
                  <div className="flex items-start gap-2 sm:gap-3 w-full min-w-0">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-xs sm:text-sm">
                      {getOptionLabel(option)}
                    </span>
                    <span className="flex-1 text-sm sm:text-base leading-relaxed break-words min-w-0 quiz-option-text">
                      {question.options[option]}
                    </span>
                    
                    {/* Feedback Icons */}
                    {showFeedback && (
                      <motion.span 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 15,
                          delay: 0.1 
                        }}
                        className="flex-shrink-0"
                      >
                        {question.answer === option ? (
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
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}