import { restaurantSchema } from '@/features/customer/restaurant/schemas/restaurant.schema';

describe('CustomerRestaurantSchema', () => {
  it('validates valid input', () => {
    const result = restaurantSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
