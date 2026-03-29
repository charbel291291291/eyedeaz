import { motion } from 'motion/react';

type Service = {
  title: string;
  summary: string;
  outcomes: string[];
};

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="section-shell">
      <div className="section-copy">
        <p className="section-kicker">Services</p>
        <h2 className="section-title">Modern digital services built to sharpen your image and support real growth.</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service, index) => (
          <motion.article
            key={service.title}
            className="content-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
          >
            <p className="eyebrow-small">Service 0{index + 1}</p>
            <h3 className="card-title">{service.title}</h3>
            <p className="card-description">{service.summary}</p>

            <ul className="mt-5 flex flex-wrap gap-3">
              {service.outcomes.map((outcome) => (
                <li key={outcome} className="trust-chip">
                  {outcome}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
