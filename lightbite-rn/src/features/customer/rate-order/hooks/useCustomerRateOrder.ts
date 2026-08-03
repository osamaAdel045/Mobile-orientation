import { useCustomerRateOrderStore } from '../store/rate-order.store';

export function useCustomerRateOrder() {
  const isSubmitting = useCustomerRateOrderStore((s) => s.isSubmitting);
  const submit = useCustomerRateOrderStore((s) => s.submit);
  const reset = useCustomerRateOrderStore((s) => s.reset);

  return { isSubmitting, submit, reset };
}
