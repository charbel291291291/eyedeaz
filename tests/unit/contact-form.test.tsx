import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Contact } from '../../src/components/sections/Contact';

const submitLeadMock = vi.fn();
const trackEventMock = vi.fn();

vi.mock('../../src/lib/api', () => ({
  submitLead: (...args: unknown[]) => submitLeadMock(...args),
}));

vi.mock('../../src/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

vi.mock('../../src/components/sections/AiDemo', () => ({
  AiDemo: () => <div data-testid="ai-demo">AI demo</div>,
}));

describe('Contact form', () => {
  beforeEach(() => {
    submitLeadMock.mockReset();
    trackEventMock.mockReset();
  });

  it('submits the lead form and shows the success state', async () => {
    submitLeadMock.mockResolvedValue({
      ok: true,
      message: 'Thanks. We have your brief and will reply soon.',
    });

    const user = userEvent.setup();

    render(
      <Contact
        headline="Start the right project"
        description="Tell us what you need."
        brand={{ email: 'hello@eyedeaz.com', phone: '+96170000000', location: 'Beirut, Lebanon' }}
      />,
    );

    await user.type(screen.getByLabelText('Name'), 'Maya Stone');
    await user.type(screen.getByLabelText('Email'), 'maya@example.com');
    await user.type(screen.getByLabelText('Phone'), '+961 70 000 000');
    await user.type(
      screen.getByLabelText('Project brief'),
      'We need a premium agency PWA that is faster and easier to convert from.',
    );
    await user.click(screen.getByRole('button', { name: 'Send project brief' }));

    await waitFor(() => {
      expect(submitLeadMock).toHaveBeenCalledWith({
        name: 'Maya Stone',
        email: 'maya@example.com',
        phone: '+961 70 000 000',
        message: 'We need a premium agency PWA that is faster and easier to convert from.',
        company: '',
        page: '/',
      });
    });

    expect(await screen.findByText('Thanks. We have your brief and will reply soon.')).toBeInTheDocument();
    expect(trackEventMock).toHaveBeenCalledWith('lead_form_submitted');
  });
});
