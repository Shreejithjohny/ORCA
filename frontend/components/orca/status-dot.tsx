import { cn } from '@/lib/utils';
import type { Severity } from '@/types/orca';

interface StatusDotProps {
  status: Severity;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

const statusClasses = {
  critical: 'bg-red-500',
  warning: 'bg-yellow-500',
  healthy: 'bg-green-500',
  unknown: 'bg-gray-400',
};

export function StatusDot({ status, size = 'md', pulse = false, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        sizeClasses[size],
        statusClasses[status],
        pulse && status === 'critical' && 'animate-pulse',
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
}
