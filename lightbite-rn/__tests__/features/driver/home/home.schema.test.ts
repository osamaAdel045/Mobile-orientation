import {
  availableJobResponseSchema,
  onlineStatusResponseSchema,
} from '@/features/driver/home/schemas/home.schema';

describe('DriverHomeSchema', () => {
  it('validates an available job response', () => {
    const payload = {
      data: {
        uuid: 'job-1',
        restaurant: { name: 'Spice Route', address: 'Al Wasl Road' },
        customer_area: 'Dubai Marina',
        earnings: 'AED 15.00',
        distance_km: 2.3,
        restaurant_lat: 25.2,
        restaurant_lng: 55.25,
        customer_lat: 25.08,
        customer_lng: 55.14,
      },
    };

    const result = availableJobResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('accepts an empty job response', () => {
    const result = availableJobResponseSchema.safeParse({ data: null });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid job response', () => {
    const result = availableJobResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('validates an online status response', () => {
    const result = onlineStatusResponseSchema.safeParse({ data: { is_online: true } });
    expect(result.success).toBe(true);
  });
});
