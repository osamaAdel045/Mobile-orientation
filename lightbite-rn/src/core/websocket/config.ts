/**
 * Reverb (Pusher-protocol) connection configuration.
 *
 * Override any value via `EXPO_PUBLIC_*` env vars. Defaults target a local
 * Reverb server on port 8080, matching `REVERB_PORT` in the Laravel backend.
 */

const REVERB_HOST = process.env.EXPO_PUBLIC_REVERB_HOST ?? 'localhost';
const REVERB_PORT = process.env.EXPO_PUBLIC_REVERB_PORT ?? '8080';
const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'ws';
const REVERB_APP_KEY = process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? 'lightbite';

/** Build the Reverb WebSocket URL, mirroring the Pusher handshake query. */
export function buildSocketUrl(): string {
  const params = new URLSearchParams({
    protocol: '7',
    client: 'react-native',
    version: '1.0.0',
    flash: 'false',
  });
  return `${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${REVERB_APP_KEY}?${params.toString()}`;
}

export const WS_RECONNECT_BASE_DELAY_MS = 1_000;
export const WS_RECONNECT_MAX_DELAY_MS = 30_000;
export const WS_PING_INTERVAL_MS = 25_000;

/** Broadcast event names (from `broadcastAs()` on each backend event). */
export const ORDER_STATUS_EVENT = 'order.status_update';
export const DRIVER_JOB_EVENT = 'driver.new_job';
export const DRIVER_ASSIGNED_EVENT = 'driver.assigned';
export const DRIVER_LOCATION_EVENT = 'driver.location_update';

/** Private channel prefixes. Only these channels require `/broadcasting/auth`. */
export const PRIVATE_CHANNEL_PREFIX = 'private-';

/** Build the private channel a customer listens on for order events. */
export function buildOrderChannel(userId: string): string {
  return `private-orders.${userId}`;
}

/** Build the private channel a driver listens on for job offers. */
export function buildDriverChannel(driverId: string): string {
  return `private-driver.${driverId}`;
}

/** Build the private channel a customer watches for live driver location. */
export function buildDeliveryChannel(orderUuid: string): string {
  return `private-delivery.${orderUuid}`;
}
