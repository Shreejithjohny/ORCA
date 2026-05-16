'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ConfidenceScore } from './confidence-score';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface AIChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatPanel({ open, onOpenChange }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            ORCA AI Assistant
          </SheetTitle>
          <p className="sr-only">Interactive chat interface with the ORCA AI assistant for system monitoring and analysis.</p>
        </SheetHeader>

        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8" />
                <p className="text-sm">Ask me anything about your incidents, metrics, or services</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex flex-col gap-1',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === 'assistant' && message.confidence && (
                    <div className="flex items-center gap-1 px-1">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <ConfidenceScore score={message.confidence} />
                    </div>
                  )}
                  {message.relatedIncidents && message.relatedIncidents.length > 0 && (
                    <div className="flex gap-1 px-1">
                      {message.relatedIncidents.map((id) => (
                        <span
                          key={id}
                          className="rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about incidents, metrics..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
