import { err, ok } from 'neverthrow';

import type { AppError } from '@/core/api/types';
import { fetchOrders, fetchOrderTracking } from '@/features/customer/order/api/order.api';
import {
  useCustomerOrderStore,
  useOrderTrackingStore,
} from '@/features/customer/order/store/order.store';
import type { Order, OrderTracking } from '@/features/customer/order/types';

jest.mock('@/features/customer/order/api/order.api', () => ({
  fetchOrders: jest.fn(),
  fetchOrderTracking: jest.fn(),
}));

const mockFetchOrders = fetchOrders as jest.MockedFunction<typeof fetchOrders>;
const mockFetchOrderTracking = fetchOrderTracking as jest.MockedFunction<typeof fetchOrderTracking>;

const orderA: Order = {
  uuid: 'ord-1',
  order_number: 'LB-20260726-00001',
  status: 'delivered',
  restaurant: { name: 'Spice Route', uuid: 'r1' },
  items: [{ name: 'Hummus', quantity: 2, unit_price: 'AED 22.00' }],
  subtotal: 'AED 58.00',
  total: 'AED 66.15',
  created_at: '2026-07-26T12:05:00Z',
};

const orderB: Order = {
  ...orderA,
  uuid: 'ord-2',
  order_number: 'LB-20260726-00002',
};

const tracking: OrderTracking = {
  uuid: 'ord-1',
  status: 'delivering',
  status_history: [
    { status: 'pending', timestamp: '2026-07-26T12:05:00Z' },
    { status: 'confirmed', timestamp: '2026-07-26T12:07:00Z' },
    { status: 'delivering', timestamp: '2026-07-26T12:30:00Z' },
  ],
  driver: {
    name: 'Khalid',
    photo_url: 'https://example.com/khalid.jpg',
    rating: 4.8,
    lat: 25.0805,
    lng: 55.1395,
    bearing: 270,
    eta_min: 3,
  },
  estimated_delivery_at: '2026-07-26T12:40:00Z',
};

const serverError: AppError = {
  code: 'SERVER_ERROR',
  message: 'Something went wrong.',
  statusCode: 500,
};

describe('CustomerOrderStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCustomerOrderStore.setState({
      screenState: { status: 'loading' },
      total: 0,
      hasMore: false,
      currentPage: 1,
      isLoadingMore: false,
    });
    useOrderTrackingStore.getState().reset();
  });

  it('initializes with loading state', () => {
    const state = useCustomerOrderStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });

  it('loads orders into loaded state', async () => {
    mockFetchOrders.mockResolvedValueOnce(ok({ orders: [orderA, orderB], total: 2 }));

    await useCustomerOrderStore.getState().load();

    expect(mockFetchOrders).toHaveBeenCalledWith(1);
    expect(useCustomerOrderStore.getState().screenState).toEqual({
      status: 'loaded',
      data: [orderA, orderB],
    });
    expect(useCustomerOrderStore.getState().total).toBe(2);
    expect(useCustomerOrderStore.getState().hasMore).toBe(false);
  });

  it('marks screen state as empty when no orders exist', async () => {
    mockFetchOrders.mockResolvedValueOnce(ok({ orders: [], total: 0 }));

    await useCustomerOrderStore.getState().load();

    expect(useCustomerOrderStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('sets an error when the request fails', async () => {
    mockFetchOrders.mockResolvedValueOnce(err(serverError));

    await useCustomerOrderStore.getState().load();

    expect(useCustomerOrderStore.getState().screenState).toEqual({
      status: 'error',
      message: 'Something went wrong.',
    });
  });

  it('appends orders on loadMore while more pages exist', async () => {
    mockFetchOrders
      .mockResolvedValueOnce(ok({ orders: [orderA], total: 3 }))
      .mockResolvedValueOnce(ok({ orders: [orderB], total: 3 }));

    await useCustomerOrderStore.getState().load();
    await useCustomerOrderStore.getState().loadMore();

    expect(mockFetchOrders).toHaveBeenNthCalledWith(2, 2);
    expect(useCustomerOrderStore.getState().screenState).toEqual({
      status: 'loaded',
      data: [orderA, orderB],
    });
    expect(useCustomerOrderStore.getState().currentPage).toBe(2);
    expect(useCustomerOrderStore.getState().hasMore).toBe(true);
  });

  it('stops loading more when all pages are fetched', async () => {
    mockFetchOrders.mockResolvedValue(ok({ orders: [orderA], total: 1 }));

    await useCustomerOrderStore.getState().load();
    await useCustomerOrderStore.getState().loadMore();

    expect(mockFetchOrders).toHaveBeenCalledTimes(1);
  });
});

describe('OrderTrackingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOrderTrackingStore.getState().reset();
  });

  it('loads tracking into loaded state', async () => {
    mockFetchOrderTracking.mockResolvedValueOnce(ok(tracking));

    await useOrderTrackingStore.getState().load('ord-1');

    expect(mockFetchOrderTracking).toHaveBeenCalledWith('ord-1');
    expect(useOrderTrackingStore.getState().trackingState).toEqual({
      status: 'loaded',
      data: tracking,
    });
  });

  it('sets an error when the request fails', async () => {
    mockFetchOrderTracking.mockResolvedValueOnce(err(serverError));

    await useOrderTrackingStore.getState().load('ord-1');

    expect(useOrderTrackingStore.getState().trackingState).toEqual({
      status: 'error',
      message: 'Something went wrong.',
    });
  });

  it('keeps last good data when a poll refresh fails', async () => {
    useOrderTrackingStore.setState({ trackingState: { status: 'loaded', data: tracking } });
    mockFetchOrderTracking.mockResolvedValueOnce(err(serverError));

    await useOrderTrackingStore.getState().refresh('ord-1');

    expect(useOrderTrackingStore.getState().trackingState).toEqual({
      status: 'loaded',
      data: tracking,
    });
  });

  it('polls every 15 seconds and stops when told to', async () => {
    jest.useFakeTimers();
    mockFetchOrderTracking.mockResolvedValue(ok(tracking));

    useOrderTrackingStore.getState().startPolling('ord-1');
    expect(mockFetchOrderTracking).toHaveBeenCalledTimes(0);

    await jest.advanceTimersByTimeAsync(15_000);
    expect(mockFetchOrderTracking).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(15_000);
    expect(mockFetchOrderTracking).toHaveBeenCalledTimes(2);

    useOrderTrackingStore.getState().stopPolling();

    await jest.advanceTimersByTimeAsync(30_000);
    expect(mockFetchOrderTracking).toHaveBeenCalledTimes(2);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
