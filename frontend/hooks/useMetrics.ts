'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MetricsDataPoint, TimeRange } from '@/types/orca';

// Generate dummy metrics data
function generateDummyMetrics(range: TimeRange): MetricsDataPoint[] {
  const now = new Date();
  const points: MetricsDataPoint[] = [];
  
  let intervals: number;
  let intervalMs: number;
  
  switch (range) {
    case '5m':
      intervals = 30;
      intervalMs = 10 * 1000; // 10 seconds
      break;
    case '15m':
      intervals = 30;
      intervalMs = 30 * 1000; // 30 seconds
      break;
    case '1h':
      intervals = 30;
      intervalMs = 2 * 60 * 1000; // 2 minutes
      break;
  }

  for (let i = intervals - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMs);
    const baseTime = time.getTime() / 1000;
    
    // Generate realistic-looking metrics with some variation
    points.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.min(100, Math.max(20, 55 + Math.sin(baseTime / 100) * 25 + Math.random() * 15)),
      memory: Math.min(100, Math.max(30, 65 + Math.cos(baseTime / 150) * 15 + Math.random() * 10)),
      storage: Math.min(100, Math.max(35, 42 + (baseTime % 1000) / 100 + Math.random() * 5)),
    });
  }

  return points;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with real API call when backend is ready
      // const data = await api.fetchMetrics(timeRange);
      
      // Using dummy data for now
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const data = generateDummyMetrics(timeRange);
      
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  // Initial fetch and refetch on time range change
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Get current values (latest data point)
  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  return {
    metrics,
    currentMetrics,
    timeRange,
    setTimeRange,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}
