import {
  earningsResponseSchema,
  earningsSchema,
} from '@/features/driver/earnings/schemas/earnings.schema';

describe('DriverEarningsSchema', () => {
  it('validates a valid earnings response', () => {
    const payload = {
      data: {
        today_earnings: 'AED 120.00',
        today_trips: 4,
        this_week_earnings: 'AED 480.00',
        this_week_trips: 16,
        avg_per_trip: 'AED 30.00',
      },
    };

    const result = earningsResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid earnings payload', () => {
    const result = earningsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
