'use client';

import Link from 'next/link';
import { Bell, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionStatus } from './connection-status';

interface TopNavProps {
  title: string;
  isConnected?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TopNav({ title, isConnected = false, onRefresh, isRefreshing }: TopNavProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <ConnectionStatus isConnected={isConnected} />

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-border hover:bg-muted"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span className="sr-only">Refresh</span>
          </Button>
        )}

        <Button variant="outline" size="sm" className="relative border-border hover:bg-muted">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
