'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricsTileProps {
  title: string;
  value: number;
  unit?: string;
  threshold?: number;
  previousValue?: number;
  icon?: React.ReactNode;
}

export function MetricsTile({
  title,
  value,
  unit = '%',
  threshold = 80,
  previousValue,
  icon,
}: MetricsTileProps) {
  const isWarning = value >= threshold * 0.9;
  const isCritical = value >= threshold;

  const trend = previousValue !== undefined ? value - previousValue : 0;
  const trendPercentage = previousValue ? ((trend / previousValue) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isCritical && 'bg-red-100 text-red-600',
                isWarning && !isCritical && 'bg-yellow-100 text-yellow-600',
                !isWarning && 'bg-blue-100 text-blue-600'
              )}>
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={cn(
                'text-2xl font-bold',
                isCritical && 'text-red-600',
                isWarning && !isCritical && 'text-yellow-600',
                !isWarning && 'text-foreground'
              )}>
                {value.toFixed(1)}{unit}
              </p>
            </div>
          </div>

          {previousValue !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-sm',
              trend > 0 && 'text-red-600',
              trend < 0 && 'text-green-600',
              trend === 0 && 'text-muted-foreground'
            )}>
              {trend > 0 && <TrendingUp className="h-4 w-4" />}
              {trend < 0 && <TrendingDown className="h-4 w-4" />}
              {trend === 0 && <Minus className="h-4 w-4" />}
              <span>{trend >= 0 ? '+' : ''}{trendPercentage}%</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full transition-all',
                isCritical && 'bg-red-500',
                isWarning && !isCritical && 'bg-yellow-500',
                !isWarning && 'bg-blue-500'
              )}
              style={{ width: `${Math.min(100, value)}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-red-500">{threshold}% threshold</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
