import { useEffect } from 'react';

import { useRestaurantStore } from '../store/restaurant.store';

export function useCustomerRestaurant(uuid: string) {
  const screenState = useRestaurantStore((s) => s.screenState);
  const selectedCategoryIndex = useRestaurantStore((s) => s.selectedCategoryIndex);
  const load = useRestaurantStore((s) => s.load);
  const selectCategory = useRestaurantStore((s) => s.selectCategory);

  useEffect(() => {
    if (uuid) {
      load(uuid);
    }
  }, [uuid, load]);

  const data = screenState.status === 'loaded' ? screenState.data : null;
  const categories = data?.categories ?? [];
  const selectedCategory = categories[selectedCategoryIndex] ?? null;

  return {
    screenState,
    data,
    categories,
    selectedCategoryIndex,
    selectedCategory,
    selectCategory,
    load: () => load(uuid),
  };
}
