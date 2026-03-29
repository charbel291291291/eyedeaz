import { useEffect } from 'react';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { Hero } from './components/sections/Hero';
import { Services } from './components/sections/Services';
import { Work } from './components/sections/Work';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { Navbar } from './components/ui/Navbar';
import siteContent from './content/site-content.json';
import { trackEvent } from './lib/analytics';

const CANONICAL_HOST = 'eyedeaz227.vercel.app';

export default function App() {
  const debugEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  const debugInfo =
    typeof window !== 'undefined'
      ? {
          href: window.location.href,
          referrer: document.referrer || '(empty)',
          isFramed: window.top !== window.self,
          userAgent: navigator.userAgent,
        }
      : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isCanonicalHost =
      window.location.hostname === CANONICAL_HOST ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isCanonicalHost && window.location.hostname.endsWith('.vercel.app')) {
      const canonicalUrl = new URL(window.location.href);
      canonicalUrl.hostname = CANONICAL_HOST;
      window.location.replace(canonicalUrl.toString());
      return;
    }

    if (window.top !== window.self) {
      try {
        window.top!.location.replace(window.location.href);
      } catch {
        document.body.innerHTML =
          '<main style="font-family:Segoe UI,system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;background:#020617;color:#fff;padding:24px;text-align:center"><div><h1 style="margin:0 0 12px">Open eyedeaz directly</h1><p style="margin:0;color:#cbd5e1">This page cannot run inside a frame. Open it in a normal browser tab.</p></div></main>';
      }
      return;
    }

    trackEvent('page_view');

    if (debugEnabled && debugInfo) {
      console.info('eyedeaz-debug', debugInfo);
    }
  }, [debugEnabled, debugInfo]);

  return (
    <div className="app-shell">
      <a href="#contact" className="skip-link">
        Skip to contact
      </a>

      <Navbar items={siteContent.navigation} />
      <InstallPrompt />

      <main>
        <Hero
          eyebrow={siteContent.hero.eyebrow}
          title={siteContent.hero.title}
          description={siteContent.hero.description}
          stats={siteContent.stats}
          socialProof={siteContent.socialProof}
          primaryCta={siteContent.hero.primaryCta}
          secondaryCta={siteContent.hero.secondaryCta}
        />
        <Services services={siteContent.services} />
        <Work caseStudies={siteContent.caseStudies} />
        <About
          headline={siteContent.about.headline}
          description={siteContent.about.description}
          pillars={siteContent.about.pillars}
          process={siteContent.about.process}
          testimonials={siteContent.about.testimonials}
        />
        <Contact
          headline={siteContent.contact.headline}
          description={siteContent.contact.description}
          brand={siteContent.brand}
        />
      </main>

      <div className="mobile-cta-bar md:hidden">
        <a
          href="https://wa.me/96170126177"
          target="_blank"
          rel="noreferrer"
          className="button-primary flex-1"
          onClick={() => trackEvent('mobile_cta_clicked', { type: 'whatsapp' })}
        >
          <svg aria-hidden="true" viewBox="0 0 32 32" className="h-4 w-4 fill-current">
            <path d="M19.11 17.27c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.14-.18.27-.69.87-.84 1.05-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.33-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.6-1.45-.82-1.98-.21-.51-.43-.44-.6-.45h-.51c-.18 0-.47.07-.71.34-.24.27-.92.9-.92 2.18 0 1.27.94 2.5 1.07 2.68.13.18 1.84 2.81 4.46 3.94.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.58-.65 1.8-1.28.22-.63.22-1.18.15-1.28-.06-.09-.24-.14-.51-.27Z" />
            <path d="M27.07 4.91A15.83 15.83 0 0 0 16.01.34C7.28.34.18 7.44.18 16.17c0 2.8.73 5.54 2.12 7.96L.04 31.66l7.73-2.22a15.77 15.77 0 0 0 8.23 2.26h.01c8.73 0 15.83-7.1 15.83-15.83 0-4.23-1.65-8.2-4.77-10.96Zm-11.06 24.1h-.01a13.2 13.2 0 0 1-6.73-1.84l-.48-.28-4.59 1.32 1.33-4.47-.31-.5a13.11 13.11 0 0 1-2.02-7.03c0-7.26 5.9-13.16 13.17-13.16 3.51 0 6.81 1.37 9.29 3.85a13.05 13.05 0 0 1 3.85 9.3c0 7.26-5.91 13.16-13.17 13.16Z" />
          </svg>
          WhatsApp
        </a>
        <a href={`mailto:${siteContent.brand.email}`} className="button-secondary flex-1" onClick={() => trackEvent('mobile_cta_clicked', { type: 'email' })}>
          Email
        </a>
      </div>

      <footer className="border-t border-white/10 px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white">{siteContent.brand.name}</p>
            <p className="mt-3 max-w-xl text-sm text-slate-300">{siteContent.brand.tagline}</p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-300">
            {siteContent.navigation.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </a>
            ))}
            <a href={`mailto:${siteContent.brand.email}`} className="hover:text-white">
              Email
            </a>
            <a href={`tel:${siteContent.brand.phone}`} className="hover:text-white">
              Call
            </a>
            <span>{siteContent.brand.location}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
