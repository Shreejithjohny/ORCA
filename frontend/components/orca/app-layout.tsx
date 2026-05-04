'use client';

import { AppSidebar } from './app-sidebar';
import { AIChatPanel } from './ai-chat-panel';
import { ChatProvider, useChatContext } from '@/contexts/chat-context';

interface AppLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: AppLayoutProps) {
  const { chatOpen, setChatOpen } = useChatContext();

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <AIChatPanel open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ChatProvider>
      <LayoutContent>{children}</LayoutContent>
    </ChatProvider>
  );
}
