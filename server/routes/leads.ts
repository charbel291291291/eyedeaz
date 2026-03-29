import { Router } from 'express';
import { env } from '../config/env';
import { sendApiError, sendApiSuccess } from '../lib/responses';
import { getSupabaseServerClient } from '../lib/supabase';
import { leadSchema } from '../validation/lead';

export const leadsRouter = Router();

leadsRouter.post('/', async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);

  if (!parsed.success) {
    sendApiError(res, 400, 'invalid_lead', 'Please review the form fields and try again.');
    return;
  }

  const payload = parsed.data;

  if (payload.company) {
    sendApiSuccess(res, { ok: true }, 202);
    return;
  }

  try {
    const supabase = getSupabaseServerClient();
    const leadRecord = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      message: payload.message,
      page: payload.page ?? null,
      session_id: req.eyedeazSessionId ?? null,
      user_agent: req.get('user-agent') ?? null,
    };

    const { error } = await supabase.from(env.SUPABASE_LEADS_TABLE).insert(leadRecord as never);

    if (error) {
      throw error;
    }

    if (env.LEAD_WEBHOOK_URL) {
      fetch(env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone ?? null,
          message: payload.message,
          page: payload.page ?? null,
        }),
      }).catch(() => {
        // Non-blocking webhook.
      });
    }

    sendApiSuccess(res, {
      ok: true,
      message: 'Thanks. We have your brief and will reply soon.',
    });
  } catch (error) {
    console.error('Lead submission failed:', error);
    sendApiError(res, 503, 'lead_unavailable', 'Lead submission is temporarily unavailable.');
  }
});
