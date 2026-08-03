import { create } from 'zustand';

import { useCustomerAddressStore } from '@/features/customer/address/store/address.store';
import { useCartStore } from '@/features/customer/cart/store/cart.store';

import { placeOrder } from '../api/checkout.api';
import type { OrderResult } from '../types';

interface CheckoutStore {
  isPlacingOrder: boolean;
  orderError: string | null;
  orderResult: OrderResult | null;
  customerNote: string;

  setCustomerNote: (note: string) => void;
  placeOrder: () => Promise<boolean>;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  isPlacingOrder: false,
  orderError: null,
  orderResult: null,
  customerNote: '',

  setCustomerNote: (note) => set({ customerNote: note }),

  placeOrder: async () => {
    const cart = useCartStore.getState();
    const address = useCustomerAddressStore.getState();

    if (cart.screenState.status !== 'loaded') return false;

    const addresses = address.screenState.status === 'loaded' ? address.screenState.data : [];
    const selectedAddress = addresses.find((a) => a.uuid === address.selectedUuid);
    if (!selectedAddress) {
      set({ orderError: 'Please select a delivery address' });
      return false;
    }

    set({ isPlacingOrder: true, orderError: null });

    const result = await placeOrder({
      restaurant_uuid: cart.screenState.data.restaurant.uuid,
      delivery_address_uuid: selectedAddress.uuid,
      customer_note: get().customerNote || undefined,
    });

    return result.match(
      (order) => {
        set({ orderResult: order, isPlacingOrder: false });
        return true;
      },
      (error) => {
        set({ orderError: error.message, isPlacingOrder: false });
        return false;
      },
    );
  },

  reset: () =>
    set({ isPlacingOrder: false, orderError: null, orderResult: null, customerNote: '' }),
}));
