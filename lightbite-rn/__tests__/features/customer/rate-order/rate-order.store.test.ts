import { err, ok } from 'neverthrow';

import type { AppError } from '@/core/api/types';
import { submitOrderRating } from '@/features/customer/rate-order/api/rate-order.api';
import { useCustomerRateOrderStore } from '@/features/customer/rate-order/store/rate-order.store';
import type { Rating } from '@/features/customer/rate-order/types';

jest.mock('@/features/customer/rate-order/api/rate-order.api', () => ({
  submitOrderRating: jest.fn(),
}));

const mockSubmitOrderRating = submitOrderRating as jest.MockedFunction<typeof submitOrderRating>;

const rating: Rating = {
  uuid: 'rating-1',
  order_uuid: 'order-1',
  rating: 5,
  review: 'Amazing food',
  created_at: '2026-08-02T10:00:00Z',
};

describe('CustomerRateOrderStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCustomerRateOrderStore.setState({ isSubmitting: false, result: null, error: null });
  });

  it('initializes with idle state', () => {
    const state = useCustomerRateOrderStore.getState();
    expect(state.isSubmitting).toBe(false);
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });

  it('submits a rating and stores the result', async () => {
    mockSubmitOrderRating.mockResolvedValueOnce(ok(rating));

    const error = await useCustomerRateOrderStore.getState().submit('order-1', {
      rating: 5,
      review: 'Amazing food',
    });

    expect(error).toBeNull();
    expect(mockSubmitOrderRating).toHaveBeenCalledWith('order-1', {
      rating: 5,
      review: 'Amazing food',
    });
    expect(useCustomerRateOrderStore.getState().result).toEqual(rating);
  });

  it('returns the error when submission fails', async () => {
    const appError: AppError = {
      code: 'SERVER_ERROR',
      message: 'Something went wrong.',
      statusCode: 500,
    };
    mockSubmitOrderRating.mockResolvedValueOnce(err(appError));

    const result = await useCustomerRateOrderStore.getState().submit('order-1', { rating: 3 });

    expect(result).toEqual(appError);
    expect(useCustomerRateOrderStore.getState().error).toBe(appError.message);
    expect(useCustomerRateOrderStore.getState().isSubmitting).toBe(false);
  });

  it('resets to idle state', () => {
    useCustomerRateOrderStore.setState({
      isSubmitting: true,
      result: rating,
      error: 'something',
    });

    useCustomerRateOrderStore.getState().reset();

    const state = useCustomerRateOrderStore.getState();
    expect(state.isSubmitting).toBe(false);
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });
});
