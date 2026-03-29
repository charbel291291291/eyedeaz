import { z } from 'zod';

const emptyStringToUndefined = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value));

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: emptyStringToUndefined
    .pipe(z.string().trim().max(32).regex(/^[0-9+\-() ]+$/).optional()),
  message: z.string().trim().min(20).max(2000),
  company: z.string().trim().max(0).optional().default(''),
  page: z.string().trim().max(200).optional(),
});
