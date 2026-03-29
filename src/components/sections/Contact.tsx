import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, MessageCircle, PhoneCall } from 'lucide-react';
import { submitLead } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

type ContactProps = {
  headline: string;
  description: string;
  brand: {
    email: string;
    phone: string;
    location: string;
  };
};

const initialState = {
  name: '',
  email: '',
  phone: '',
  message: '',
  company: '',
};

export function Contact({ headline, description, brand }: ContactProps) {
  const [formState, setFormState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const whatsappUrl = 'https://wa.me/96170126177';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await submitLead({
        ...formState,
        page: window.location.pathname,
      });

      trackEvent('lead_form_submitted');
      setSuccessMessage(response.message);
      setFormState(initialState);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Lead submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="section-shell">
      <div className="section-copy">
        <p className="section-kicker">Contact</p>
        <h2 className="section-title max-w-4xl">{headline}</h2>
        <p className="section-description max-w-3xl">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.form
          className="content-card space-y-5"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="form-field">
              <span className="form-label">Name</span>
              <input
                required
                className="form-input"
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                autoComplete="name"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                required
                type="email"
                className="form-input"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="form-field">
              <span className="form-label">Phone</span>
              <input
                type="tel"
                className="form-input"
                value={formState.phone}
                onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
                autoComplete="tel"
              />
            </label>

            <label className="form-field sr-only">
              <span className="form-label">Company</span>
              <input
                tabIndex={-1}
                autoComplete="off"
                className="form-input"
                value={formState.company}
                onChange={(event) => setFormState((current) => ({ ...current, company: event.target.value }))}
              />
            </label>
          </div>

          <label className="form-field">
            <span className="form-label">Project brief</span>
            <textarea
              required
              minLength={20}
              className="form-input min-h-36"
              value={formState.message}
              onChange={(event) => setFormState((current) => ({ ...current, message: event.target.value }))}
              placeholder="What are you building, redesigning, or trying to improve?"
            />
          </label>

          <button
            className="button-primary"
            type="submit"
            disabled={isSubmitting}
            onClick={() => trackEvent('lead_form_submit_clicked')}
          >
            {isSubmitting ? 'Sending your brief...' : 'Send project brief'}
          </button>

          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        </motion.form>

        <div className="grid gap-6">
          <div className="content-card">
            <p className="eyebrow-small">What happens next</p>
            <ul className="mt-4 space-y-4 text-sm text-slate-200/88">
              <li>We review your brief against scope, timeline, and conversion goals.</li>
              <li>We reply with the best next step, not a generic sales script.</li>
              <li>We only propose what the project actually needs.</li>
            </ul>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="grid gap-3">
                <a className="contact-link" href={`tel:${brand.phone}`} onClick={() => trackEvent('contact_quick_action_clicked', { type: 'phone' })}>
                  <PhoneCall size={18} />
                  <span>Call {brand.phone}</span>
                </a>
                <a className="contact-link" href={`mailto:${brand.email}`} onClick={() => trackEvent('contact_quick_action_clicked', { type: 'email' })}>
                  <Mail size={18} />
                  <span>{brand.email}</span>
                </a>
                <div className="contact-link">
                  <MapPin size={18} />
                  <span>{brand.location}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a className="button-secondary" href={`tel:${brand.phone}`} onClick={() => trackEvent('contact_cta_clicked', { type: 'call' })}>
                  Call now
                </a>
                <a
                  className="button-secondary"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('contact_cta_clicked', { type: 'whatsapp' })}
                >
                  <MessageCircle size={18} />
                  WhatsApp us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
