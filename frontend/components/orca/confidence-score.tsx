import { cn } from '@/lib/utils';

interface ConfidenceScoreProps {
  score: number;
  className?: string;
}

export function ConfidenceScore({ score, className }: ConfidenceScoreProps) {
  const percentage = Math.round(score * 100);
  
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            percentage >= 80 && 'bg-green-500',
            percentage >= 60 && percentage < 80 && 'bg-yellow-500',
            percentage < 60 && 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percentage}%</span>
    </div>
  );
}
