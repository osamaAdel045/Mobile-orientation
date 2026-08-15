import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import { historyListResponseSchema } from '../schemas/history.schema';
import type { DriverOrder } from '../types';

export async function fetchDriverOrders(): Promise<Result<DriverOrder[], AppError>> {
  try {
    const response = await apiClient.get('/driver/orders');
    const parsed = historyListResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error('Failed to parse driver orders response:', parsed.error);
      return err({ code: 'PARSE_ERROR', message: 'Invalid response format', statusCode: 0 });
    }
    return ok(parsed.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
