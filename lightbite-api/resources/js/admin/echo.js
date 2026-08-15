import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { ref } from 'vue';
import api from './stores/api';

// pusher-js must be exposed on window for laravel-echo's reverb connector.
window.Pusher = Pusher;

/** Reactive connection status, bound to the active Echo connector. */
export const realtimeStatus = ref('connecting');

let echo = null;

function bindConnectionEvents(instance) {
  const pusher = instance.connector?.pusher;
  if (!pusher?.connection) return;

  pusher.connection.bind('connected', () => { realtimeStatus.value = 'connected'; });
  pusher.connection.bind('disconnected', () => { realtimeStatus.value = 'disconnected'; });
  pusher.connection.bind('error', () => { realtimeStatus.value = 'error'; });
  pusher.connection.bind('connecting', () => { realtimeStatus.value = 'connecting'; });
}

/**
 * Lazily create a singleton Echo instance configured for Laravel Reverb.
 * The host/port/scheme are read from VITE_REVERB_* env vars (exposed by Vite).
 *
 * Channel authorization goes through the JWT-protected `/api/v1/admin/broadcast-auth`
 * endpoint via the shared axios instance, so the current admin token is always used.
 */
export function getEcho() {
  if (echo) return echo;

  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
  const port = Number(import.meta.env.VITE_REVERB_PORT) || 8080;

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    encrypted: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        api
          .post('/admin/broadcast-auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(false, response.data))
          .catch((error) => callback(true, error));
      },
    }),
  });

  bindConnectionEvents(echo);
  return echo;
}

/** Tear down the Echo connection (e.g. on logout). */
export function disconnectEcho() {
  if (echo) {
    try { echo.disconnect(); } catch (e) { /* ignore */ }
    echo = null;
  }
  realtimeStatus.value = 'connecting';
}

/**
 * Subscribe an admin to a private channel event.
 * Event names must be given with a leading dot when using broadcastAs()
 * so laravel-echo does not prepend the App.Events namespace.
 *
 * @returns {import('laravel-echo').Channel} the channel (call .stopListening() to unsubscribe)
 */
export function privateAdmin(event, callback) {
  const channel = getEcho().private('admin');
  channel.listen(`.${event}`, callback);
  return channel;
}
