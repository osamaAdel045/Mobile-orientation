import { z } from 'zod';

export const restaurantSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  logo_url: z.string().nullable(),
  cuisine_types: z.array(z.string()),
  rating: z.number().optional(),
  review_count: z.number().optional(),
  delivery_time_min: z.number(),
  delivery_fee: z.string(),
  distance_km: z.number(),
  is_open: z.boolean(),
  is_accepting_orders: z.boolean().optional(),
});

export const restaurantListResponseSchema = z.object({
  data: z.array(restaurantSchema),
  links: z.object({ next: z.string().nullable().optional() }).optional(),
  meta: z
    .object({
      current_page: z.number(),
      per_page: z.number(),
      total: z.number(),
      trace_id: z.string().optional(),
    })
    .optional(),
});

export type RestaurantListResponse = z.infer<typeof restaurantListResponseSchema>;
