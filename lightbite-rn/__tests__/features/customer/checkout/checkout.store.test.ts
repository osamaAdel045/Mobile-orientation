import { err, ok } from 'neverthrow';

import type { AppError } from '@/core/api/types';
import { useCustomerAddressStore } from '@/features/customer/address/store/address.store';
import type { Address } from '@/features/customer/address/types';
import { useCartStore } from '@/features/customer/cart/store/cart.store';
import type { Cart } from '@/features/customer/cart/types';
import { placeOrder } from '@/features/customer/checkout/api/checkout.api';
import { useCheckoutStore } from '@/features/customer/checkout/store/checkout.store';
import type { OrderResult } from '@/features/customer/checkout/types';

jest.mock('@/features/customer/checkout/api/checkout.api', () => ({
  placeOrder: jest.fn(),
}));

const mockPlaceOrder = placeOrder as jest.MockedFunction<typeof placeOrder>;

const cart: Cart = {
  uuid: 'cart-1',
  restaurant: { uuid: 'r1', name: 'Spice Route' },
  items: [
    {
      id: 1,
      menu_item: { uuid: 'mi-1', name: 'Hummus' },
      quantity: 2,
      unit_price: 'AED 22.00',
      subtotal: 'AED 44.00',
      special_instructions: null,
    },
  ],
  subtotal: 'AED 44.00',
  delivery_fee: 'AED 5.00',
  tax: 'AED 2.45',
  total: 'AED 51.45',
  expires_at: '2026-08-02T12:00:00Z',
};

const address: Address = {
  uuid: 'addr-1',
  label: 'home',
  address: 'Downtown, Street 5',
  apartment: 'Tower 3, Apt 1203',
  lat: 25.2048,
  lng: 55.2708,
  is_default: true,
};

const order: OrderResult = {
  uuid: 'ord-1',
  order_number: 'LB-20260726-00001',
  status: 'pending',
  restaurant: { name: 'Spice Route' },
  subtotal: 'AED 44.00',
  delivery_fee: 'AED 5.00',
  tax: 'AED 2.45',
  total: 'AED 51.45',
  estimated_delivery_min: 30,
  created_at: '2026-07-26T10:00:00Z',
};

