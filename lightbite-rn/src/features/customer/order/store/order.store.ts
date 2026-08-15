import { create } from 'zustand';

import { AppError } from '@/core/api/types';
import {
  buildOrderChannel,
  webSocketClient,
  DRIVER_ASSIGNED_EVENT,
  ORDER_STATUS_EVENT,
} from '@/core/websocket';
import type {
  DriverAssignedEventPayload,
  OrderStatusEventPayload,
} from '@/core/websocket/types';
import { useAuthStore } from '@/features/auth/store/auth.store';

import { fetchOrders, fetchOrderTracking } from '../api/order.api';
import type { Order, OrderTracking } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: Order[] }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface CustomerOrderStore {
  screenState: ScreenState;
  total: number;
  hasMore: boolean;
  currentPage: number;
  isLoadingMore: boolean;

  load: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useCustomerOrderStore = create<CustomerOrderStore>((set, get) => ({
  screenState: { status: 'loading' },
  total: 0,
  hasMore: false,
  currentPage: 1,
  isLoadingMore: false,

  load: async () => {
    set({ screenState: { status: 'loading' }, currentPage: 1 });

    const result = await fetchOrders(1);

    result.match(
      ({ orders, total }) => {
        set({
          total,
          currentPage: 1,
          hasMore: total > orders.length,
          screenState:
            orders.length === 0 ? { status: 'empty' } : { status: 'loaded', data: orders },
        });
      },
      (error: AppError) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },

  loadMore: async () => {
    const { hasMore, isLoadingMore, currentPage } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    const nextPage = currentPage + 1;

    const result = await fetchOrders(nextPage);

    result.match(
      ({ orders, total }) => {
        const current = get().screenState;
        const data = current.status === 'loaded' ? [...current.data, ...orders] : [...orders];
        set({
          total,
          currentPage: nextPage,
          hasMore: total > data.length,
          isLoadingMore: false,
          screenState: { status: 'loaded', data },
        });
      },
      () => {
        set({ isLoadingMore: false });
      },
    );
  },

  refresh: async () => {
    await get().load();
  },
}));

const POLL_INTERVAL_MS = 15_000;

type TrackingScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: OrderTracking }
  | { status: 'error'; message: string };

interface OrderTrackingStore {
  trackingState: TrackingScreenState;
  intervalId: ReturnType<typeof setInterval> | null;
  unsubscribeWebSocket: (() => void) | null;

  load: (uuid: string) => Promise<void>;
  refresh: (uuid: string) => Promise<void>;
  startPolling: (uuid: string) => void;
  stopPolling: () => void;
  reset: () => void;
}

export const useOrderTrackingStore = create<OrderTrackingStore>((set, get) => ({
  trackingState: { status: 'loading' },
  intervalId: null,
  unsubscribeWebSocket: null,

  load: async (uuid) => {
    set({ trackingState: { status: 'loading' } });

    const result = await fetchOrderTracking(uuid);

    result.match(
      (data) => {
        set({ trackingState: { status: 'loaded', data } });
      },
      (error: AppError) => {
        set({ trackingState: { status: 'error', message: error.message } });
      },
    );
  },

  refresh: async (uuid) => {
    const result = await fetchOrderTracking(uuid);

    result.match(
      (data) => {
        set({ trackingState: { status: 'loaded', data } });
      },
      (error: AppError) => {
        // During polling, keep showing the last good state on transient errors.
        const state = get().trackingState;
        if (state.status !== 'loaded') {
          set({ trackingState: { status: 'error', message: error.message } });
        }
      },
    );
  },

  startPolling: (uuid) => {
    get().stopPolling();

    // Primary: subscribe to the customer order channel and live-refresh the
    // moment a status update arrives for this order.
    const user = useAuthStore.getState().user;
    if (user) {
      const channel = buildOrderChannel(String(user.id ?? user.uuid));
      webSocketClient.subscribe(channel);

      const matchesOrder = (data: unknown): boolean => {
        const payload = data as Partial<OrderStatusEventPayload & DriverAssignedEventPayload>;
        return payload?.order_uuid === uuid;
      };

      const unsubscribeStatus = webSocketClient.on(ORDER_STATUS_EVENT, (data) => {
        if (matchesOrder(data)) void get().refresh(uuid);
      });
      const unsubscribeAssigned = webSocketClient.on(DRIVER_ASSIGNED_EVENT, (data) => {
        if (matchesOrder(data)) void get().refresh(uuid);
      });

      const unsubscribeWebSocket = () => {
        unsubscribeStatus();
        unsubscribeAssigned();
        webSocketClient.unsubscribe(channel);
      };
      set({ unsubscribeWebSocket });
    }

    // Fallback: only poll while the WebSocket is not delivering live updates.
    const intervalId = setInterval(() => {
      if (!webSocketClient.isConnected()) {
        void get().refresh(uuid);
      }
    }, POLL_INTERVAL_MS);

    set({ intervalId });
  },

  stopPolling: () => {
    const { intervalId, unsubscribeWebSocket } = get();
    if (intervalId != null) {
      clearInterval(intervalId);
      set({ intervalId: null });
    }
    if (unsubscribeWebSocket != null) {
      unsubscribeWebSocket();
      set({ unsubscribeWebSocket: null });
    }
  },

  reset: () => {
    get().stopPolling();
    set({ trackingState: { status: 'loading' } });
  },
}));
