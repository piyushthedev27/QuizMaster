import { useEffect, useCallback, useState } from 'react';
import { QuizSession } from '@/types/question';

const QUIZ_STORAGE_KEY = 'quizmaster_active_session';
const QUIZ_BACKUP_INTERVAL = 5000; // Backup every 5 seconds
const SYNC_RETRY_INTERVAL = 10000; // Retry sync every 10 seconds

interface UseQuizPersistenceProps {
  session: QuizSession | null;
  onSessionRestore?: (session: QuizSession) => void;
  isOnline?: boolean;
}

interface PendingSync {
  session: QuizSession;
  timestamp: number;
  retryCount: number;
}

export function useQuizPersistence({ session, onSessionRestore, isOnline = true }: UseQuizPersistenceProps) {
  const [pendingSync, setPendingSync] = useState<PendingSync | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // Save quiz state to localStorage periodically
  useEffect(() => {
    if (!session || session.status !== 'active') {
      // Clear storage when quiz is not active
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      setPendingSync(null);
      return;
    }

    const saveSession = () => {
      try {
        const sessionData = {
          ...session,
          lastSaved: new Date().toISOString(),
          needsSync: !isOnline // Mark for sync if offline
        };
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(sessionData));
        
        // If offline, mark for pending sync
        if (!isOnline) {
          setPendingSync({
            session: sessionData,
            timestamp: Date.now(),
            retryCount: 0
          });
        }
      } catch (error) {
        console.warn('Failed to save quiz session to localStorage:', error);
      }
    };

    // Save immediately
    saveSession();

    // Set up periodic saving
    const interval = setInterval(saveSession, QUIZ_BACKUP_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [session, isOnline]);

  // Handle sync when connection is restored
  useEffect(() => {
    if (!isOnline || !pendingSync) return;

    const syncPendingData = async () => {
      try {
        // Attempt to sync the pending session data with server
        const response = await fetch('/api/quiz/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: pendingSync.session })
        });

        if (response.ok) {
          // Sync successful, clear pending sync
          setPendingSync(null);
          setLastSyncTime(Date.now());
          
          // Update local storage to remove sync flag
          const savedData = localStorage.getItem(QUIZ_STORAGE_KEY);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            delete parsedData.needsSync;
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(parsedData));
          }
        } else {
          throw new Error('Sync failed');
        }
      } catch (error) {
        console.warn('Failed to sync session data:', error);
        
        // Increment retry count and schedule retry if under limit
        if (pendingSync.retryCount < 5) {
          setPendingSync(prev => prev ? {
            ...prev,
            retryCount: prev.retryCount + 1
          } : null);
          
          // Retry with exponential backoff
          setTimeout(() => {
            syncPendingData();
          }, SYNC_RETRY_INTERVAL * Math.pow(2, pendingSync.retryCount));
        } else {
          // Max retries reached, clear pending sync
          console.error('Max sync retries reached, clearing pending sync');
          setPendingSync(null);
        }
      }
    };

    // Start sync after a short delay
    const syncTimeout = setTimeout(syncPendingData, 1000);
    
    return () => clearTimeout(syncTimeout);
  }, [isOnline, pendingSync]);

  // Restore quiz state from localStorage on component mount
  const restoreSession = useCallback(() => {
    try {
      const savedData = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (!savedData) return null;

      const parsedSession = JSON.parse(savedData);
      
      // Check if session is still valid (not too old)
      const lastSaved = new Date(parsedSession.lastSaved);
      const now = new Date();
      const timeDiff = now.getTime() - lastSaved.getTime();
      const maxAge = 30 * 60 * 1000; // 30 minutes
      
      if (timeDiff > maxAge) {
        localStorage.removeItem(QUIZ_STORAGE_KEY);
        return null;
      }

      // Convert date strings back to Date objects
      const restoredSession: QuizSession = {
        ...parsedSession,
        startTime: new Date(parsedSession.startTime),
        endTime: parsedSession.endTime ? new Date(parsedSession.endTime) : undefined
      };

      // If session needs sync, set up pending sync
      if (parsedSession.needsSync) {
        setPendingSync({
          session: restoredSession,
          timestamp: Date.now(),
          retryCount: 0
        });
      }

      return restoredSession;
    } catch (error) {
      console.warn('Failed to restore quiz session from localStorage:', error);
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      return null;
    }
  }, []);

  // Clear saved session
  const clearSavedSession = useCallback(() => {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    setPendingSync(null);
  }, []);

  // Check if there's a saved session available
  const hasSavedSession = useCallback(() => {
    try {
      const savedData = localStorage.getItem(QUIZ_STORAGE_KEY);
      return !!savedData;
    } catch {
      return false;
    }
  }, []);

  // Force sync pending data
  const forceSyncPendingData = useCallback(async () => {
    if (!pendingSync || !isOnline) return false;

    try {
      const response = await fetch('/api/quiz/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: pendingSync.session })
      });

      if (response.ok) {
        setPendingSync(null);
        setLastSyncTime(Date.now());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [pendingSync, isOnline]);

  return {
    restoreSession,
    clearSavedSession,
    hasSavedSession,
    forceSyncPendingData,
    hasPendingSync: !!pendingSync,
    lastSyncTime
  };
}