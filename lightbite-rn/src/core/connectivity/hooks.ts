import { useConnectivityStore } from '@/core/connectivity/store';

/** Read-only access to current connectivity for UI (e.g. OfflineBanner). */
export function useConnectivity() {
  const isOffline = useConnectivityStore((s) => s.isOffline);
  return { isOffline };
}
