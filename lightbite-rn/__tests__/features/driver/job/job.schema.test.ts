import { jobSchema } from '@/features/driver/job/schemas/job.schema';

describe('DriverJobSchema', () => {
  const validJob = {
    uuid: 'job-1',
    restaurant: { name: 'Spice Route', address: 'Al Wasl Road' },
    customer_area: 'Dubai Marina',
    earnings: 'AED 15.00',
    distance_km: 2.3,
    restaurant_lat: 25.2,
    restaurant_lng: 55.25,
    customer_lat: 25.08,
    customer_lng: 55.14,
  };

  it('validates a valid job', () => {
    const result = jobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid job', () => {
    const result = jobSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
