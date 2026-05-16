'use client';

import { cn } from '@/lib/utils';
import type { IncidentFilter } from '@/types/orca';

interface FilterTabsProps {
  value: IncidentFilter;
  onChange: (filter: IncidentFilter) => void;
  counts?: {
    all: number;
    critical: number;
    warning: number;
    resolved: number;
  };
  className?: string;
}

const filters: { value: IncidentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'resolved', label: 'Resolved' },
];

export function FilterTabs({ value, onChange, counts, className }: FilterTabsProps) {
  return (
    <div className={cn('flex gap-1 border-b', className)}>
      {filters.map((filter) => {
        const count = counts?.[filter.value];
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              value === filter.value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
            )}
          >
            {filter.label}
            {count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs',
                  value === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
