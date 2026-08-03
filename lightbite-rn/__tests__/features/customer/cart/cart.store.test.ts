import { err, ok } from 'neverthrow';

import type { AppError } from '@/core/api/types';
import {
  addToCart,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '@/features/customer/cart/api/cart.api';
import { useCartStore } from '@/features/customer/cart/store/cart.store';
import type { Cart } from '@/features/customer/cart/types';

jest.mock('@/features/customer/cart/api/cart.api', () => ({
  fetchCart: jest.fn(),
  addToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  clearCart: jest.fn(),
}));

const mockFetchCart = fetchCart as jest.MockedFunction<typeof fetchCart>;
const mockAddToCart = addToCart as jest.MockedFunction<typeof addToCart>;
const mockUpdateCartItem = updateCartItem as jest.MockedFunction<typeof updateCartItem>;
const mockRemoveCartItem = removeCartItem as jest.MockedFunction<typeof removeCartItem>;
const mockClearCart = clearCart as jest.MockedFunction<typeof clearCart>;

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

describe('CartStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCartStore.setState({
      screenState: { status: 'loading' },
      isLoading: false,
      conflictRestaurant: null,
    });
  });

  it('initializes with loading state', () => {
    expect(useCartStore.getState().screenState).toEqual({ status: 'loading' });
  });

  it('loads a non-empty cart', async () => {
    mockFetchCart.mockResolvedValueOnce(ok(cart));

    await useCartStore.getState().load();

    expect(mockFetchCart).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().screenState).toEqual({ status: 'loaded', data: cart });
  });

  it('sets empty state when the cart has no items', async () => {
    mockFetchCart.mockResolvedValueOnce(ok({ ...cart, items: [] }));

    await useCartStore.getState().load();

    expect(useCartStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('sets empty state when the cart is null', async () => {
    mockFetchCart.mockResolvedValueOnce(ok(null));

    await useCartStore.getState().load();

    expect(useCartStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('sets error state on failure', async () => {
    const error: AppError = {
      code: 'SERVER_ERROR',
      message: 'Something went wrong.',
      statusCode: 500,
    };
    mockFetchCart.mockResolvedValueOnce(err(error));

    await useCartStore.getState().load();

    expect(useCartStore.getState().screenState).toEqual({
      status: 'error',
      message: error.message,
    });
  });

  it('adds an item and updates the cart', async () => {
    mockAddToCart.mockResolvedValueOnce(ok(cart));

    const success = await useCartStore.getState().addItem({
      menu_item_uuid: 'mi-1',
      quantity: 2,
    });

    expect(success).toBe(true);
    expect(mockAddToCart).toHaveBeenCalledWith({ menu_item_uuid: 'mi-1', quantity: 2 });
    expect(useCartStore.getState().screenState).toEqual({ status: 'loaded', data: cart });
    expect(useCartStore.getState().conflictRestaurant).toBeNull();
  });

  it('sets a conflict when adding from a different restaurant', async () => {
    const conflictError: AppError = {
      code: 'DIFFERENT_RESTAURANT',
      message: 'Adding from X will clear your current cart from Y. Continue?',
      statusCode: 409,
    };
    mockAddToCart.mockResolvedValueOnce(err(conflictError));

    const input = { menu_item_uuid: 'mi-2', quantity: 1 };
    const success = await useCartStore.getState().addItem(input);

    expect(success).toBe(false);
    expect(useCartStore.getState().conflictRestaurant).toEqual({
      name: conflictError.message,
      pendingInput: input,
    });
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it('resolves a conflict with the clear flag', async () => {
    mockAddToCart.mockResolvedValueOnce(
      err<Cart, AppError>({
        code: 'DIFFERENT_RESTAURANT',
        message: 'Adding from X will clear your current cart from Y. Continue?',
        statusCode: 409,
      }),
    );
    await useCartStore.getState().addItem({ menu_item_uuid: 'mi-2', quantity: 1 });

    mockAddToCart.mockResolvedValueOnce(ok(cart));
    await useCartStore.getState().resolveConflict(true);

    expect(mockAddToCart).toHaveBeenLastCalledWith({ menu_item_uuid: 'mi-2', quantity: 1 }, true);
    expect(useCartStore.getState().screenState).toEqual({ status: 'loaded', data: cart });
    expect(useCartStore.getState().conflictRestaurant).toBeNull();
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it('does nothing when resolving a conflict that was never set', async () => {
    await useCartStore.getState().resolveConflict(true);

    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('updates quantity and empties the cart when no items remain', async () => {
    mockUpdateCartItem.mockResolvedValueOnce(ok({ ...cart, items: [] }));

    await useCartStore.getState().updateQuantity(1, 0);

    expect(mockUpdateCartItem).toHaveBeenCalledWith(1, 0);
    expect(useCartStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('removes an item and keeps loaded state', async () => {
    mockRemoveCartItem.mockResolvedValueOnce(ok(cart));

    await useCartStore.getState().removeItem(1);

    expect(mockRemoveCartItem).toHaveBeenCalledWith(1);
    expect(useCartStore.getState().screenState).toEqual({ status: 'loaded', data: cart });
  });

  it('clears the cart', async () => {
    mockClearCart.mockResolvedValueOnce(ok(undefined));

    await useCartStore.getState().clear();

    expect(mockClearCart).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('returns the total item count', () => {
    useCartStore.setState({ screenState: { status: 'loaded', data: cart } });
    expect(useCartStore.getState().getItemCount()).toBe(2);
  });

  it('returns zero item count when the cart is not loaded', () => {
    useCartStore.setState({ screenState: { status: 'empty' } });
    expect(useCartStore.getState().getItemCount()).toBe(0);
  });
});
