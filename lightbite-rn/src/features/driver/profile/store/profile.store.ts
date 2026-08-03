import { create } from 'zustand';

import { AppError } from '@/core/api/types';

import { fetchDriverProfiles } from '../api/profile.api';
import type { DriverProfileItem } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: DriverProfileItem[] }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface DriverProfileStore {
  screenState: ScreenState;
  load: () => Promise<void>;
}

export const useDriverProfileStore = create<DriverProfileStore>((set) => ({
  screenState: { status: 'loading' },

  load: async () => {
    set({ screenState: { status: 'loading' } });

    const result = await fetchDriverProfiles();

    result.match(
      (data) => {
        if (data.length === 0) {
          set({ screenState: { status: 'empty' } });
        } else {
          set({ screenState: { status: 'loaded', data } });
        }
      },
      (error: AppError) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },
}));
