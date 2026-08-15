import { useDriverDeliveryStore } from '../store/delivery.store';

export function useDriverDelivery() {
  const job = useDriverDeliveryStore((s) => s.job);
  const phase = useDriverDeliveryStore((s) => s.phase);
  const isConfirming = useDriverDeliveryStore((s) => s.isConfirming);
  const completedEarnings = useDriverDeliveryStore((s) => s.completedEarnings);
  const error = useDriverDeliveryStore((s) => s.error);
  const setJob = useDriverDeliveryStore((s) => s.setJob);
  const confirmPickup = useDriverDeliveryStore((s) => s.confirmPickup);
  const startDelivery = useDriverDeliveryStore((s) => s.startDelivery);
  const confirmDelivery = useDriverDeliveryStore((s) => s.confirmDelivery);
  const clear = useDriverDeliveryStore((s) => s.clear);

  return {
    job,
    phase,
    isConfirming,
    completedEarnings,
    error,
    setJob,
    confirmPickup,
    startDelivery,
    confirmDelivery,
    clear,
  };
}
