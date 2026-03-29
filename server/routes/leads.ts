import { Router } from 'express';
import { sendApiError, sendApiSuccess } from '../lib/responses';
import { submitLead } from '../services/lead-submission';
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
    await submitLead({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
      page: payload.page,
      sessionId: req.eyedeazSessionId ?? null,
      userAgent: req.get('user-agent') ?? null,
    });

    sendApiSuccess(res, {
      ok: true,
      message: 'Thanks. We have your brief and will reply soon.',
    });
  } catch (error) {
    console.error('Lead submission failed:', error);
    sendApiError(res, 503, 'lead_unavailable', 'Lead submission is temporarily unavailable.');
  }
});
