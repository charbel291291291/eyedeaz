import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { ExperienceProvider } from '../../src/providers/experience-provider';

vi.mock('../../src/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('App', () => {
  it('renders the primary agency sections', () => {
    const { container } = render(
      <ExperienceProvider>
        <App />
      </ExperienceProvider>,
    );

    expect(screen.getByRole('link', { name: 'Skip to contact' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Services' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Work' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Contact' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Modern digital services built to sharpen your image/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /The kind of digital presentation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /We make businesses look sharper/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Let’s build a digital presence/i })).toBeInTheDocument();
    expect(container.querySelector('#services')).not.toBeNull();
    expect(container.querySelector('#work')).not.toBeNull();
    expect(container.querySelector('#about')).not.toBeNull();
    expect(container.querySelector('#contact')).not.toBeNull();
  });
});
