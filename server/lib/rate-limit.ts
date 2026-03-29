import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';
import { sendApiError } from './responses';

function keyGenerator(req: Request) {
  return `${req.eyedeazSessionId ?? 'anonymous'}:${ipKeyGenerator(req.ip ?? 'unknown')}`;
}

export function createApiRateLimit(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (_req, res) => {
      sendApiError(res, 429, 'rate_limited', 'Too many requests. Please wait and try again.');
    },
  });
}
