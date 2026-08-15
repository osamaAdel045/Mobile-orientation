import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

export async function acceptDriverJob(uuid: string): Promise<Result<null, AppError>> {
  try {
    await apiClient.post(`/driver/jobs/${uuid}/accept`);
    return ok(null);
  } catch (error) {
    console.error('Failed to accept driver job:', error);
    return err(mapApiError(error));
  }
}

export async function rejectDriverJob(uuid: string): Promise<Result<null, AppError>> {
  try {
    await apiClient.post(`/driver/jobs/${uuid}/reject`);
    return ok(null);
  } catch (error) {
    return err(mapApiError(error));
  }
}
