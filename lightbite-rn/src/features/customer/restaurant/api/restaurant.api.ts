import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError, type ApiResponse } from '@/core/api/types';

import type { RestaurantDetail } from '../types';

export async function fetchRestaurantDetail(
  uuid: string,
): Promise<Result<RestaurantDetail, AppError>> {
  try {
    const response = await apiClient.get<ApiResponse<RestaurantDetail>>(`/restaurants/${uuid}`);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
