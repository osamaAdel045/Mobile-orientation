import { create } from 'zustand';

import { AppError } from '@/core/api/types';
import { buildDriverChannel, webSocketClient, DRIVER_JOB_EVENT } from '@/core/websocket';
import type { DriverJobEventPayload } from '@/core/websocket/types';
import { useAuthStore } from '@/features/auth/store/auth.store';

import { fetchActiveDelivery, fetchAvailableJob, setDriverOffline, setDriverOnline } from '../api/home.api';
import type { ActiveDelivery, DriverJob } from '../types';

const INITIAL_POLL_DELAY_MS = 5_000;
const MAX_POLL_DELAY_MS = 30_000;

let pollTimer: ReturnType<typeof setTimeout> | null = null;

interface DriverHomeStore {
  isOnline: boolean;
  isTogglingOnline: boolean;
  jobOffer: DriverJob | null;
  activeDelivery: ActiveDelivery | null;
  pollingError: string | null;
  isLive: boolean;
  unsubscribeWebSocket: (() => void) | null;

  goOnline: () => Promise<void>;
  goOffline: () => Promise<void>;
  toggleOnline: () => Promise<void>;
  setJobOffer: (job: DriverJob | null) => void;
  setActiveDelivery: (delivery: ActiveDelivery | null) => void;
  recoverActiveDelivery: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
}

export const useDriverHomeStore = create<DriverHomeStore>((set, get) => ({
  isOnline: false,
  isTogglingOnline: false,
  jobOffer: null,
  activeDelivery: null,
  pollingError: null,
  isLive: false,
  unsubscribeWebSocket: null,

  goOnline: async () => {
    set({ isTogglingOnline: true, pollingError: null });
    const result = await setDriverOnline();

    result.match(
      () => {
        set({ isOnline: true, isTogglingOnline: false, pollingError: null });
        get().startPolling();
      },
      (error: AppError) => {
        set({ isTogglingOnline: false, pollingError: error.message });
      },
    );
  },

  goOffline: async () => {
    set({ isTogglingOnline: true });
    get().stopPolling();

    const result = await setDriverOffline();

    result.match(
      () => {
        set({
          isOnline: false,
          isTogglingOnline: false,
          jobOffer: null,
          activeDelivery: null,
          pollingError: null,
        });
      },
      (error: AppError) => {
        set({ isTogglingOnline: false, pollingError: error.message });
      },
    );
  },

  toggleOnline: async () => {
    const { isOnline } = get();
    if (isOnline) {
      await get().goOffline();
    } else {
      await get().goOnline();
    }
  },

  setJobOffer: (job) => set({ jobOffer: job }),

  setActiveDelivery: (delivery) => set({ activeDelivery: delivery }),

  recoverActiveDelivery: async () => {
    const result = await fetchActiveDelivery();

    result.match(
      (delivery) => {
        if (delivery) {
          set({ activeDelivery: delivery, isOnline: true });
        }
      },
      () => {
        // Silently ignore — the driver may just not have an active delivery.
      },
    );
  },

  startPolling: () => {
    get().stopPolling();

    // Primary: subscribe to this driver's private job channel. A `driver.new_job`
    // event is the instant signal; the job offer screen navigates from store state.
    const user = useAuthStore.getState().user;
    if (user) {
      const channel = buildDriverChannel(String(user.id ?? user.uuid));
      webSocketClient.subscribe(channel);

      const handleJob = (data: unknown) => {
        const payload = data as Partial<DriverJobEventPayload>;
        if (!payload?.order_uuid) return;

        const job: DriverJob = {
          uuid: payload.order_uuid,
          restaurant: { name: payload.restaurant_name ?? '', address: '' },
          customer_area: '',
          earnings: payload.estimated_earnings ? `AED ${payload.estimated_earnings}` : '',
          distance_km: 0,
          restaurant_lat: 0,
          restaurant_lng: 0,
          customer_lat: 0,
          customer_lng: 0,
        };
        set({ jobOffer: job, pollingError: null });
        get().stopPolling();
      };

      const unsubscribeJob = webSocketClient.on(DRIVER_JOB_EVENT, handleJob);
      const unsubscribeStatus = webSocketClient.onStatusChange((status) => {
        set({ isLive: status === 'connected' });
      });
      const unsubscribeWebSocket = () => {
        unsubscribeJob();
        unsubscribeStatus();
        webSocketClient.unsubscribe(channel);
      };
      set({ unsubscribeWebSocket });
    }

    // Fallback: poll only while the WebSocket is not delivering live jobs.
    let delayMs = INITIAL_POLL_DELAY_MS;

    const poll = () => {
      pollTimer = setTimeout(async () => {
        if (webSocketClient.isConnected()) {
          poll();
          return;
        }

        const result = await fetchAvailableJob();

        result.match(
          (job) => {
            if (job) {
              set({ jobOffer: job, pollingError: null });
              get().stopPolling();
            } else {
              set({ jobOffer: null, pollingError: null });
              delayMs = INITIAL_POLL_DELAY_MS;
              poll();
            }
          },
          (error: AppError) => {
            set({ pollingError: error.message });
            delayMs = Math.min(delayMs * 2, MAX_POLL_DELAY_MS);
            poll();
          },
        );
      }, delayMs);
    };

    poll();
  },

  stopPolling: () => {
    if (pollTimer != null) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }

    const { unsubscribeWebSocket } = get();
    if (unsubscribeWebSocket != null) {
      unsubscribeWebSocket();
      set({ unsubscribeWebSocket: null });
    }
  },

  reset: () => {
    get().stopPolling();
    set({
      isOnline: false,
      isTogglingOnline: false,
      jobOffer: null,
      activeDelivery: null,
      pollingError: null,
      isLive: false,
    });
  },
}));
