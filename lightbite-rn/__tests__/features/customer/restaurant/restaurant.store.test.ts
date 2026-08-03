import { err, ok } from 'neverthrow';

import type { AppError } from '@/core/api/types';
import { fetchRestaurantDetail } from '@/features/customer/restaurant/api/restaurant.api';
import { useRestaurantStore } from '@/features/customer/restaurant/store/restaurant.store';
import type { RestaurantDetail } from '@/features/customer/restaurant/types';

jest.mock('@/features/customer/restaurant/api/restaurant.api', () => ({
  fetchRestaurantDetail: jest.fn(),
}));

const mockFetchRestaurantDetail = fetchRestaurantDetail as jest.MockedFunction<
  typeof fetchRestaurantDetail
>;

const detail: RestaurantDetail = {
  uuid: 'r1',
  name: 'Spice Route',
  description: 'Authentic Lebanese cuisine',
  logo_url: 'https://example.com/logo.png',
  cover_url: 'https://example.com/cover.png',
  cuisine_types: ['lebanese'],
  rating: 4.3,
  review_count: 47,
  address: 'Jumeirah Beach Road, Dubai',
  is_open: true,
  lat: 25.2,
  lng: 55.25,
  phone: '+97141234567',
  hours: {
    today: [{ open: '12:00', close: '23:00' }],
    is_open: true,
  },
  delivery_fee: 'AED 5.00',
  delivery_time_min: 25,
  categories: [
    {
      name: 'Appetizers',
      items: [
        {
          uuid: 'mi-1',
          name: 'Hummus',
          description: 'Creamy chickpea dip',
          price: 'AED 22.00',
          image_url: null,
          is_available: true,
        },
      ],
    },
  ],
};

describe('RestaurantStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRestaurantStore.setState({ screenState: { status: 'loading' }, selectedCategoryIndex: 0 });
  });

  it('initializes with loading state', () => {
    const state = useRestaurantStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
    expect(state.selectedCategoryIndex).toBe(0);
  });

  it('selectCategory updates the selected index', () => {
    useRestaurantStore.getState().selectCategory(2);
    expect(useRestaurantStore.getState().selectedCategoryIndex).toBe(2);
  });

  it('loads restaurant detail successfully', async () => {
    mockFetchRestaurantDetail.mockResolvedValueOnce(ok(detail));

    await useRestaurantStore.getState().load('r1');

    expect(mockFetchRestaurantDetail).toHaveBeenCalledWith('r1');
    expect(useRestaurantStore.getState().screenState).toEqual({ status: 'loaded', data: detail });
  });

  it('resets selected category when loading', async () => {
    mockFetchRestaurantDetail.mockResolvedValueOnce(ok(detail));

    useRestaurantStore.getState().selectCategory(1);
    await useRestaurantStore.getState().load('r1');

    expect(useRestaurantStore.getState().selectedCategoryIndex).toBe(0);
  });

  it('sets error state when the request fails', async () => {
    const error: AppError = { code: 'NOT_FOUND', message: 'Not found', statusCode: 404 };
    mockFetchRestaurantDetail.mockResolvedValueOnce(err(error));

    await useRestaurantStore.getState().load('missing');

    expect(useRestaurantStore.getState().screenState).toEqual({
      status: 'error',
      message: 'Not found',
    });
  });
});
