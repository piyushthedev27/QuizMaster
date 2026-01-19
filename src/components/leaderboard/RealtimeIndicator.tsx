'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
}

export function RealtimeIndicator({ isConnected, lastUpdate }: RealtimeIndicatorProps) {
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);

  useEffect(() => {
    if (lastUpdate) {
      setShowUpdateAnimation(true);
      const timer = setTimeout(() => {
        setShowUpdateAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isConnected ? "default" : "secondary"}
        className={`flex items-center gap-1 ${
          isConnected 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isConnected ? 'Live' : 'Offline'}
      </Badge>
      
      {showUpdateAnimation && (
        <Badge
          variant="secondary"
          className="animate-pulse bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
        >
          <Activity className="h-3 w-3" />
          Updated
        </Badge>
      )}
      
      {lastUpdate && (
        <span className="text-xs text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}