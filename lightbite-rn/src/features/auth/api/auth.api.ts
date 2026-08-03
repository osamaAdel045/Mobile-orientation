import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { setAuthToken } from '@/core/api/auth.interceptor';
import { apiClient } from '@/core/api/client';
import { AppError, mapApiError, type ApiResponse } from '@/core/api/types';
import { SecureStorage } from '@/core/storage/secure-storage';

import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export async function loginApi(input: LoginRequest): Promise<Result<AuthResponse, AppError>> {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', input);
    const { user, access_token, refresh_token } = response.data.data;

    await SecureStorage.setAccessToken(access_token);
    await SecureStorage.setRefreshToken(refresh_token);
    await SecureStorage.setUserData(JSON.stringify(user));
    setAuthToken(access_token);

    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function registerApi(input: RegisterRequest): Promise<Result<AuthResponse, AppError>> {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', input);
    const { user, access_token, refresh_token } = response.data.data;

    await SecureStorage.setAccessToken(access_token);
    await SecureStorage.setRefreshToken(refresh_token);
    await SecureStorage.setUserData(JSON.stringify(user));
    setAuthToken(access_token);

    return ok(response.data.data);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function refreshTokenApi(): Promise<Result<string, AppError>> {
  try {
    const refreshToken = await SecureStorage.getRefreshToken();
    if (!refreshToken) {
      return err({ code: 'NO_REFRESH_TOKEN', message: 'No refresh token found', statusCode: 0 });
    }

    const response = await apiClient.post<
      ApiResponse<{ access_token: string; refresh_token: string }>
    >('/auth/refresh', { refresh_token: refreshToken });

    const { access_token, refresh_token } = response.data.data;
    await SecureStorage.setAccessToken(access_token);
    await SecureStorage.setRefreshToken(refresh_token);
    setAuthToken(access_token);

    return ok(access_token);
  } catch (error) {
    return err(mapApiError(error));
  }
}

export async function logoutApi(): Promise<Result<void, AppError>> {
  try {
    const refreshToken = await SecureStorage.getRefreshToken();
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    }
  } catch {
    // Best-effort logout — clear local state regardless
  }

  await SecureStorage.clearAll();
  setAuthToken(null);

  return ok(undefined);
}
