import { useCallback } from 'react';

import { useCustomerAddressStore } from '@/features/customer/address/store/address.store';
import type { Address } from '@/features/customer/address/types';
import { useCartStore } from '@/features/customer/cart/store/cart.store';

import { useCheckoutStore } from '../store/checkout.store';

export function useCustomerCheckout() {
  // Cart data
  const cartScreenState = useCartStore((s) => s.screenState);
  const cartIsLoading = useCartStore((s) => s.isLoading);
  const loadCart = useCartStore((s) => s.load);

  // Address data
  const addressScreenState = useCustomerAddressStore((s) => s.screenState);
  const selectedUuid = useCustomerAddressStore((s) => s.selectedUuid);
  const loadAddresses = useCustomerAddressStore((s) => s.load);
  const selectAddress = useCustomerAddressStore((s) => s.selectAddress);

  const addresses: Address[] =
    addressScreenState.status === 'loaded' ? addressScreenState.data : [];
  const selectedAddress = addresses.find((a) => a.uuid === selectedUuid) ?? null;

  const refreshCart = useCallback(() => {
    loadCart();
  }, [loadCart]);

  const refreshAddresses = useCallback(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Checkout actions
  const isPlacingOrder = useCheckoutStore((s) => s.isPlacingOrder);
  const orderError = useCheckoutStore((s) => s.orderError);
  const orderResult = useCheckoutStore((s) => s.orderResult);
  const customerNote = useCheckoutStore((s) => s.customerNote);
  const setCustomerNote = useCheckoutStore((s) => s.setCustomerNote);
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const placeOrder = useCheckoutStore((s) => s.placeOrder);
  const resetCheckout = useCheckoutStore((s) => s.reset);

  return {
    cartScreenState,
    cartIsLoading,
    refreshCart,
    addressScreenState,
    addresses,
    selectedAddress,
    selectedUuid,
    selectAddress,
    refreshAddresses,
    isPlacingOrder,
    orderError,
    orderResult,
    customerNote,
    setCustomerNote,
    paymentMethod,
    setPaymentMethod,
    placeOrder,
    resetCheckout,
  };
}
