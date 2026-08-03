import { useCallback } from 'react';

import { useCustomerSearchStore } from '../store/search.store';

export function useCustomerSearch() {
  const screenState = useCustomerSearchStore((s) => s.screenState);
  const load = useCustomerSearchStore((s) => s.load);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { screenState, refresh };
}
