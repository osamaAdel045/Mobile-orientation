import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { webSocketClient } from '@/core/websocket/client';
import type { WebSocketStatus } from '@/core/websocket/types';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface WebSocketContextValue {
  status: WebSocketStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * Auto-connects the shared WebSocket client once a session exists and tears it
 * down on logout. Screens read status via `useWebSocketContext`; feature stores
 * talk to the singleton `webSocketClient` directly.
 */
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [status, setStatus] = useState<WebSocketStatus>(() => webSocketClient.getStatus());

  useEffect(() => {
    if (isAuthenticated) {
      webSocketClient.connect();
    } else {
      webSocketClient.disconnect();
    }
  }, [isAuthenticated]);

  useEffect(() => webSocketClient.onStatusChange(setStatus), []);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      status,
      isConnected: status === 'connected',
      connect: () => webSocketClient.connect(),
      disconnect: () => webSocketClient.disconnect(),
    }),
    [status],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketContext(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return ctx;
}
