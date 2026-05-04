'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/types/orca';

// Dummy AI responses
const DUMMY_RESPONSES: Record<string, { answer: string; confidence: number; relatedIncidents?: string[] }> = {
  'redis': {
    answer: 'Detected 94% memory usage on pod redis-0. The memory spike appears to be caused by a large key accumulation. Recommend increasing memory limit from 512Mi to 1Gi or implementing key eviction policies.',
    confidence: 0.87,
    relatedIncidents: ['INC-001'],
  },
  'slow': {
    answer: 'High latency detected on the API service. Root cause analysis shows the neo4j connection pool is exhausted, causing query queuing. Consider increasing the pool size from 10 to 25 connections.',
    confidence: 0.82,
    relatedIncidents: ['INC-002', 'INC-003'],
  },
  'cpu': {
    answer: 'CPU usage on backend pods is elevated at 82%. This correlates with increased traffic from the marketing campaign. Auto-scaling has been triggered and 2 additional pods are spinning up.',
    confidence: 0.91,
    relatedIncidents: ['INC-004'],
  },
  'default': {
    answer: 'Based on current system telemetry, I can see several active incidents. The most critical is the Redis memory spike (INC-001) which may be affecting downstream services. Would you like me to analyze a specific service or metric?',
    confidence: 0.75,
  },
};

function generateAIResponse(query: string): { answer: string; confidence: number; relatedIncidents?: string[] } {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('redis') || lowerQuery.includes('memory')) {
    return DUMMY_RESPONSES['redis'];
  }
  if (lowerQuery.includes('slow') || lowerQuery.includes('latency')) {
    return DUMMY_RESPONSES['slow'];
  }
  if (lowerQuery.includes('cpu') || lowerQuery.includes('backend')) {
    return DUMMY_RESPONSES['cpu'];
  }
  
  return DUMMY_RESPONSES['default'];
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real API call when backend is ready
      // const response = await api.sendChatMessage(query);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const response = generateAIResponse(query);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.answer,
        confidence: response.confidence,
        relatedIncidents: response.relatedIncidents,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