describe('CheckoutStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCheckoutStore.setState({
      isPlacingOrder: false,
      orderError: null,
      orderResult: null,
      customerNote: '',
      paymentMethod: 'cash_on_delivery',
    });
    useCartStore.setState({
      screenState: { status: 'loading' },
      isLoading: false,
      conflictRestaurant: null,
    });
    useCustomerAddressStore.setState({
      screenState: { status: 'empty' },
      isMutating: false,
      selectedUuid: null,
    });
  });

  it('initializes with default state', () => {
    const state = useCheckoutStore.getState();
    expect(state.isPlacingOrder).toBe(false);
    expect(state.orderError).toBeNull();
    expect(state.orderResult).toBeNull();
    expect(state.customerNote).toBe('');
    expect(state.paymentMethod).toBe('cash_on_delivery');
  });

  it('returns false without calling the API when the cart is not loaded', async () => {
    const success = await useCheckoutStore.getState().placeOrder();

    expect(success).toBe(false);
    expect(mockPlaceOrder).not.toHaveBeenCalled();
  });

  it('sets an error when no address is selected', async () => {
    useCartStore.setState({ screenState: { status: 'loaded', data: cart } });
    useCustomerAddressStore.setState({
      screenState: { status: 'loaded', data: [address] },
      selectedUuid: null,
    });

    const success = await useCheckoutStore.getState().placeOrder();

    expect(success).toBe(false);
    expect(useCheckoutStore.getState().orderError).toBe('Please select a delivery address');
    expect(mockPlaceOrder).not.toHaveBeenCalled();
  });

  it('places an order and stores the result', async () => {
    useCartStore.setState({ screenState: { status: 'loaded', data: cart } });
    useCustomerAddressStore.setState({
      screenState: { status: 'loaded', data: [address] },
      selectedUuid: 'addr-1',
    });
    useCheckoutStore.setState({ customerNote: 'Ring bell #1203' });
    mockPlaceOrder.mockResolvedValueOnce(ok(order));

    const success = await useCheckoutStore.getState().placeOrder();

    expect(success).toBe(true);
    expect(mockPlaceOrder).toHaveBeenCalledWith({
      restaurant_uuid: 'r1',
      delivery_address_uuid: 'addr-1',
      payment_method: 'cash_on_delivery',
      customer_note: 'Ring bell #1203',
    });
    expect(useCheckoutStore.getState().orderResult).toEqual(order);
    expect(useCheckoutStore.getState().isPlacingOrder).toBe(false);
    expect(useCheckoutStore.getState().orderError).toBeNull();
  });

  it('omits customer_note when empty', async () => {
    useCartStore.setState({ screenState: { status: 'loaded', data: cart } });
    useCustomerAddressStore.setState({
      screenState: { status: 'loaded', data: [address] },
      selectedUuid: 'addr-1',
    });
    mockPlaceOrder.mockResolvedValueOnce(ok(order));

    await useCheckoutStore.getState().placeOrder();

    expect(mockPlaceOrder).toHaveBeenCalledWith({
      restaurant_uuid: 'r1',
      delivery_address_uuid: 'addr-1',
      payment_method: 'cash_on_delivery',
      customer_note: undefined,
    });
  });

  it('sets an error when the API call fails', async () => {
    useCartStore.setState({ screenState: { status: 'loaded', data: cart } });
    useCustomerAddressStore.setState({
      screenState: { status: 'loaded', data: [address] },
      selectedUuid: 'addr-1',
    });
    const error: AppError = {
      code: 'SERVER_ERROR',
      message: 'Something went wrong.',
      statusCode: 500,
    };
    mockPlaceOrder.mockResolvedValueOnce(err(error));

    const success = await useCheckoutStore.getState().placeOrder();

    expect(success).toBe(false);
    expect(useCheckoutStore.getState().orderError).toBe('Something went wrong.');
    expect(useCheckoutStore.getState().isPlacingOrder).toBe(false);
    expect(useCheckoutStore.getState().orderResult).toBeNull();
  });

  it('sets the customer note', () => {
    useCheckoutStore.getState().setCustomerNote('Ring bell');

    expect(useCheckoutStore.getState().customerNote).toBe('Ring bell');
  });

  it('sets the payment method', () => {
    useCheckoutStore.getState().setPaymentMethod('card');

    expect(useCheckoutStore.getState().paymentMethod).toBe('card');
  });

  it('includes the selected payment method when placing an order', async () => {
    useCartStore.setState({ screenState: { status: 'loaded', data: cart } });
    useCustomerAddressStore.setState({
      screenState: { status: 'loaded', data: [address] },
      selectedUuid: 'addr-1',
    });
    useCheckoutStore.getState().setPaymentMethod('card');
    mockPlaceOrder.mockResolvedValueOnce(ok(order));

    const success = await useCheckoutStore.getState().placeOrder();

    expect(success).toBe(true);
    expect(mockPlaceOrder).toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: 'card' }),
    );
  });

  it('resets all state', () => {
    useCheckoutStore.setState({
      isPlacingOrder: true,
      orderError: 'Something went wrong.',
      orderResult: order,
      customerNote: 'Ring bell',
      paymentMethod: 'card',
    });

    useCheckoutStore.getState().reset();

    const state = useCheckoutStore.getState();
    expect(state.isPlacingOrder).toBe(false);
    expect(state.orderError).toBeNull();
    expect(state.orderResult).toBeNull();
    expect(state.customerNote).toBe('');
    expect(state.paymentMethod).toBe('cash_on_delivery');
  });
});
