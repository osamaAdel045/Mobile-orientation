import { useEffect } from 'react';

import { useCustomerOrderStore } from '../store/order.store';

export function useCustomerOrder() {
  const screenState = useCustomerOrderStore((s) => s.screenState);
  const total = useCustomerOrderStore((s) => s.total);
  const hasMore = useCustomerOrderStore((s) => s.hasMore);
  const isLoadingMore = useCustomerOrderStore((s) => s.isLoadingMore);
  const load = useCustomerOrderStore((s) => s.load);
  const loadMore = useCustomerOrderStore((s) => s.loadMore);
  const refresh = useCustomerOrderStore((s) => s.refresh);

  useEffect(() => {
    load();
  }, [load]);

  return { screenState, total, hasMore, isLoadingMore, loadMore, refresh };
}
