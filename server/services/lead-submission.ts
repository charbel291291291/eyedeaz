import { env } from '../config/env';
import { getSupabaseServerClient } from '../lib/supabase';

type LeadSubmissionInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  page?: string;
  sessionId?: string | null;
  userAgent?: string | null;
};

function createLeadRecord(input: LeadSubmissionInput) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message,
    page: input.page ?? null,
    session_id: input.sessionId ?? null,
    user_agent: input.userAgent ?? null,
  };
}

async function persistLead(input: LeadSubmissionInput) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from(env.SUPABASE_LEADS_TABLE).insert(createLeadRecord(input) as never);

  if (error) {
    throw error;
  }
}

async function notifyLeadWebhook(input: LeadSubmissionInput) {
  if (!env.LEAD_WEBHOOK_URL) return;

  await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
      page: input.page ?? null,
    }),
  });
}

export async function submitLead(input: LeadSubmissionInput) {
  await persistLead(input);

  notifyLeadWebhook(input).catch(() => {
    // Webhook delivery is intentionally non-blocking.
  });
}
