import { cn } from '@/lib/utils';

interface MetricValueProps {
  label: string;
  value: number;
  unit?: string;
  threshold?: number;
  className?: string;
}

export function MetricValue({ label, value, unit = '%', threshold = 80, className }: MetricValueProps) {
  const isWarning = value >= threshold * 0.9;
  const isCritical = value >= threshold;

  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          'text-2xl font-bold',
          isCritical && 'text-red-600',
          isWarning && !isCritical && 'text-yellow-600',
          !isWarning && 'text-foreground'
        )}
      >
        {value.toFixed(1)}{unit}
      </span>
    </div>
  );
}
