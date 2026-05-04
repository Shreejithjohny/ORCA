export * from './incidents';
export * from './events';
export * from './metrics';

// Graph node
export interface GraphNode {
  id: string;
  status: 'critical' | 'warning' | 'healthy' | 'unknown';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// Graph link/edge
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

// Graph data structure
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// AI Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  relatedIncidents?: string[];
  timestamp: string;
}

// AI Chat response from API
export interface ChatResponse {
  query: string;
  answer: string;
  confidence: number;
  relatedIncidents?: string[];
}

// Time range options for metrics
export type TimeRange = '5m' | '15m' | '1h';

// Filter options for incidents
export type IncidentFilter = 'all' | 'critical' | 'warning' | 'resolved';
