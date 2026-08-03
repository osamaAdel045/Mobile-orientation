import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { setAuthToken } from '@/core/api/auth.interceptor';
import { SecureStorage } from '@/core/storage/secure-storage';

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  pendingQueue = [];
}

export async function refreshInterceptor(error: AxiosError): Promise<InternalAxiosRequestConfig> {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  // Only handle 401 errors, and don't retry the refresh endpoint itself
  if (error.response?.status !== 401 || originalRequest.url?.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  // Don't retry if we already tried
  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  const refreshToken = await SecureStorage.getRefreshToken();
  if (!refreshToken) {
    return Promise.reject(error);
  }

  if (isRefreshing) {
    // Queue this request until refresh completes
    return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
      pendingQueue.push({
        resolve: (token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(originalRequest);
        },
        reject,
      });
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const response = await axios.post<{
      data: { access_token: string; refresh_token: string; expires_in: number };
    }>(
      `${originalRequest.baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const { access_token, refresh_token } = response.data.data;

    await SecureStorage.setAccessToken(access_token);
    await SecureStorage.setRefreshToken(refresh_token);
    setAuthToken(access_token);

    processQueue(null, access_token);
    isRefreshing = false;

    originalRequest.headers.Authorization = `Bearer ${access_token}`;
    return originalRequest;
  } catch (refreshError) {
    processQueue(refreshError, null);
    isRefreshing = false;

    await SecureStorage.clearAll();
    setAuthToken(null);

    return Promise.reject(refreshError);
  }
}
