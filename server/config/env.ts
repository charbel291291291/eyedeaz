import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(32).default('eyedeaz-local-session-secret-change-me'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_TEXT: z.string().default('gemini-2.5-flash'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_LEADS_TABLE: z.string().default('leads'),
  LEAD_WEBHOOK_URL: z.string().url().optional(),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  isProduction: parsed.NODE_ENV === 'production',
  allowedOrigins: parsed.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
