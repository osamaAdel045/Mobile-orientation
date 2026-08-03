# API & Networking

LightBite React Native uses **Axios** with a complete interceptor chain, **Zod** for response validation, and **Neverthrow** for error handling. This is a direct port of the Flutter app's Dio + dartz pattern.

## Architecture

```
API Call → Auth Interceptor → Refresh Interceptor → Backend
                ↑                    ↑
          Attaches Bearer      Handles 401 with
          token (skip refresh) queue-safe refresh
```

## Axios Client

```typescript
// src/core/api/client.ts
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request: attach auth token
apiClient.interceptors.request.use(authInterceptor);

// Response: handle 401 with queue-safe refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = await refreshInterceptor(error);
    return apiClient(config);
  },
);
```

## Interceptor Chain

### Auth Interceptor

Attaches the Bearer token to every request. Skips `/auth/refresh` to prevent infinite loops.

```typescript
// src/core/api/auth.interceptor.ts
let currentToken: string | null = null;

export function setAuthToken(token: string | null): void {
  currentToken = token;
}

export async function authInterceptor(config: InternalAxiosRequestConfig) {
  if (config.url?.includes('/auth/refresh')) return config;
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
}
```

### Refresh Interceptor (Queue-Safe)

The most sophisticated piece of the networking layer. When a 401 hits:

1. Only **one** refresh call fires (guarded by `isRefreshing` flag)
2. All other concurrent 401s **queue up** in `pendingQueue`
3. When refresh completes, **all queued requests replay** with the new token
4. If refresh fails, **all queued requests reject** and local state clears

```typescript
// src/core/api/refresh.interceptor.ts
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

export async function refreshInterceptor(error: AxiosError) {
  if (error.response?.status !== 401 || originalRequest.url?.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  if (isRefreshing) {
    // Queue: wait for the in-flight refresh to complete
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve: (token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(originalRequest);
        },
        reject,
      });
    });
  }

  // Start refresh
  isRefreshing = true;
  try {
    const { access_token, refresh_token } = await refreshCall();
    setAuthToken(access_token);
    processQueue(null, access_token); // Resolve all queued
    return originalRequest;
  } catch (err) {
    processQueue(err, null); // Reject all queued
    await SecureStorage.clearAll();
    setAuthToken(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}
```

This is exactly the same logic as the Flutter `RefreshInterceptor` in `lib/core/network/refresh_interceptor.dart`.

## Error Handling

All API errors are mapped to a typed `AppError`:

```typescript
export interface AppError {
  code: string;       // 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | ...
  message: string;    // User-facing message
  statusCode: number; // HTTP status or 0 for network errors
}

export function mapApiError(error: unknown): AppError {
  // Handles: AxiosError with API response body
  // Handles: Network errors (ERR_NETWORK)
  // Handles: Timeout errors (ECONNABORTED)
  // Fallback: UNKNOWN with generic message
}
```

## API Response Shape

The Laravel backend wraps all responses:

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    trace_id?: string;
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}
```

API functions extract `response.data.data` — the inner `data` is the actual payload.

## Zod Validation

API responses are validated with Zod schemas before reaching stores:

```typescript
// src/features/auth/schemas/auth.schema.ts
export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

Zod provides both **runtime validation** and **TypeScript types** from a single schema definition. This is the #1 advantage React Native has over Flutter for data layer safety — in Flutter, `fromJson`/`toJson` are hand-written and error-prone.

## Best Practices

- **All API functions return `Result<T, AppError>`.** Never throw from API functions.
- **Validate requests with Zod before sending.** Catch validation errors at the edge, not in business logic.
- **The refresh interceptor is the single source of truth for session expiry.** If it fails, it clears local state — consumers don't need to handle 401 separately.
- **Don't use apiClient directly in components.** Always go through a feature's API module.

## Next Steps

- [State Management](./state-management) — how stores consume API results
- [Architecture](./architecture) — where API code lives in the feature structure
- [Code Quality](./code-quality) — how ESLint/TypeScript enforce these patterns
