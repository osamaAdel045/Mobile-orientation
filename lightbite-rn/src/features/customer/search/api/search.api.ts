import { err, ok, Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import type { CustomerSearchItem, CustomerSearchRequest } from '../types';

export async function fetchCustomerSearchs(): Promise<Result<CustomerSearchItem[], AppError>> {
  try {
    const response = await apiClient.get<{ data: CustomerSearchItem[] }>('/searchs');
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function createCustomerSearch(
  input: CustomerSearchRequest,
): Promise<Result<CustomerSearchItem, AppError>> {
  try {
    const response = await apiClient.post<{ data: CustomerSearchItem }>('/searchs', input);
    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}
