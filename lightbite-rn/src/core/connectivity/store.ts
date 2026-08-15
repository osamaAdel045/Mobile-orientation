import { create } from 'zustand';

import { apiClient } from '@/core/api/client';
import { webSocketClient } from '@/core/websocket';
import type { WebSocketStatus } from '@/core/websocket';

const PROBE_INTERVAL_MS = 10_000;
const PROBE_TIMEOUT_MS = 5_000;

let probeTimer: ReturnType<typeof setInterval> | null = null;
let unsubscribeWebSocket: (() => void) | null = null;

interface ConnectivityState {
  isOffline: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * Network reachability monitor backing the OfflineBanner.
 *
 * Uses two signals:
 * 1. The WebSocket connection state — `connected` implies online.
 * 2. A throttled probe of the public `/health` endpoint, so offline state is
 *    detected even before (or without) a WebSocket connection.
 */
export const useConnectivityStore = create<ConnectivityState>((set, get) => ({
  isOffline: false,

  startMonitoring: () => {
    get().stopMonitoring();

    const syncFromWebSocket = (status: WebSocketStatus) => {
      if (status === 'connected') set({ isOffline: false });
    };
    unsubscribeWebSocket = webSocketClient.onStatusChange(syncFromWebSocket);

    probeTimer = setInterval(async () => {
      try {
        await apiClient.get('/health', { timeout: PROBE_TIMEOUT_MS });
        set({ isOffline: false });
      } catch {
        set({ isOffline: true });
      }
    }, PROBE_INTERVAL_MS);
  },

  stopMonitoring: () => {
    if (probeTimer != null) {
      clearInterval(probeTimer);
      probeTimer = null;
    }
    if (unsubscribeWebSocket != null) {
      unsubscribeWebSocket();
      unsubscribeWebSocket = null;
    }
  },
}));
