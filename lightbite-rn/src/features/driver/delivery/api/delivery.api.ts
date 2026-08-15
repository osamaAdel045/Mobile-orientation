import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

export async function confirmPickup(uuid: string): Promise<Result<null, AppError>> {
  try {
    await apiClient.post(`/driver/jobs/${uuid}/pickup`);
    return ok(null);
  } catch (error) {
    console.error('Failed to confirm pickup:', error);
    return err(mapApiError(error));
  }
}

export async function startDelivery(uuid: string): Promise<Result<null, AppError>> {
  try {
    await apiClient.post(`/driver/jobs/${uuid}/start-delivery`);
    return ok(null);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function confirmDelivery(uuid: string): Promise<Result<null, AppError>> {
  try {
    await apiClient.post(`/driver/jobs/${uuid}/deliver`);
    return ok(null);
  } catch (error) {
    console.error('Failed to confirm delivery:', error);
    return err(mapApiError(error));
  }
}
