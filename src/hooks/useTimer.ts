import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  onTimeout?: () => void;
  autoStart?: boolean;
}

export function useTimer(options: UseTimerOptions = {}) {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { onTimeout, autoStart = false } = options;

  // Clear interval helper
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    console.log('Starting timer with', timeRemaining, 'seconds');
    
    // Don't start if already running
    if (isActive && !isPaused && intervalRef.current) {
      console.log('Timer already running, skipping start');
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    
    // Clear any existing interval
    clearCurrentInterval();
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        console.log('Timer tick:', newTime);
        
        if (newTime <= 0) {
          console.log('Timer reached zero');
          // Clear interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsActive(false);
          setIsPaused(false);
          
          // Call timeout callback
          if (onTimeout) {
            setTimeout(() => onTimeout(), 0);
          }
          
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [timeRemaining, isActive, isPaused, onTimeout, clearCurrentInterval]);

  // Stop timer
  const stopTimer = useCallback(() => {
    console.log('Stopping timer');
    clearCurrentInterval();
    setIsActive(false);
    setIsPaused(false);
  }, [clearCurrentInterval]);

  // Reset timer
  const resetTimer = useCallback(() => {
    console.log('Resetting timer');
    clearCurrentInterval();
    setTimeRemaining(10);
    setIsActive(false);
    setIsPaused(false);
  }, [clearCurrentInterval]);

  // Reset and start timer
  const resetAndStartTimer = useCallback(() => {
    console.log('Reset and start timer');
    clearCurrentInterval();
    setTimeRemaining(10);
    setIsActive(true);
    setIsPaused(false);
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        console.log('Timer tick:', newTime);
        
        if (newTime <= 0) {
          console.log('Timer reached zero');
          // Clear interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsActive(false);
          setIsPaused(false);
          
          // Call timeout callback
          if (onTimeout) {
            setTimeout(() => onTimeout(), 0);
          }
          
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [onTimeout, clearCurrentInterval]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (isActive) {
      setIsPaused(false);
    }
  }, [isActive]);

  // Auto start effect
  useEffect(() => {
    if (autoStart && !isActive) {
      startTimer();
    }
  }, [autoStart, isActive, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCurrentInterval();
    };
  }, [clearCurrentInterval]);

  const formatTime = useCallback((seconds?: number) => {
    const time = seconds ?? timeRemaining;
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  const getProgressPercentage = useCallback(() => {
    return Math.round(((10 - timeRemaining) / 10) * 100);
  }, [timeRemaining]);

  return {
    timeRemaining,
    isActive,
    isPaused,
    isRunning: isActive && !isPaused,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    resetAndStartTimer,
    formatTime,
    getProgressPercentage
  };
}