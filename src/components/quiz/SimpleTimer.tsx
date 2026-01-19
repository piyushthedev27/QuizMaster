'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SimpleTimerProps {
  duration?: number; // Duration in seconds
  onTimeout: () => void;
  isActive: boolean;
  onReset?: () => void;
}

export function SimpleTimer({ duration = 10, onTimeout, isActive, onReset }: SimpleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeout = useRef(false);

  // Reset timer when isActive changes to true
  useEffect(() => {
    if (isActive) {
      console.log('SimpleTimer: Starting new countdown');
      setTimeLeft(duration);
      hasCalledTimeout.current = false;
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start countdown
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          console.log('SimpleTimer: Countdown tick:', newTime);
          
          if (newTime <= 0) {
            // Clear interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            // Call timeout only once
            if (!hasCalledTimeout.current) {
              hasCalledTimeout.current = true;
              console.log('SimpleTimer: Timeout reached, calling onTimeout');
              setTimeout(() => onTimeout(), 100);
            }
            
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      // Stop timer when not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when isActive changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, duration, onTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn(
      "text-2xl font-bold px-4 py-2 rounded-lg transition-colors duration-200",
      timeLeft <= 3 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-100 text-blue-600"
    )}>
      {timeLeft}s
    </div>
  );
}