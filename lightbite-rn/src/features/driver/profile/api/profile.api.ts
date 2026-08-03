import { err, ok, Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import type { DriverProfileItem, DriverProfileRequest } from '../types';

export async function fetchDriverProfiles(): Promise<Result<DriverProfileItem[], AppError>> {
  try {
    const response = await apiClient.get<{ data: DriverProfileItem[] }>('/profiles');
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function createDriverProfile(
  input: DriverProfileRequest,
): Promise<Result<DriverProfileItem, AppError>> {
  try {
    const response = await apiClient.post<{ data: DriverProfileItem }>('/profiles', input);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
