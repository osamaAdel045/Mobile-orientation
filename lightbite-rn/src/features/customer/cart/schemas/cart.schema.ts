import { z } from 'zod';

export const cartSchema = z.object({
  uuid: z.string(),
  restaurant: z.object({ uuid: z.string(), name: z.string() }),
  items: z.array(
    z.object({
      id: z.number(),
      menu_item: z.object({ uuid: z.string(), name: z.string() }),
      quantity: z.number(),
      unit_price: z.string(),
      subtotal: z.string(),
      special_instructions: z.string().nullable(),
    }),
  ),
  subtotal: z.string(),
  delivery_fee: z.string(),
  tax: z.string(),
  total: z.string(),
});
