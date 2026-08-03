import { z } from 'zod';

export const searchSchema = z.object({
  // TODO: Add validation rules
});

export type CustomerSearchInput = z.infer<typeof searchSchema>;
