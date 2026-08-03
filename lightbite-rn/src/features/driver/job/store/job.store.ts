import { create } from 'zustand';

import { AppError } from '@/core/api/types';
import { useDriverHomeStore } from '@/features/driver/home/store/home.store';

import { acceptDriverJob, rejectDriverJob } from '../api/job.api';
import type { DriverJob } from '../types';

interface DriverJobStore {
  isAccepting: boolean;
  isDeclining: boolean;
  error: string | null;

  acceptJob: (job: DriverJob) => Promise<boolean>;
  rejectJob: (uuid: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useDriverJobStore = create<DriverJobStore>((set) => ({
  isAccepting: false,
  isDeclining: false,
  error: null,

  acceptJob: async (job) => {
    set({ isAccepting: true, error: null });
    const result = await acceptDriverJob(job.uuid);

    return result.match(
      () => {
        useDriverHomeStore.getState().setActiveDelivery({ job, phase: 'pickup' });
        set({ isAccepting: false });
        return true;
      },
      (error: AppError) => {
        set({ isAccepting: false, error: error.message });
        return false;
      },
    );
  },

  rejectJob: async (uuid) => {
    set({ isDeclining: true, error: null });
    const result = await rejectDriverJob(uuid);

    return result.match(
      () => {
        set({ isDeclining: false });
        return true;
      },
      (error: AppError) => {
        set({ isDeclining: false, error: error.message });
        return false;
      },
    );
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({ isAccepting: false, isDeclining: false, error: null });
  },
}));
