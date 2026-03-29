import { describe, expect, it } from 'vitest';
import { leadSchema } from '../../server/validation/lead';

describe('leadSchema', () => {
  it('normalizes an empty phone number to undefined', () => {
    const result = leadSchema.parse({
      name: 'Maya Stone',
      email: 'maya@example.com',
      phone: '   ',
      message: 'We need a performance-first redesign for our product launch.',
      company: '',
      page: '/contact',
    });

    expect(result.phone).toBeUndefined();
  });

  it('rejects a brief that is too short', () => {
    const result = leadSchema.safeParse({
      name: 'Maya Stone',
      email: 'maya@example.com',
      phone: '+961 70 000 000',
      message: 'Too short',
      company: '',
      page: '/contact',
    });

    expect(result.success).toBe(false);
  });
});
