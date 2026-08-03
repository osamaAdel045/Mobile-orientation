import { useEffect } from 'react';

import { useOrderTrackingStore } from '../store/order.store';

export function useCustomerOrderTracking(uuid: string) {
  const trackingState = useOrderTrackingStore((s) => s.trackingState);
  const load = useOrderTrackingStore((s) => s.load);
  const startPolling = useOrderTrackingStore((s) => s.startPolling);
  const stopPolling = useOrderTrackingStore((s) => s.stopPolling);
  const reset = useOrderTrackingStore((s) => s.reset);

  useEffect(() => {
    if (uuid) {
      load(uuid);
      startPolling(uuid);
    }

    return () => {
      reset();
    };
  }, [uuid, load, startPolling, reset]);

  return { trackingState, stopPolling, reload: () => load(uuid) };
}
