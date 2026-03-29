import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertMock = vi.fn();

vi.mock('../../server/lib/supabase', () => ({
  getSupabaseServerClient: () => ({
    from: vi.fn(() => ({
      insert: insertMock,
    })),
  }),
}));

describe('API hardening', () => {
  beforeEach(() => {
    insertMock.mockReset();
  });

  it('returns health, security headers, and sets a signed session cookie', async () => {
    const { createApp } = await import('../../server/index');
    const app = await createApp({ serveClient: false });

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['set-cookie']?.[0]).toContain('eyedeaz_session=');
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
  });

  it('rejects invalid lead payloads', async () => {
    const { createApp } = await import('../../server/index');
    const app = await createApp({ serveClient: false });

    const response = await request(app).post('/api/leads').send({
      name: 'A',
      email: 'invalid-email',
      message: 'short',
      company: '',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'invalid_lead',
        message: 'Please review the form fields and try again.',
      },
    });
  });

  it('stores valid leads', async () => {
    insertMock.mockResolvedValue({ error: null });

    const { createApp } = await import('../../server/index');
    const app = await createApp({ serveClient: false });

    const response = await request(app).post('/api/leads').send({
      name: 'Maya Stone',
      email: 'maya@example.com',
      phone: '+961 70 000 000',
      message: 'We need a premium agency PWA that is faster and easier to convert from.',
      company: '',
      page: '/contact',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      message: 'Thanks. We have your brief and will reply soon.',
    });
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0]?.[0]).toMatchObject({
      name: 'Maya Stone',
      email: 'maya@example.com',
      phone: '+961 70 000 000',
      page: '/contact',
    });
  });

  it('rate limits repeated lead submissions', async () => {
    insertMock.mockResolvedValue({ error: null });

    const { createApp } = await import('../../server/index');
    const app = await createApp({
      serveClient: false,
      rateLimits: {
        leads: { windowMs: 60_000, max: 2 },
      },
    });

    const agent = request.agent(app);
    const payload = {
      name: 'Maya Stone',
      email: 'maya@example.com',
      message: 'We need a premium agency PWA that is faster and easier to convert from.',
      company: '',
    };

    expect((await agent.post('/api/leads').send(payload)).status).toBe(200);
    expect((await agent.post('/api/leads').send(payload)).status).toBe(200);

    const limited = await agent.post('/api/leads').send(payload);

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({
      error: {
        code: 'rate_limited',
        message: 'Too many requests. Please wait and try again.',
      },
    });
  });

  it('sanitizes storage failures', async () => {
    insertMock.mockResolvedValue({ error: new Error('database is down') });

    const { createApp } = await import('../../server/index');
    const app = await createApp({ serveClient: false });

    const response = await request(app).post('/api/leads').send({
      name: 'Maya Stone',
      email: 'maya@example.com',
      message: 'We need a premium agency PWA that is faster and easier to convert from.',
      company: '',
    });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: 'lead_unavailable',
        message: 'Lead submission is temporarily unavailable.',
      },
    });
  });
});
