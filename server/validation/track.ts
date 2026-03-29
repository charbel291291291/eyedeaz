import { z } from 'zod';

export const trackEventSchema = z.object({
  event: z.string().trim().min(2).max(50),
  path: z.string().trim().max(200),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
