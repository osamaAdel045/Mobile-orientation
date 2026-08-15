import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import type { ActiveDelivery } from '../types';
import type { DriverJob } from '../types';

export async function fetchAvailableJob(): Promise<Result<DriverJob | null, AppError>> {
  try {
    const response = await apiClient.get('/driver/home');
    const data = response.data?.data;
    if (!data?.pending_jobs?.length) return ok(null);
    const job = data.pending_jobs[0];
    return ok({
      uuid: job.uuid,
      restaurant: {
        name: job.restaurant_name ?? '',
        address: '',
      },
      customer_area: '',
      earnings: job.estimated_earnings ? `AED ${job.estimated_earnings}` : '',
      distance_km: 0,
      restaurant_lat: job.restaurant_lat ?? 0,
      restaurant_lng: job.restaurant_lng ?? 0,
      customer_lat: 0,
      customer_lng: 0,
    });
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function setDriverOnline(): Promise<Result<boolean, AppError>> {
  try {
    const response = await apiClient.patch('/driver/status', { is_online: true });
    return ok(response.data?.data?.is_online ?? true);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function setDriverOffline(): Promise<Result<boolean, AppError>> {
  try {
    const response = await apiClient.patch('/driver/status', { is_online: false });
    return ok(response.data?.data?.is_online ?? false);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function fetchActiveDelivery(): Promise<Result<ActiveDelivery | null, AppError>> {
  try {
    const response = await apiClient.get('/driver/active-delivery');
    const data = response.data?.data;
    if (!data) return ok(null);

    const phaseMap: Record<string, 'pickup' | 'picked_up' | 'delivering'> = {
      assigned: 'pickup',
      picked_up: 'picked_up',
      delivering: 'delivering',
    };

    const job: DriverJob = {
      uuid: data.uuid,
      restaurant: {
        name: data.restaurant?.name ?? '',
        address: data.delivery_address?.address ?? '',
      },
      customer_area: data.delivery_address?.label ?? '',
      earnings: `AED ${data.estimated_earnings ?? '0.00'}`,
      distance_km: 0,
      restaurant_lat: data.restaurant?.lat ?? 0,
      restaurant_lng: data.restaurant?.lng ?? 0,
      customer_lat: 0,
      customer_lng: 0,
    };

    return ok({
      job,
      phase: phaseMap[data.status] ?? 'pickup',
    });
  } catch (error) {
    console.error('Failed to fetch active delivery:', error);
    return err(mapApiError(error));
  }
}
