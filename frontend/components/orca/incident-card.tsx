'use client';

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { SeverityBadge } from './severity-badge';
import { ConfidenceScore } from './confidence-score';
import type { Incident } from '@/types/orca';

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  className?: string;
}

export function IncidentCard({ incident, onClick, className }: IncidentCardProps) {
  const timeAgo = formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:bg-muted/50 hover:border-primary/30',
        incident.severity === 'critical' && 'border-l-4 border-l-red-500',
        incident.severity === 'warning' && 'border-l-4 border-l-yellow-500',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <span className="text-sm font-medium">{incident.service}</span>
            <span className="text-xs text-muted-foreground">{incident.id}</span>
          </div>
          <p className="text-sm text-foreground">{incident.message}</p>
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>{timeAgo}</span>
            {incident.confidence && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <ConfidenceScore score={incident.confidence} />
              </div>
            )}
          </div>
        </div>
        {incident.status === 'open' && (
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      {incident.affectedPods && incident.affectedPods.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {incident.affectedPods.map((pod) => (
            <span
              key={pod}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {pod}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
