'use client';

import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket';
import type { WebSocketEvent } from '@/types/orca';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const unsubMessage = socketService.onMessage((event) => {
      console.log('[WebSocket] Message received:', event);
      
      // Handle different message types
      if (event.type === 'initial') {
        // Initial data load
        setInitialData(event.data);
      } else if (event.type === 'incident_update') {
        // Real-time incident update
        const wsEvent: WebSocketEvent = {
          type: 'incident',
          timestamp: new Date().toISOString(),
          data: event.data
        };
        setLastEvent(wsEvent);
        setEvents(prev => [wsEvent, ...prev].slice(0, 100)); // Keep last 100
      }
    });

    const unsubConnect = socketService.onConnect(() => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
    });

    const unsubDisconnect = socketService.onDisconnect(() => {
      console.log('[WebSocket] Disconnected');
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
    socketService.send({
      type: 'message',
      data: data
    });
  }, []);

  return {
    isConnected,
    lastEvent,
    events,
    send,
    initialData,
  };
}
