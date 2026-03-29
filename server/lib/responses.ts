import type { Response } from 'express';

export function sendApiError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({
    error: {
      code,
      message,
    },
  });
}

export function sendApiSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json(data);
}
