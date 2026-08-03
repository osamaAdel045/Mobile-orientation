import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import type { Order, OrderTracking } from '../types';

interface OrderListResponse {
  data: Order[];
  meta?: { current_page: number; total: number };
}

export async function fetchOrders(
  page = 1,
): Promise<Result<{ orders: Order[]; total: number }, AppError>> {
  try {
    const response = await apiClient.get<OrderListResponse>('/orders', {
      params: { page, per_page: 20 },
    });
    const total = response.data.meta?.total ?? response.data.data.length;
    return ok({ orders: response.data.data, total });
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function fetchOrderTracking(uuid: string): Promise<Result<OrderTracking, AppError>> {
  try {
    const response = await apiClient.get<{ data: OrderTracking }>(`/orders/${uuid}/tracking`);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
