'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterTabs } from './filter-tabs';
import { IncidentCard } from './incident-card';
import { useIncidents } from '@/hooks/useIncidents';
import type { Incident } from '@/types/orca';

interface IncidentFeedProps {
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

export function IncidentFeed({ onIncidentClick, className }: IncidentFeedProps) {
  const { incidents, allIncidents, filter, setFilter } = useIncidents();

  const counts = {
    all: allIncidents.length,
    critical: allIncidents.filter((inc) => inc.severity === 'critical').length,
    warning: allIncidents.filter((inc) => inc.severity === 'warning').length,
    resolved: allIncidents.filter((inc) => inc.status === 'resolved').length,
  };

  return (
    <div className={className}>
      <FilterTabs value={filter} onChange={setFilter} counts={counts} />
      <ScrollArea className="h-[calc(100vh-13rem)]">
        <div className="space-y-3 p-4">
          {incidents.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No incidents found
            </div>
          ) : (
            incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onClick={() => onIncidentClick?.(incident)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
