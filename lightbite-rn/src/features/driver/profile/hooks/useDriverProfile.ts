import { useCallback } from 'react';

import { useDriverProfileStore } from '../store/profile.store';

export function useDriverProfile() {
  const screenState = useDriverProfileStore((s) => s.screenState);
  const load = useDriverProfileStore((s) => s.load);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { screenState, refresh };
}
