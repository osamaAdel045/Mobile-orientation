import { create } from 'zustand';

import { AppError } from '@/core/api/types';

import { fetchAvailableJob, setDriverOffline, setDriverOnline } from '../api/home.api';
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

  goOnline: () => Promise<void>;
  goOffline: () => Promise<void>;
  toggleOnline: () => Promise<void>;
  setJobOffer: (job: DriverJob | null) => void;
  setActiveDelivery: (delivery: ActiveDelivery | null) => void;
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

  startPolling: () => {
    get().stopPolling();

    let delayMs = INITIAL_POLL_DELAY_MS;

    const poll = () => {
      pollTimer = setTimeout(async () => {
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
  },

  reset: () => {
    get().stopPolling();
    set({
      isOnline: false,
      isTogglingOnline: false,
      jobOffer: null,
      activeDelivery: null,
      pollingError: null,
    });
  },
}));
