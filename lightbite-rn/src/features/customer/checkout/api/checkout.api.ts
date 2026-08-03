import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError, type ApiResponse } from '@/core/api/types';

import type { OrderResult, PlaceOrderRequest } from '../types';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function placeOrder(input: PlaceOrderRequest): Promise<Result<OrderResult, AppError>> {
  try {
    const { restaurant_uuid: _, ...body } = input;
    const response = await apiClient.post<ApiResponse<OrderResult>>('/orders', body, {
      headers: { 'Idempotency-Key': generateUUID() },
    });
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
