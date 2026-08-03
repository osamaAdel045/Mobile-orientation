import { useEffect } from 'react';

import { useHomeStore } from '../store/home.store';

export function useCustomerHome() {
  const screenState = useHomeStore((s) => s.screenState);
  const load = useHomeStore((s) => s.load);
  const loadMore = useHomeStore((s) => s.loadMore);
  const refresh = useHomeStore((s) => s.refresh);
  const setQuery = useHomeStore((s) => s.setQuery);
  const setCuisine = useHomeStore((s) => s.setCuisine);
  const setSort = useHomeStore((s) => s.setSort);
  const query = useHomeStore((s) => s.query);
  const selectedCuisine = useHomeStore((s) => s.selectedCuisine);
  const sortBy = useHomeStore((s) => s.sortBy);
  const isLoadingMore = useHomeStore((s) => s.isLoadingMore);
  const hasMore = useHomeStore((s) => s.hasMore);
  const allRestaurants = useHomeStore((s) => s.allRestaurants);

  useEffect(() => {
    load();
  }, [load]);

  return {
    screenState,
    refresh,
    loadMore,
    setQuery,
    setCuisine,
    setSort,
    query,
    selectedCuisine,
    sortBy,
    isLoadingMore,
    hasMore,
    allRestaurants,
  };
}
