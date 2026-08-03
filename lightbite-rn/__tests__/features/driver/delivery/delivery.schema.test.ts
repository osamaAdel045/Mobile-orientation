import { deliverySchema } from '@/features/driver/delivery/schemas/delivery.schema';

describe('DriverDeliverySchema', () => {
  const validDelivery = {
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

  it('validates a valid delivery job', () => {
    const result = deliverySchema.safeParse(validDelivery);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid delivery job', () => {
    const result = deliverySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
