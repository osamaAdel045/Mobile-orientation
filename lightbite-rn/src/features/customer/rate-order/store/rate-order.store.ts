import { create } from 'zustand';

import type { AppError } from '@/core/api/types';

import { submitOrderRating } from '../api/rate-order.api';
import type { RateOrderInput } from '../schemas/rate-order.schema';
import type { Rating } from '../types';

interface RateOrderStore {
  isSubmitting: boolean;
  result: Rating | null;
  error: string | null;
  submit: (orderUuid: string, input: RateOrderInput) => Promise<AppError | null>;
  reset: () => void;
}

export const useCustomerRateOrderStore = create<RateOrderStore>((set) => ({
  isSubmitting: false,
  result: null,
  error: null,

  submit: async (orderUuid, input) => {
    set({ isSubmitting: true, error: null });

    const result = await submitOrderRating(orderUuid, input);

    return result.match(
      (rating) => {
        set({ isSubmitting: false, result: rating });
        return null;
      },
      (error: AppError) => {
        set({ isSubmitting: false, error: error.message });
        return error;
      },
    );
  },

  reset: () => set({ isSubmitting: false, result: null, error: null }),
}));
