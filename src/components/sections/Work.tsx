import { motion } from 'motion/react';
import { trackEvent } from '../../lib/analytics';

type CaseStudy = {
  title: string;
  category: string;
  summary: string;
  impact: string[];
  ctaLabel: string;
  ctaHref: string;
};

export function Work({ caseStudies }: { caseStudies: CaseStudy[] }) {
  return (
    <section id="work" className="section-shell">
      <div className="section-copy">
        <p className="section-kicker">Selected work</p>
        <h2 className="section-title">The kind of digital presentation that makes the next customer conversation easier.</h2>
      </div>

      <div className="grid gap-6">
        {caseStudies.map((study, index) => (
          <motion.article
            key={study.title}
            className="content-card case-study-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
          >
            <div>
              <p className="eyebrow-small">{study.category}</p>
              <h3 className="card-title mt-3">{study.title}</h3>
              <p className="card-description mt-4">{study.summary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {study.impact.map((item) => (
                <div key={item} className="metric-card">
                  <div className="metric-label">{item}</div>
                </div>
              ))}
            </div>

            <a
              href={study.ctaHref}
              className="button-secondary justify-center sm:w-fit"
              onClick={() => trackEvent('case_study_cta_clicked', { study: study.title })}
            >
              {study.ctaLabel}
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
