'use client';

import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket';
import type { WebSocketEvent } from '@/types/orca';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);

  useEffect(() => {
    const unsubMessage = socketService.onMessage((event) => {
      setLastEvent(event);
      setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
    });

    const unsubConnect = socketService.onConnect(() => {
      setIsConnected(true);
    });

    const unsubDisconnect = socketService.onDisconnect(() => {
      setIsConnected(false);
    });

    socketService.connect();

    return () => {
      unsubMessage();
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const send = useCallback((data: unknown) => {
    socketService.send(data);
  }, []);

  return {
    isConnected,
    lastEvent,
    events,
    send,
  };
}
