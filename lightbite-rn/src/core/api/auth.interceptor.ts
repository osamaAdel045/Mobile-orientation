import type { InternalAxiosRequestConfig } from 'axios';

let currentToken: string | null = null;

export function setAuthToken(token: string | null): void {
  currentToken = token;
}

export async function authInterceptor(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  // Skip auth for refresh endpoint (avoids infinite loop)
  if (config.url?.includes('/auth/refresh')) {
    return config;
  }

  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }

  return config;
}
