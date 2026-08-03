import { useCallback, useEffect } from 'react';

import { useDriverHistoryStore } from '../store/history.store';

export function useDriverHistory() {
  const screenState = useDriverHistoryStore((s) => s.screenState);
  const load = useDriverHistoryStore((s) => s.load);
  const refresh = useDriverHistoryStore((s) => s.refresh);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return { screenState, refresh: handleRefresh };
}
