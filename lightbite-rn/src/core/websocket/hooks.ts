import { useEffect, useRef } from 'react';

import { webSocketClient } from '@/core/websocket/client';
import { useWebSocketContext } from '@/core/websocket/provider';
import type { WebSocketEventHandler } from '@/core/websocket/types';

/** React binding for connection status, powered by the WebSocketProvider. */
export function useWebSocketStatus() {
  const { status, isConnected, connect, disconnect } = useWebSocketContext();
  return { status, isConnected, connect, disconnect };
}

/**
 * Subscribe a handler to a broadcast event for the lifetime of the component.
 * Works whether or not the socket is currently connected — handlers are kept
 * and dispatched as events arrive.
 */
export function useWebSocketEvent(event: string, handler: WebSocketEventHandler): void {
  // Keep the latest handler in a ref so the subscription is stable per event.
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return webSocketClient.on(event, (data, channel) => {
      handlerRef.current(data, channel);
    });
  }, [event]);
}
