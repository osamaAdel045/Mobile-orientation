import { create } from 'zustand';

import { AppError } from '@/core/api/types';

import { fetchCustomerSearchs } from '../api/search.api';
import type { CustomerSearchItem } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: CustomerSearchItem[] }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface CustomerSearchStore {
  screenState: ScreenState;
  load: () => Promise<void>;
}

export const useCustomerSearchStore = create<CustomerSearchStore>((set) => ({
  screenState: { status: 'loading' },

  load: async () => {
    set({ screenState: { status: 'loading' } });

    const result = await fetchCustomerSearchs();

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
