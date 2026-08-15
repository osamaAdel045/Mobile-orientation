import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

interface DriverOrdersResponse {
  data: unknown[];
  meta?: { total?: number };
}

/**
 * Total completed trips for the driver. `GET /driver/orders` paginates over
 * delivered/cancelled/rejected jobs and reports the full count in `meta.total`.
 */
export async function fetchDriverTotalTrips(): Promise<Result<number, AppError>> {
  try {
    const response = await apiClient.get<DriverOrdersResponse>('/driver/orders', {
      params: { per_page: 1 },
    });
    return ok(response.data.meta?.total ?? 0);
  } catch (error) {
    return err(mapApiError(error));
  }
}
