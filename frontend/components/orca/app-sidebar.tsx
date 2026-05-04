'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/contexts/chat-context';
import {
  LayoutDashboard,
  Activity,
  GitBranch,
  AlertCircle,
  Settings,
  MessageSquare,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Metrics', href: '/metrics', icon: Activity },
  { name: 'Graph', href: '/graph', icon: GitBranch },
  { name: 'Incidents', href: '/incidents', icon: AlertCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { openChat } = useChatContext();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      {/* Logo */}
      <Link href="/dashboard" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 hover:bg-sidebar-accent/50 transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">ORCA</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* AI Chat Button */}
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={openChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Ask AI
        </button>
      </div>
    </aside>
  );
}
