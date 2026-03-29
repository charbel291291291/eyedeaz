import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { useExperience } from '../../providers/experience-provider';

type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
  socialProof: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export function Hero({ eyebrow, title, description, stats, socialProof, primaryCta, secondaryCta }: HeroProps) {
  const { enhancedVisuals } = useExperience();

  return (
    <section id="top" className="hero-shell">
      <div className="hero-orb hero-orb-left" aria-hidden="true" />
      <div className="hero-orb hero-orb-right" aria-hidden="true" />
      {enhancedVisuals ? <div className="hero-grid" aria-hidden="true" /> : null}

      <div className="hero-layout">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="section-kicker">{eyebrow}</p>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-description">{description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={primaryCta.href}
              className="button-primary"
              onClick={() => trackEvent('cta_primary_clicked', { location: 'hero' })}
            >
              {primaryCta.label}
              <ArrowRight size={18} />
            </a>
            <a
              href={secondaryCta.href}
              className="button-secondary"
              onClick={() => trackEvent('cta_secondary_clicked', { location: 'hero' })}
            >
              {secondaryCta.label}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero-panel"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <div className="metric-value">{stat.value}</div>
                <div className="metric-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="eyebrow-small">What you get</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {socialProof.map((item) => (
                <li key={item} className="trust-chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
