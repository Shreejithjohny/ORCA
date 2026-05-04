/**
 * Socket service stub for frontend WebSocket integration.
 * Provides a generic WebSocket client wrapper for real-time events.
 * Integration Lead (Member B/C) should expand this with actual endpoint routing.
 */

interface SocketMessage {
  type: string;
  data?: any;
}

class SocketService {
  private ws: WebSocket | null = null;
  private url: string = 'ws://localhost:8000/ws';
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectInterval: number = 3000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(url?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (url) {
        this.url = url;
      }

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log(`[Socket] Connected to ${this.url}`);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message: SocketMessage = JSON.parse(event.data);
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
              handler(message.data);
            }
          } catch (e) {
            console.error('[Socket] Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error: Event) => {
          console.error('[Socket] Error:', error);
          reject(new Error(`WebSocket error: ${error}`));
        };

        this.ws.onclose = () => {
          console.log('[Socket] Disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[Socket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => {
        this.connect().catch((e) =>
          console.error('[Socket] Reconnect failed:', e)
        );
      }, this.reconnectInterval);
    } else {
      console.error(
        '[Socket] Max reconnect attempts reached, giving up.'
      );
    }
  }

  subscribe(messageType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  unsubscribe(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  send(message: SocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn(
        '[Socket] WebSocket not connected, message queued or dropped:',
        message
      );
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const socketService = new SocketService();
export default socketService;
