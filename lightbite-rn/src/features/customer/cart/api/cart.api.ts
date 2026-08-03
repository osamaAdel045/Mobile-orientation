import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError, type ApiResponse } from '@/core/api/types';

import type { AddToCartRequest, Cart } from '../types';

export async function fetchCart(): Promise<Result<Cart | null, AppError>> {
  try {
    const response = await apiClient.get<ApiResponse<Cart | null>>('/cart');
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function addToCart(
  input: AddToCartRequest,
  clearExisting?: boolean,
): Promise<Result<Cart, AppError>> {
  try {
    const body = clearExisting ? { ...input, clear_cart: true } : input;
    const response = await apiClient.post<ApiResponse<Cart>>('/cart/items', body);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function updateCartItem(
  id: number,
  quantity: number,
): Promise<Result<Cart, AppError>> {
  try {
    const response = await apiClient.patch<ApiResponse<Cart>>(`/cart/items/${id}`, { quantity });
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function removeCartItem(id: number): Promise<Result<Cart, AppError>> {
  try {
    const response = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${id}`);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function clearCart(): Promise<Result<void, AppError>> {
  try {
    await apiClient.delete('/cart');
    return ok(undefined);
  } catch (error) {
    return err(mapApiError(error));
  }
}
