import { cn } from '@/lib/utils';
import { StatusDot } from './status-dot';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusDot 
        status={isConnected ? 'healthy' : 'critical'} 
        size="sm" 
        pulse={!isConnected} 
      />
      <span className="text-sm text-muted-foreground">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}
