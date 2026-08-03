import { create } from 'zustand';

import { fetchRestaurantDetail } from '../api/restaurant.api';
import type { RestaurantDetail } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: RestaurantDetail }
  | { status: 'error'; message: string };

interface RestaurantStore {
  screenState: ScreenState;
  selectedCategoryIndex: number;
  load: (uuid: string) => Promise<void>;
  selectCategory: (index: number) => void;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  screenState: { status: 'loading' },
  selectedCategoryIndex: 0,

  load: async (uuid: string) => {
    set({ screenState: { status: 'loading' }, selectedCategoryIndex: 0 });

    const result = await fetchRestaurantDetail(uuid);

    result.match(
      (data) => {
        set({ screenState: { status: 'loaded', data } });
      },
      (error) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },

  selectCategory: (index: number) => {
    set({ selectedCategoryIndex: index });
  },
}));
