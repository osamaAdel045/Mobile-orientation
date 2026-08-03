import { restaurantListResponseSchema } from '@/features/customer/home/schemas/home.schema';

describe('CustomerHomeSchema', () => {
  it('validates a valid restaurant list response', () => {
    const payload = {
      data: [
        {
          uuid: 'r1',
          name: 'Spice Route',
          logo_url: 'https://cdn.lightbite.com/restaurants/r1/logo.webp',
          cuisine_types: ['lebanese', 'middle_eastern'],
          rating: 4.3,
          review_count: 47,
          delivery_time_min: 25,
          delivery_fee: 'AED 5.00',
          distance_km: 1.2,
          is_open: true,
          is_accepting_orders: true,
        },
      ],
      meta: { current_page: 1, per_page: 20, total: 87, trace_id: 'trace-001' },
    };

    const result = restaurantListResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid response', () => {
    const result = restaurantListResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
