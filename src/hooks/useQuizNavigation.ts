import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseQuizNavigationProps {
  isQuizActive: boolean;
  onNavigationAttempt?: () => void;
}

export function useQuizNavigation({ isQuizActive, onNavigationAttempt }: UseQuizNavigationProps) {
  const router = useRouter();

  // Prevent browser back navigation during active quiz
  useEffect(() => {
    if (!isQuizActive) return;

    const handlePopState = (event: PopStateEvent) => {
      // Prevent navigation by pushing the current state back
      window.history.pushState(null, '', window.location.href);
      
      if (onNavigationAttempt) {
        onNavigationAttempt();
      }
    };

    // Push initial state to enable back button blocking
    window.history.pushState(null, '', window.location.href);
    
    // Listen for back button attempts
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isQuizActive, onNavigationAttempt]);

  // Prevent page refresh from resetting quiz state
  useEffect(() => {
    if (!isQuizActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Show confirmation dialog when user tries to leave/refresh
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isQuizActive]);

  // Disable keyboard shortcuts that could interfere with quiz
  useEffect(() => {
    if (!isQuizActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent F5 (refresh)
      if (event.key === 'F5') {
        event.preventDefault();
        if (onNavigationAttempt) {
          onNavigationAttempt();
        }
      }
      
      // Prevent Ctrl+R (refresh)
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        if (onNavigationAttempt) {
          onNavigationAttempt();
        }
      }
      
      // Prevent Alt+Left (back)
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (onNavigationAttempt) {
          onNavigationAttempt();
        }
      }
      
      // Prevent Backspace navigation (when not in input field)
      if (event.key === 'Backspace' && 
          event.target instanceof Element && 
          !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        event.preventDefault();
        if (onNavigationAttempt) {
          onNavigationAttempt();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuizActive, onNavigationAttempt]);

  const blockNavigation = useCallback(() => {
    // Additional method to programmatically block navigation
    if (isQuizActive) {
      window.history.pushState(null, '', window.location.href);
    }
  }, [isQuizActive]);

  return {
    blockNavigation
  };
}