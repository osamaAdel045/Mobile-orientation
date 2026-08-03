import { create } from 'zustand';

import { AppError } from '@/core/api/types';

import { fetchDriverOrders } from '../api/history.api';
import type { DriverOrder } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: DriverOrder[] }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface DriverHistoryStore {
  screenState: ScreenState;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDriverHistoryStore = create<DriverHistoryStore>((set, get) => ({
  screenState: { status: 'loading' },

  load: async () => {
    set({ screenState: { status: 'loading' } });

    const result = await fetchDriverOrders();

    result.match(
      (data) => {
        set({
          screenState: data.length === 0 ? { status: 'empty' } : { status: 'loaded', data },
        });
      },
      (error: AppError) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },

  refresh: async () => {
    const result = await fetchDriverOrders();

    result.match(
      (data) => {
        set({
          screenState: data.length === 0 ? { status: 'empty' } : { status: 'loaded', data },
        });
      },
      (error: AppError) => {
        const state = get().screenState;
        if (state.status !== 'loaded') {
          set({ screenState: { status: 'error', message: error.message } });
        }
      },
    );
  },
}));
