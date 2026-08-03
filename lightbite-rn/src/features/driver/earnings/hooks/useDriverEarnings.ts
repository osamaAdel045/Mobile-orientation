import { useCallback, useEffect } from 'react';

import { useDriverEarningsStore } from '../store/earnings.store';

export function useDriverEarnings() {
  const screenState = useDriverEarningsStore((s) => s.screenState);
  const load = useDriverEarningsStore((s) => s.load);
  const refresh = useDriverEarningsStore((s) => s.refresh);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return { screenState, refresh: handleRefresh };
}
