export type Severity = 'critical' | 'warning' | 'healthy' | 'unknown';
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved';

export interface Incident {
  id: string;
  severity: Severity;
  service: string;
  message: string;
  timestamp: string;
  status: IncidentStatus;
  affectedPods?: string[];
  confidence?: number;
}
