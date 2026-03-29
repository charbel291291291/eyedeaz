import { Router } from 'express';
import { sendApiError } from '../lib/responses';
import { trackEventSchema } from '../validation/track';

export const trackRouter = Router();

trackRouter.post('/', (req, res) => {
  const parsed = trackEventSchema.safeParse(req.body);

  if (!parsed.success) {
    sendApiError(res, 400, 'invalid_event', 'Tracking payload is invalid.');
    return;
  }

  const payload = parsed.data;

  console.info(
    JSON.stringify({
      type: 'analytics_event',
      sessionId: req.eyedeazSessionId ?? null,
      ip: req.ip ?? null,
      event: payload.event,
      path: payload.path,
      metadata: payload.metadata ?? {},
      timestamp: new Date().toISOString(),
    }),
  );

  res.status(204).end();
});
