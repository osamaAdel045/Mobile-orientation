import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError, type ApiResponse } from '@/core/api/types';

import type { Address, AddressRequest } from '../types';

export async function fetchAddresses(): Promise<Result<Address[], AppError>> {
  try {
    const response = await apiClient.get<ApiResponse<Address[]>>('/addresses');
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function createAddress(input: AddressRequest): Promise<Result<Address, AppError>> {
  try {
    const response = await apiClient.post<ApiResponse<Address>>('/addresses', input);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function updateAddress(
  uuid: string,
  input: Partial<AddressRequest>,
): Promise<Result<Address, AppError>> {
  try {
    const response = await apiClient.put<ApiResponse<Address>>(
      `/addresses/${uuid}`,
      input,
    );
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function deleteAddress(uuid: string): Promise<Result<void, AppError>> {
  try {
    await apiClient.delete(`/addresses/${uuid}`);
    return ok(undefined);
  } catch (error) {
    return err(mapApiError(error));
  }
}
