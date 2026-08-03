import { z } from 'zod';

export const deliverySchema = z.object({
  uuid: z.string(),
  restaurant: z.object({
    name: z.string(),
    address: z.string(),
  }),
  customer_area: z.string(),
  earnings: z.string(),
  distance_km: z.number(),
  restaurant_lat: z.number(),
  restaurant_lng: z.number(),
  customer_lat: z.number(),
  customer_lng: z.number(),
});
