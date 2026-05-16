'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Incident, IncidentFilter } from '@/types/orca';
import { socketService } from '@/services/socket';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<IncidentFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch incidents from backend
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/incidents');
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      setIncidents(data.incidents || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch incidents on mount and subscribe to WebSockets
  useEffect(() => {
    fetchIncidents();
    // Refresh every 10 seconds
    const interval = setInterval(fetchIncidents, 10000);
    
    // Subscribe to WebSocket events for real-time updates
    const unsubMessage = socketService.onMessage((event) => {
      if (event.type === 'initial') {
        if (Array.isArray(event.data) && event.data.length > 0) {
          setIncidents(event.data);
        }
      } else if (event.type === 'incident_update') {
        setIncidents(prev => {
          // Check if incident already exists to update it, otherwise prepend
          const exists = prev.some(inc => inc.id === event.data.id);
          if (exists) {
            return prev.map(inc => inc.id === event.data.id ? event.data : inc);
          }
          return [event.data, ...prev];
        });
      }
    });

    return () => {
      clearInterval(interval);
      unsubMessage();
    };
  }, [fetchIncidents]);

  const addIncident = useCallback(async (incident: Incident) => {
    try {
      const response = await fetch('http://localhost:8000/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      if (!response.ok) throw new Error('Failed to create incident');
      const newIncident = await response.json();
      setIncidents(prev => [newIncident, ...prev]);
    } catch (err) {
      console.error('Error creating incident:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    try {
      const response = await fetch(`http://localhost:8000/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update incident');
      const updatedIncident = await response.json();
      setIncidents(prev =>
        prev.map(inc => (inc.id === id ? updatedIncident : inc))
      );
    } catch (err) {
      console.error('Error updating incident:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
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
    loading,
    error,
    refetch: fetchIncidents,
  };
}
