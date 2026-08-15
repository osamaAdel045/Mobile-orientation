/**
 * WebSocket domain types.
 *
 * The backend runs Laravel Reverb, which speaks the Pusher wire protocol:
 * connection meta-messages (`pusher:connection_established`, `pusher:ping`,
 * `pusher:subscribe`, ...) are delivered alongside application events whose
 * names are set by `broadcastAs()` in each `ShouldBroadcast` event.
 */

export type WebSocketStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type WebSocketEventHandler = (data: unknown, channel: string | undefined) => void;

export interface WebSocketEventMessage {
  event: string;
  data: unknown;
  channel?: string;
}

/**
 * Payload of `OrderStatusChanged` (broadcast as `order.status_update`).
 * Sent on the `private-orders.{userId}` channel.
 */
export interface OrderStatusEventPayload {
  order_uuid: string;
  order_number: string;
  from_status: string;
  to_status: string;
  note: string | null;
  customer_name: string | null;
  restaurant_name: string | null;
  total: string;
  updated_at: string;
}

/**
 * Payload of `NewDriverJob` (broadcast as `driver.new_job`).
 * Sent on the `private-driver.{driverId}` channel.
 */
export interface DriverJobEventPayload {
  order_uuid: string;
  order_number: string;
  driver_uuid: string | null;
  restaurant_name: string | null;
  estimated_earnings: string;
  timeout_seconds: number;
}

/**
 * Payload of `DriverAssigned` (broadcast as `driver.assigned`).
 * Sent on the `private-orders.{userId}` channel.
 */
export interface DriverAssignedEventPayload {
  order_uuid: string;
  order_number: string;
  driver_uuid: string | null;
  driver_name: string | null;
  restaurant_name: string | null;
  updated_at: string;
}

/**
 * Payload of `DriverLocationUpdated` (broadcast as `driver.location_update`).
 * Sent on the `private-delivery.{orderUuid}` channel.
 */
export interface DriverLocationEventPayload {
  lat: number;
  lng: number;
  bearing: number;
}
