import { z } from 'zod';

export const rateOrderSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(500).optional(),
});

export type RateOrderInput = z.infer<typeof rateOrderSchema>;
