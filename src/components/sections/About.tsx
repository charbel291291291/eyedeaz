import { motion } from 'motion/react';

type Pillar = {
  title: string;
  description: string;
};

type Testimonial = {
  quote: string;
  author: string;
};

type AboutProps = {
  headline: string;
  description: string;
  pillars: Pillar[];
  process: string[];
  testimonials: Testimonial[];
};

export function About({ headline, description, pillars, process, testimonials }: AboutProps) {
  return (
    <section id="about" className="section-shell">
      <div className="section-copy">
        <p className="section-kicker">About eyedeaz</p>
        <h2 className="section-title max-w-4xl">{headline}</h2>
        <p className="section-description max-w-3xl">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              className="content-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <p className="eyebrow-small">0{index + 1}</p>
              <h3 className="card-title">{pillar.title}</h3>
              <p className="card-description">{pillar.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.aside
          className="content-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="eyebrow-small">Process</p>
          <ol className="space-y-4 text-sm text-slate-200/88">
            {process.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="metric-chip mt-0.5">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </motion.aside>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.author} className="content-card">
            <p className="text-lg leading-relaxed text-white">&ldquo;{testimonial.quote}&rdquo;</p>
            <footer className="mt-5 text-sm text-slate-300">{testimonial.author}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
