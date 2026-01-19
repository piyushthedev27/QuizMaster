import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { ErrorHandler } from '@/lib/error-handling';
import { useWarningToast, useInfoToast } from '@/components/ui/toast';

interface UseRealtimeLeaderboardProps {
  onLeaderboardUpdate: () => void;
  onConnectionStatusChange?: (connected: boolean) => void;
  enabled?: boolean;
}

export function useRealtimeLeaderboard({
  onLeaderboardUpdate,
  onConnectionStatusChange,
  enabled = true
}: UseRealtimeLeaderboardProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const showWarningToast = useWarningToast();
  const showInfoToast = useInfoToast();

  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds

  const updateConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    onConnectionStatusChange?.(connected);
  }, [onConnectionStatusChange]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setIsReconnecting(false);
      showWarningToast(
        'Real-time updates are unavailable. The leaderboard will update when you refresh the page.',
        'Connection Failed'
      );
      return;
    }

    setIsReconnecting(true);
    setReconnectAttempts(prev => prev + 1);

    const delay = baseReconnectDelay * Math.pow(1.5, reconnectAttempts);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect to real-time updates (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
      setupRealtimeSubscription();
    }, delay);
  }, [reconnectAttempts, maxReconnectAttempts, showWarningToast]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      channelRef.current = null;
      updateConnectionStatus(false);
    }
  }, [updateConnectionStatus]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!enabled) return;

    // Clean up existing subscription
    cleanup();

    try {
      // Create a channel for quiz_attempts table changes
      const channel = supabase
        .channel('leaderboard-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'quiz_attempts'
          },
          (payload) => {
            console.log('New quiz attempt detected:', payload);
            // Trigger leaderboard refresh when new attempt is inserted
            onLeaderboardUpdate();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'quiz_attempts'
          },
          (payload) => {
            console.log('Quiz attempt updated:', payload);
            // Trigger leaderboard refresh when attempt is updated
            onLeaderboardUpdate();
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          
          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            console.log('Successfully subscribed to leaderboard updates');
            updateConnectionStatus(true);
            setReconnectAttempts(0);
            setIsReconnecting(false);
            
            if (reconnectAttempts > 0) {
              showInfoToast('Real-time updates restored', 'Connection Restored');
            }
          } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
            console.error('Error subscribing to leaderboard updates');
            const error = ErrorHandler.handleError(
              new Error('Real-time subscription failed'),
              'realtime'
            );
            ErrorHandler.logError(error, 'Realtime Subscription');
            updateConnectionStatus(false);
            attemptReconnect();
          } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
            console.warn('Leaderboard subscription timed out');
            updateConnectionStatus(false);
            attemptReconnect();
          } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
            console.log('Leaderboard subscription closed');
            updateConnectionStatus(false);
            if (enabled && reconnectAttempts < maxReconnectAttempts) {
              attemptReconnect();
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      const appError = ErrorHandler.handleError(error, 'realtime');
      ErrorHandler.logError(appError, 'Realtime Setup');
      updateConnectionStatus(false);
      attemptReconnect();
    }
  }, [onLeaderboardUpdate, enabled, updateConnectionStatus, attemptReconnect, cleanup, reconnectAttempts, showInfoToast]);

  // Force reconnect function
  const forceReconnect = useCallback(() => {
    setReconnectAttempts(0);
    setIsReconnecting(false);
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  useEffect(() => {
    setupRealtimeSubscription();
    
    return cleanup;
  }, [setupRealtimeSubscription, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected,
    isReconnecting,
    reconnectAttempts,
    forceReconnect,
    cleanup
  };
}