import { z } from 'zod';

export const earningsSchema = z.object({
  today_earnings: z.string(),
  today_trips: z.number(),
  this_week_earnings: z.string(),
  this_week_trips: z.number(),
  avg_per_trip: z.string(),
});

export const earningsResponseSchema = z.object({
  data: earningsSchema,
});
