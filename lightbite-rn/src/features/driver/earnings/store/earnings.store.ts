import { create } from 'zustand';

import { AppError } from '@/core/api/types';

import { fetchDriverEarnings } from '../api/earnings.api';
import type { DriverEarnings } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: DriverEarnings }
  | { status: 'error'; message: string };

interface DriverEarningsStore {
  screenState: ScreenState;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDriverEarningsStore = create<DriverEarningsStore>((set, get) => ({
  screenState: { status: 'loading' },

  load: async () => {
    set({ screenState: { status: 'loading' } });

    const result = await fetchDriverEarnings();

    result.match(
      (data) => {
        set({ screenState: { status: 'loaded', data } });
      },
      (error: AppError) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },

  refresh: async () => {
    const result = await fetchDriverEarnings();

    result.match(
      (data) => {
        set({ screenState: { status: 'loaded', data } });
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
