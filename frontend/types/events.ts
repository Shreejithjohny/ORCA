import { Incident } from './incidents';

export interface AnomalyEvent {
  type: 'anomaly';
  node: string;
  metric: 'cpu' | 'memory' | 'storage' | 'latency';
  value: number;
  threshold: number;
  confidence: number;
  timestamp: string;
}

export interface IncidentEvent {
  type: 'incident';
  incident: Incident;
}

export type WebSocketEvent = AnomalyEvent | IncidentEvent;
