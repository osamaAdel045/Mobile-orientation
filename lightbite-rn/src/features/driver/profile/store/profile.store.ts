import { create } from 'zustand';

import { AppError } from '@/core/api/types';
import { useAuthStore } from '@/features/auth/store/auth.store';

import { fetchDriverTotalTrips } from '../api/profile.api';
import type { DriverProfileSummary } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: DriverProfileSummary }
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

    const user = useAuthStore.getState().user;
    const result = await fetchDriverTotalTrips();

    result.match(
      (totalTrips) => {
        const vehicle =
          user?.vehicle_type != null
            ? { type: user.vehicle_type, plate_number: user.vehicle_plate ?? null }
            : null;
        const summary: DriverProfileSummary = {
          total_trips: totalTrips,
          rating: user?.rating ?? null,
          vehicle,
        };

        const isEmpty = totalTrips === 0 && vehicle == null && summary.rating == null;
        set({
          screenState: isEmpty ? { status: 'empty' } : { status: 'loaded', data: summary },
        });
      },
      (error: AppError) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },
}));
