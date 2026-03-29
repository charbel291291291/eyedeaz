import { z } from 'zod';

export const aiBriefSchema = z.object({
  prompt: z.string().trim().min(12).max(400),
});
