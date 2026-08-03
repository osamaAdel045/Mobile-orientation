import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError, type ApiResponse } from '@/core/api/types';

import { rateOrderSchema } from '../schemas/rate-order.schema';
import type { RateOrderInput } from '../schemas/rate-order.schema';
import type { Rating } from '../types';

export async function submitOrderRating(
  orderUuid: string,
  input: RateOrderInput,
): Promise<Result<Rating, AppError>> {
  try {
    const parsed = rateOrderSchema.safeParse(input);
    if (!parsed.success) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'Invalid rating input',
        statusCode: 422,
      });
    }

    const response = await apiClient.post<ApiResponse<Rating>>(
      `/orders/${orderUuid}/rate`,
      parsed.data,
    );
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
