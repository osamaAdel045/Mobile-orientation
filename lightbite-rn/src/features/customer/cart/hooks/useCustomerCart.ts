import { useEffect } from 'react';

import { useCartStore } from '../store/cart.store';

export function useCustomerCart() {
  const screenState = useCartStore((s) => s.screenState);
  const isLoading = useCartStore((s) => s.isLoading);
  const conflictRestaurant = useCartStore((s) => s.conflictRestaurant);
  const load = useCartStore((s) => s.load);
  const addItem = useCartStore((s) => s.addItem);
  const resolveConflict = useCartStore((s) => s.resolveConflict);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const getItemCount = useCartStore((s) => s.getItemCount);

  useEffect(() => {
    load();
  }, [load]);

  return {
    screenState,
    isLoading,
    conflictRestaurant,
    addItem,
    resolveConflict,
    updateQuantity,
    removeItem,
    clear,
    getItemCount,
    refresh: load,
  };
}
