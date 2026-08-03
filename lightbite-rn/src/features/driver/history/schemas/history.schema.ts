import { z } from 'zod';

const DRIVER_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'delivering',
  'delivered',
  'rejected',
  'cancelled',
] as const;

export const historyOrderSchema = z.object({
  uuid: z.string(),
  order_number: z.string(),
  restaurant: z.object({ name: z.string() }),
  earnings: z.string(),
  distance_km: z.number(),
  status: z.enum(DRIVER_ORDER_STATUSES),
  completed_at: z.string(),
});

export const historyListResponseSchema = z.object({
  data: z.array(historyOrderSchema),
});
