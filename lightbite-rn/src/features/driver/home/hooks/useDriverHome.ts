import { useCallback } from 'react';

import { useDriverHomeStore } from '../store/home.store';

export function useDriverHome() {
  const isOnline = useDriverHomeStore((s) => s.isOnline);
  const isTogglingOnline = useDriverHomeStore((s) => s.isTogglingOnline);
  const jobOffer = useDriverHomeStore((s) => s.jobOffer);
  const activeDelivery = useDriverHomeStore((s) => s.activeDelivery);
  const pollingError = useDriverHomeStore((s) => s.pollingError);
  const isLive = useDriverHomeStore((s) => s.isLive);

  const toggleOnline = useDriverHomeStore((s) => s.toggleOnline);
  const startPolling = useDriverHomeStore((s) => s.startPolling);
  const stopPolling = useDriverHomeStore((s) => s.stopPolling);
  const recoverActiveDelivery = useDriverHomeStore((s) => s.recoverActiveDelivery);

  const handleToggleOnline = useCallback(() => {
    toggleOnline();
  }, [toggleOnline]);

  return {
    isOnline,
    isTogglingOnline,
    jobOffer,
    activeDelivery,
    pollingError,
    isLive,
    handleToggleOnline,
    startPolling,
    stopPolling,
    recoverActiveDelivery,
  };
}
