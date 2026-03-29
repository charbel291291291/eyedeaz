import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

const SESSION_COOKIE = 'eyedeaz_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

declare module 'express-serve-static-core' {
  interface Request {
    eyedeazSessionId?: string;
  }
}

function signValue(value: string) {
  return crypto.createHmac('sha256', env.SESSION_SECRET).update(value).digest('hex');
}

function parseCookies(cookieHeader?: string) {
  return (cookieHeader ?? '').split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function createSessionValue(id: string) {
  return `${id}.${signValue(id)}`;
}

function getValidSessionId(cookieHeader?: string) {
  const cookies = parseCookies(cookieHeader);
  const raw = cookies[SESSION_COOKIE];

  if (!raw) return null;

  const [id, signature] = raw.split('.');
  if (!id || !signature) return null;
  if (signValue(id) !== signature) return null;

  return id;
}

export function ensureSession(req: Request, res: Response, next: NextFunction) {
  const existingSessionId = getValidSessionId(req.headers.cookie);

  if (existingSessionId) {
    req.eyedeazSessionId = existingSessionId;
    next();
    return;
  }

  const sessionId = crypto.randomUUID();
  req.eyedeazSessionId = sessionId;

  res.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${createSessionValue(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${
      env.isProduction ? '; Secure' : ''
    }`,
  );

  next();
}
