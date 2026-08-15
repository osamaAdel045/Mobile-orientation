export { webSocketClient } from '@/core/websocket/client';
export { WebSocketProvider, useWebSocketContext } from '@/core/websocket/provider';
export { useWebSocketStatus, useWebSocketEvent } from '@/core/websocket/hooks';
export {
  buildSocketUrl,
  buildOrderChannel,
  buildDriverChannel,
  buildDeliveryChannel,
  ORDER_STATUS_EVENT,
  DRIVER_JOB_EVENT,
  DRIVER_ASSIGNED_EVENT,
  DRIVER_LOCATION_EVENT,
} from '@/core/websocket/config';
export type {
  WebSocketStatus,
  WebSocketEventHandler,
  OrderStatusEventPayload,
  DriverJobEventPayload,
  DriverAssignedEventPayload,
  DriverLocationEventPayload,
} from '@/core/websocket/types';
