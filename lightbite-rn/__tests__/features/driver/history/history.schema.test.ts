import {
  historyListResponseSchema,
  historyOrderSchema,
} from '@/features/driver/history/schemas/history.schema';

describe('DriverHistorySchema', () => {
  it('validates a valid history response', () => {
    const payload = {
      data: [
        {
          uuid: 'ord-1',
          order_number: 'LB-1234',
          restaurant: { name: 'Spice Route' },
          earnings: 'AED 15.00',
          distance_km: 2.3,
          status: 'delivered',
          completed_at: '2026-07-01T10:00:00Z',
        },
      ],
    };

    const result = historyListResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid order payload', () => {
    const result = historyOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
