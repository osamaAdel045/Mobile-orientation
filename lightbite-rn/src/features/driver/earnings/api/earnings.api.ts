import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import { earningsResponseSchema } from '../schemas/earnings.schema';
import type { DriverEarnings } from '../types';

export async function fetchDriverEarnings(): Promise<Result<DriverEarnings, AppError>> {
  try {
    const response = await apiClient.get('/driver/earnings');
    const parsed = earningsResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error('Failed to parse driver earnings response:', parsed.error);
      return err({ code: 'PARSE_ERROR', message: 'Invalid response format', statusCode: 0 });
    }
    return ok(parsed.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
