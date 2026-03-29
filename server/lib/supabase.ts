import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server credentials are not configured.');
  }

  cachedClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
