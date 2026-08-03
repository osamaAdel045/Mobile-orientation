import { create } from 'zustand';

import { addToCart, clearCart, fetchCart, removeCartItem, updateCartItem } from '../api/cart.api';
import type { AddToCartRequest, Cart } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: Cart }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface CartStore {
  screenState: ScreenState;
  isLoading: boolean;
  conflictRestaurant: { name: string; pendingInput: AddToCartRequest } | null;

  load: () => Promise<void>;
  addItem: (input: AddToCartRequest) => Promise<boolean>;
  resolveConflict: (clear: boolean) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clear: () => Promise<void>;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  screenState: { status: 'loading' },
  isLoading: false,
  conflictRestaurant: null,

  load: async () => {
    set({ screenState: { status: 'loading' } });
    const result = await fetchCart();

    result.match(
      (cart) => {
        if (!cart || cart.items.length === 0) {
          set({ screenState: { status: 'empty' } });
        } else {
          set({ screenState: { status: 'loaded', data: cart } });
        }
      },
      (error) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },

  addItem: async (input) => {
    set({ isLoading: true });
    const result = await addToCart(input);

    const success = result.match(
      (cart) => {
        set({
          screenState: { status: 'loaded', data: cart },
          isLoading: false,
          conflictRestaurant: null,
        });
        return true;
      },
      (error) => {
        if (error.code === 'DIFFERENT_RESTAURANT') {
          set({
            conflictRestaurant: { name: error.message, pendingInput: input },
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
        return false;
      },
    );

    return success;
  },

  resolveConflict: async (clear: boolean) => {
    const { conflictRestaurant } = get();
    if (!conflictRestaurant) return;

    set({ isLoading: true });
    const result = await addToCart(conflictRestaurant.pendingInput, clear);

    result.match(
      (cart) => {
        set({
          screenState: { status: 'loaded', data: cart },
          isLoading: false,
          conflictRestaurant: null,
        });
      },
      () => {
        set({ isLoading: false });
      },
    );
  },

  updateQuantity: async (id, quantity) => {
    await updateCartItem(id, quantity);
    await get().load();
  },

  removeItem: async (id) => {
    await removeCartItem(id);
    await get().load();
  },

  clear: async () => {
    await clearCart();
    set({ screenState: { status: 'empty' } });
  },

  getItemCount: () => {
    const { screenState } = get();
    if (screenState.status === 'loaded') {
      return screenState.data.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return 0;
  },
}));
