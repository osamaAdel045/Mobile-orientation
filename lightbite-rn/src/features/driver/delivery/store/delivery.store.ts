import { create } from 'zustand';

import { AppError } from '@/core/api/types';
import { useDriverHomeStore } from '@/features/driver/home/store/home.store';

import { confirmDelivery, confirmPickup, startDelivery } from '../api/delivery.api';
import type { DriverDeliveryJob } from '../types';

type DeliveryPhase = 'pickup' | 'picked_up' | 'delivering';

interface DriverDeliveryStore {
  job: DriverDeliveryJob | null;
  phase: DeliveryPhase;
  isConfirming: boolean;
  completedEarnings: string | null;
  error: string | null;

  setJob: (job: DriverDeliveryJob, phase: DeliveryPhase) => void;
  confirmPickup: () => Promise<boolean>;
  startDelivery: () => Promise<boolean>;
  confirmDelivery: () => Promise<boolean>;
  clear: () => void;
}

export const useDriverDeliveryStore = create<DriverDeliveryStore>((set, get) => ({
  job: null,
  phase: 'pickup',
  isConfirming: false,
  completedEarnings: null,
  error: null,

  setJob: (job, phase) => {
    set({ job, phase, error: null, completedEarnings: null });
  },

  confirmPickup: async () => {
    const { job } = get();
    if (!job) return false;

    set({ isConfirming: true, error: null });
    const result = await confirmPickup(job.uuid);

    return result.match(
      () => {
        set({ isConfirming: false, phase: 'picked_up' });
        useDriverHomeStore.getState().setActiveDelivery({ job, phase: 'picked_up' });
        return true;
      },
      (error: AppError) => {
        set({ isConfirming: false, error: error.message });
        return false;
      },
    );
  },

  startDelivery: async () => {
    const { job } = get();
    if (!job) return false;

    set({ isConfirming: true, error: null });
    const result = await startDelivery(job.uuid);

    return result.match(
      () => {
        set({ isConfirming: false, phase: 'delivering' });
        useDriverHomeStore.getState().setActiveDelivery({ job, phase: 'delivering' });
        return true;
      },
      (error: AppError) => {
        set({ isConfirming: false, error: error.message });
        return false;
      },
    );
  },

  confirmDelivery: async () => {
    const { job } = get();
    if (!job) return false;

    set({ isConfirming: true, error: null });
    const result = await confirmDelivery(job.uuid);

    return result.match(
      () => {
        set({ isConfirming: false, completedEarnings: job.earnings });
        useDriverHomeStore.getState().setActiveDelivery(null);
        return true;
      },
      (error: AppError) => {
        set({ isConfirming: false, error: error.message });
        return false;
      },
    );
  },

  clear: () => {
    set({ job: null, phase: 'pickup', isConfirming: false, completedEarnings: null, error: null });
  },
}));
