import { rateOrderSchema } from '@/features/customer/rate-order/schemas/rate-order.schema';

describe('RateOrderSchema', () => {
  it('accepts a valid rating with an optional review', () => {
    const result = rateOrderSchema.safeParse({ rating: 5, review: 'Great food' });
    expect(result.success).toBe(true);
  });

  it('accepts a rating without a review', () => {
    const result = rateOrderSchema.safeParse({ rating: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects a rating below the valid range', () => {
    expect(rateOrderSchema.safeParse({ rating: 0 }).success).toBe(false);
  });

  it('rejects a rating above the valid range', () => {
    expect(rateOrderSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('rejects a missing rating', () => {
    expect(rateOrderSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a non-integer rating', () => {
    expect(rateOrderSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });
});
