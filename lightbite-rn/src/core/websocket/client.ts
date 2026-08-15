import { apiClient } from '@/core/api/client';
import {
  PRIVATE_CHANNEL_PREFIX,
  WS_PING_INTERVAL_MS,
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
  buildSocketUrl,
} from '@/core/websocket/config';
import type { WebSocketEventHandler, WebSocketStatus } from '@/core/websocket/types';

type Listener = (data: unknown, channel: string | undefined) => void;
type StatusListener = (status: WebSocketStatus) => void;

/** Matches the DOM `WebSocket.readyState` contract used by React Native. */
const CONNECTING = 0;
const OPEN = 1;

interface OutgoingEnvelope {
  event: string;
  data: unknown;
}

/**
 * Minimal Pusher-protocol client for Laravel Reverb.
 *
 * - Auto-reconnects with exponential backoff when the socket drops.
 * - Authenticates private channels through the backend `/broadcasting/auth`
 *   endpoint (the standard Pusher handshake) before subscribing.
 * - Dispatches application events to handlers registered via `on()`.
 *
 * The store layer calls `subscribe`/`on` directly; the React context in
 * `provider.tsx` wires auto-connect/disconnect to the auth lifecycle.
 */
class WebSocketClient {
  private socket: WebSocket | null = null;
  private socketId: string | null = null;
  private status: WebSocketStatus = 'idle';
  private channels = new Set<string>();

  private eventListeners = new Map<string, Set<Listener>>();
  private statusListeners = new Set<StatusListener>();

  private shouldReconnect = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  connect(): void {
    this.shouldReconnect = true;
    if (
      this.socket &&
      (this.socket.readyState === CONNECTING || this.socket.readyState === OPEN)
    ) {
      return;
    }
    this.openSocket();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.stopPing();
    this.channels.clear();

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.socketId = null;
    this.setStatus('disconnected');
  }

  /** Subscribe to a channel; replayed after reconnect. */
  subscribe(channel: string): void {
    this.channels.add(channel);
    if (this.socket?.readyState !== OPEN) return;
    void this.sendSubscribe(channel);
  }

  unsubscribe(channel: string): void {
    this.channels.delete(channel);
    if (this.socket?.readyState !== OPEN) return;
    this.send({ event: 'pusher:unsubscribe', data: { channel } });
  }

  /** Register an event handler. Returns an unsubscribe function. */
  on(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(handler);
    return () => {
      this.eventListeners.get(event)?.delete(handler);
    };
  }

  onStatusChange(handler: StatusListener): () => void {
    this.statusListeners.add(handler);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  getSocketId(): string | null {
    return this.socketId;
  }

  private openSocket(): void {
    this.clearReconnectTimer();
    this.setStatus(this.reconnectAttempts === 0 ? 'connecting' : 'reconnecting');

    let socket: WebSocket;
    try {
      socket = new WebSocket(buildSocketUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
    };

    socket.onmessage = (event: MessageEvent) => {
      this.handleMessage(event.data);
    };

    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      this.socketId = null;
      this.stopPing();
      this.setStatus(this.shouldReconnect ? 'reconnecting' : 'disconnected');
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    socket.onerror = () => {
      // `onerror` is always followed by `onclose`, which drives reconnect.
    };
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    if (!this.shouldReconnect) return;

    const backoff = Math.min(
      WS_RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
      WS_RECONNECT_MAX_DELAY_MS,
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.openSocket(), backoff);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.send({ event: 'pusher:ping', data: {} });
    }, WS_PING_INTERVAL_MS);
  }

  private stopPing(): void {
    if (this.pingTimer != null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private handleMessage(raw: unknown): void {
    if (typeof raw !== 'string') return;

    let message: { event?: unknown; data?: unknown; channel?: unknown };
    try {
      message = JSON.parse(raw) as { event?: unknown; data?: unknown; channel?: unknown };
    } catch {
      return;
    }

    const event = typeof message.event === 'string' ? message.event : '';
    const data = message.data;
    const channel = typeof message.channel === 'string' ? message.channel : undefined;

    switch (event) {
      case 'pusher:connection_established':
        if (data != null && typeof data === 'object') {
          const socketId = (data as { socket_id?: unknown }).socket_id;
          if (typeof socketId === 'string') this.socketId = socketId;
        }
        this.setStatus('connected');
        this.startPing();
        this.replaySubscriptions();
        return;
      case 'pusher:ping':
        this.send({ event: 'pusher:pong', data: {} });
        return;
      case 'pusher:pong':
        return;
      case 'pusher:error':
        // e.g. private-channel auth rejected. Keep the socket alive; the
        // polling fallback in the stores covers missing live updates.
        return;
      case 'pusher_internal:subscription_succeeded':
        return;
      default:
        this.dispatch(event, data, channel);
    }
  }

  private replaySubscriptions(): void {
    for (const channel of this.channels) {
      void this.sendSubscribe(channel);
    }
  }

  private async sendSubscribe(channel: string): Promise<void> {
    const data: Record<string, unknown> = { channel };
    if (channel.startsWith(PRIVATE_CHANNEL_PREFIX)) {
      const auth = await this.authenticateChannel(channel);
      if (auth != null) data.auth = auth;
    }
    this.send({ event: 'pusher:subscribe', data });
  }

  /** Standard Pusher private-channel handshake via the backend. */
  private async authenticateChannel(channel: string): Promise<string | null> {
    if (!this.socketId) return null;
    try {
      const response = await apiClient.post<{ auth?: string }>('/broadcasting/auth', {
        socket_id: this.socketId,
        channel_name: channel,
      });
      return response.data.auth ?? null;
    } catch {
      return null;
    }
  }

  private send(envelope: OutgoingEnvelope): void {
    if (this.socket?.readyState === OPEN) {
      this.socket.send(JSON.stringify(envelope));
    }
  }

  private dispatch(event: string, data: unknown, channel: string | undefined): void {
    const handlers = this.eventListeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        handler(data, channel);
      } catch {
        // A single bad handler must not break the event loop.
      }
    }
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}

/** Singleton shared by stores, providers, and hooks. */
export const webSocketClient = new WebSocketClient();
