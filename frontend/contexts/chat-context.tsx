'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextValue {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  return (
    <ChatContext.Provider value={{ chatOpen, setChatOpen, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
