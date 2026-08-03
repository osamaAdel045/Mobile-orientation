import axios from 'axios';

import { authInterceptor } from '@/core/api/auth.interceptor';
import { refreshInterceptor } from '@/core/api/refresh.interceptor';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const TIMEOUT = 30_000;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Response interceptor: handle 401 with refresh + log unexpected errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error?.config?.url ?? 'unknown';
    const status = error?.response?.status ?? 0;
    if (status === 404) {
      // eslint-disable-next-line no-console
      console.warn(`[API] 404 Not Found: ${error.config?.method?.toUpperCase() ?? 'GET'} ${url}`);
    }
    const config = await refreshInterceptor(error);
    return apiClient(config);
  },
);
