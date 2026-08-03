import { z } from 'zod';

export const restaurantSchema = z.object({
  // TODO: Add validation rules
});

export type CustomerRestaurantInput = z.infer<typeof restaurantSchema>;
