# API & Networking

LightBite React Native uses **Axios** with a complete interceptor chain, **Zod** for response validation, **Neverthrow** for error handling, and a **WebSocket client** for real-time events. The HTTP layer is a direct port of the Flutter app's Dio + dartz pattern; the WebSocket layer connects to Laravel Reverb.

## Architecture

```
HTTP:  API Call → Auth Interceptor → Refresh Interceptor → Backend
                      ↑                    ↑
                Attaches Bearer      Handles 401 with
                token (skip refresh) queue-safe refresh

WS:    Reverb Socket → private-channel auth → event dispatch → stores
```

All API functions return `Result<T, AppError>` from **Neverthrow** — see [Error Handling](#error-handling) below.

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

## WebSocket Client

Real-time events use a **minimal Pusher-protocol client** for Laravel Reverb, living in `src/core/websocket/`. It speaks the Pusher wire protocol, so any Pusher-compatible backend would work.

```
src/core/websocket/
├── client.ts     # Singleton WebSocketClient (connect, subscribe, on, reconnect)
├── config.ts     # URL builder, env overrides, event names, channel builders
├── hooks.ts      # useWebSocketStatus, useWebSocketEvent (React bindings)
├── provider.tsx  # WebSocketProvider — auto-connect on auth, teardown on logout
└── types.ts      # WebSocketStatus, event payloads
```

Key behaviors:

- **Auto-reconnect with exponential backoff.** On socket drop, reconnects with `1s → 30s` backoff (base × 2^attempt, capped at `WS_RECONNECT_MAX_DELAY_MS`), then replays all subscribed channels.
- **Private channel auth.** Subscriptions to `private-*` channels authenticate via `POST /broadcasting/auth` (the standard Pusher handshake) before the `pusher:subscribe` is sent.
- **Keepalive pings.** Sends `pusher:ping` every 25s so proxies don't idle the socket out.
- **Event dispatch.** Application events registered with `broadcastAs()` on the backend (e.g. `driver.new_job`) are dispatched to handlers registered via `on()`.

```typescript
// src/core/websocket/config.ts
const REVERB_HOST = process.env.EXPO_PUBLIC_REVERB_HOST ?? 'localhost';
const REVERB_PORT = process.env.EXPO_PUBLIC_REVERB_PORT ?? '8080';
const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'ws';
const REVERB_APP_KEY = process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? 'lightbite';
```

The singleton `webSocketClient` is shared by feature stores (which call `subscribe` / `on` directly) and by `WebSocketProvider`, which wires auto-connect/disconnect to the auth lifecycle — connect once a session exists, tear down on logout.

### WebSocket replaces polling

- **Order tracking** (`useOrderTrackingStore.startPolling`) subscribes to `private-orders.{userId}` and live-refreshes on `order.status_update` and `driver.assigned`. Polling only fires while the socket is not connected.
- **Driver job discovery** (`useDriverHomeStore.startPolling`) subscribes to `private-driver.{driverId}` and sets the `jobOffer` on `driver.new_job`. Polling is a fallback with exponential backoff, active only when `webSocketClient.isConnected()` is false.

### Channels & Events

| Channel | Event | Purpose |
|---|---|---|
| `private-orders.{userId}` | `order.status_update` | Order status changed |
| `private-orders.{userId}` | `driver.assigned` | Driver assigned to order |
| `private-driver.{driverId}` | `driver.new_job` | New job offer for driver |
| `private-delivery.{orderUuid}` | `driver.location_update` | Live driver location |

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

## New Endpoints

### `GET /driver/active-delivery`

Recovers an in-progress delivery after an app restart. Returns the driver's current job plus the phase derived from its backend status:

| Backend status | Phase |
|---|---|
| `assigned` | `pickup` |
| `picked_up` | `picked_up` |
| `delivering` | `delivering` |

The driver home screen calls this on mount via `recoverActiveDelivery()` and restores the "Active Delivery" card (see [Driver Home](../features/driver-home)). Returns an empty body when the driver has no active delivery.

## Best Practices

- **All API functions return `Result<T, AppError>` from Neverthrow.** Never throw from API functions. Components and hooks consume via `.match()` — never try/catch.
- **Validate requests with Zod before sending.** Catch validation errors at the edge, not in business logic.
- **The refresh interceptor is the single source of truth for session expiry.** If it fails, it clears local state — consumers don't need to handle 401 separately.
- **Don't use apiClient directly in components.** Always go through a feature's API module.
- **WebSocket is the primary live signal; polling is the fallback.** Stores subscribe to Reverb channels and only poll while `webSocketClient.isConnected()` is false.
- **Access the WebSocket through the store layer, not components.** Feature stores call `subscribe` / `on` on the singleton; screens read state. The `WebSocketProvider` owns connect/disconnect around the auth lifecycle.

## Next Steps

- [State Management](./state-management) — how stores consume API results
- [Architecture](./architecture) — where API code lives in the feature structure
- [Code Quality](./code-quality) — how ESLint/TypeScript enforce these patterns
