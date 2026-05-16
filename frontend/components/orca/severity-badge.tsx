import { cn } from '@/lib/utils';
import type { Severity } from '@/types/orca';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityClasses = {
  critical: 'bg-red-100 text-red-700 border-red-400',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  healthy: 'bg-green-100 text-green-700 border-green-400',
  unknown: 'bg-gray-100 text-gray-600 border-gray-400',
};

const severityLabels = {
  critical: 'Critical',
  warning: 'Warning',
  healthy: 'Healthy',
  unknown: 'Unknown',
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        severityClasses[severity],
        className
      )}
    >
      {severityLabels[severity]}
    </span>
  );
}
