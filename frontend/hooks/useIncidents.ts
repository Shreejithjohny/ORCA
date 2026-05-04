'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Incident, IncidentFilter } from '@/types/orca';

// Dummy incidents for development
const DUMMY_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    severity: 'critical',
    service: 'redis',
    message: 'Memory spike detected - usage at 94%',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'open',
    affectedPods: ['redis-0', 'redis-1'],
    confidence: 0.94,
  },
  {
    id: 'INC-002',
    severity: 'warning',
    service: 'api',
    message: 'High latency detected on /api/users endpoint',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'acknowledged',
    affectedPods: ['api-pod-3'],
    confidence: 0.87,
  },
  {
    id: 'INC-003',
    severity: 'critical',
    service: 'neo4j',
    message: 'Connection pool exhausted',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: 'open',
    affectedPods: ['neo4j-0'],
    confidence: 0.92,
  },
  {
    id: 'INC-004',
    severity: 'warning',
    service: 'backend',
    message: 'CPU usage above threshold at 82%',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'open',
    affectedPods: ['backend-pod-1', 'backend-pod-2'],
    confidence: 0.78,
  },
  {
    id: 'INC-005',
    severity: 'healthy',
    service: 'auth',
    message: 'Service recovered - authentication latency normalized',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'resolved',
    confidence: 0.95,
  },
];

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>(DUMMY_INCIDENTS);
  const [filter, setFilter] = useState<IncidentFilter>('all');

  const addIncident = useCallback((incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
  }, []);

  const updateIncident = useCallback((id: string, updates: Partial<Incident>) => {
    setIncidents(prev =>
      prev.map(inc => (inc.id === id ? { ...inc, ...updates } : inc))
    );
  }, []);

  const clearIncidents = useCallback(() => {
    setIncidents([]);
  }, []);

  const filteredIncidents = useMemo(() => {
    switch (filter) {
      case 'critical':
        return incidents.filter(inc => inc.severity === 'critical');
      case 'warning':
        return incidents.filter(inc => inc.severity === 'warning');
      case 'resolved':
        return incidents.filter(inc => inc.status === 'resolved');
      default:
        return incidents;
    }
  }, [incidents, filter]);

  return {
    incidents: filteredIncidents,
    allIncidents: incidents,
    filter,
    setFilter,
    addIncident,
    updateIncident,
    clearIncidents,
  };
}
