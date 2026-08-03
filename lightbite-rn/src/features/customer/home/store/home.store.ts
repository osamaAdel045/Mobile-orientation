import { create } from 'zustand';

import { fetchRestaurants } from '../api/home.api';
import type { Restaurant, SortOption } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: Restaurant[] }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface HomeStore {
  screenState: ScreenState;
  allRestaurants: Restaurant[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  query: string;
  selectedCuisine: string | null;
  sortBy: SortOption;
  isLoadingMore: boolean;

  load: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setQuery: (query: string) => void;
  setCuisine: (cuisine: string | null) => void;
  setSort: (sort: SortOption) => void;
  getFilteredRestaurants: () => Restaurant[];
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  screenState: { status: 'loading' },
  allRestaurants: [],
  total: 0,
  hasMore: false,
  currentPage: 1,
  query: '',
  selectedCuisine: null,
  sortBy: 'distance',
  isLoadingMore: false,

  load: async () => {
    set({ screenState: { status: 'loading' }, currentPage: 1 });

    const { query, selectedCuisine, sortBy } = get();
    const cuisineParam = selectedCuisine ? [selectedCuisine] : undefined;

    const result = await fetchRestaurants({
      query: query || undefined,
      cuisine: cuisineParam,
      sort: sortBy,
      page: 1,
    });

    result.match(
      ({ restaurants, total, hasMore }) => {
        set({
          allRestaurants: restaurants,
          total,
          hasMore,
          currentPage: 1,
          screenState:
            restaurants.length === 0
              ? { status: 'empty' }
              : { status: 'loaded', data: restaurants },
        });
      },
      (error) => {
        if (get().allRestaurants.length === 0) {
          set({ screenState: { status: 'error', message: error.message } });
        }
      },
    );
  },

  loadMore: async () => {
    const { hasMore, isLoadingMore, currentPage, allRestaurants, query, selectedCuisine, sortBy } =
      get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    const nextPage = currentPage + 1;

    const cuisineParam = selectedCuisine ? [selectedCuisine] : undefined;
    const result = await fetchRestaurants({
      query: query || undefined,
      cuisine: cuisineParam,
      sort: sortBy,
      page: nextPage,
    });

    result.match(
      ({ restaurants, total, hasMore: more }) => {
        const updated = [...allRestaurants, ...restaurants];
        set({
          allRestaurants: updated,
          total,
          hasMore: more,
          currentPage: nextPage,
          isLoadingMore: false,
          screenState: { status: 'loaded', data: updated },
        });
      },
      () => {
        set({ isLoadingMore: false });
      },
    );
  },

  refresh: async () => {
    await get().load();
  },

  setQuery: (query) => {
    set({ query });
    get().load();
  },

  setCuisine: (cuisine) => {
    set({ selectedCuisine: cuisine });
    get().load();
  },

  setSort: (sort) => {
    set({ sortBy: sort });
    get().load();
  },

  getFilteredRestaurants: () => {
    const { allRestaurants } = get();
    return allRestaurants;
  },
}));
