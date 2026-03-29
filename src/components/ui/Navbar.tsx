import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';

type NavItem = {
  label: string;
  href: string;
};

export function Navbar({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  useEffect(() => {
    const sections = ['top', ...items.map((item) => item.href.replace('#', ''))];

    function handleScroll() {
      const currentScrollY = window.scrollY;
      setIsVisible(!(currentScrollY > lastScrollY.current && currentScrollY > 120));
      lastScrollY.current = currentScrollY;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          setActiveSection(section);
          break;
        }
      }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  function handleLinkClick(href: string) {
    setIsOpen(false);
    trackEvent('nav_item_clicked', { href });
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 z-50 w-full px-4 py-4 md:px-8 md:py-6"
      >
        <div className="relative mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_12px_40px_rgba(15,23,42,0.34)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-3 md:px-6">
              <button type="button" className="flex items-center gap-3 text-left" onClick={() => handleLinkClick('#top')} aria-label="Go to top">
                <img src="/eyedeaz-logo.png" alt="eyedeaz logo" className="h-11 w-11 rounded-2xl object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white">eyedeaz</div>
                  <div className="text-xs text-slate-400">Build. Brand. Grow.</div>
                </div>
              </button>

              <div className="hidden items-center gap-1 md:flex">
                {items.map((item) => (
                  <NavbarLink
                    key={item.href}
                    item={item}
                    isActive={activeSection === item.href.replace('#', '')}
                    onClick={() => handleLinkClick(item.href)}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a href="#contact" className="hidden button-primary md:inline-flex" onClick={() => trackEvent('nav_primary_cta_clicked')}>
                  Start your project
                  <ArrowRight size={16} />
                </a>

                <button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 text-white md:hidden" aria-label="Open navigation menu">
                  <Menu size={20} />
                </button>
              </div>
            </div>

            <motion.div className="absolute bottom-0 left-0 h-px origin-left bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400" style={{ scaleX }} />
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen ? <MobileMenu onClose={() => setIsOpen(false)} onLinkClick={handleLinkClick} activeSection={activeSection} items={items} /> : null}
      </AnimatePresence>
    </>
  );
}

function NavbarLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  return (
    <motion.a
      href={item.href}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      className="relative rounded-full px-4 py-2"
    >
      <span className={`relative z-10 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
        {item.label}
      </span>

      {isActive ? <motion.div layoutId="nav-active" className="absolute inset-0 rounded-full border border-white/10 bg-white/5" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} /> : null}
    </motion.a>
  );
}

function MobileMenu({
  onClose,
  onLinkClick,
  activeSection,
  items,
}: {
  onClose: () => void;
  onLinkClick: (href: string) => void;
  activeSection: string;
  items: NavItem[];
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-2xl md:hidden">
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-3">
            <img src="/eyedeaz-logo.png" alt="eyedeaz logo" className="h-11 w-11 rounded-2xl object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
            <span className="text-lg font-semibold uppercase tracking-[0.22em] text-white">eyedeaz</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-full border border-white/10 bg-white/5 p-3 text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8">
          <nav className="flex flex-col gap-6" aria-label="Mobile navigation">
            {items.map((item, index) => (
              <motion.div key={item.href} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08, type: 'spring', damping: 20 }}>
                <button type="button" onClick={() => onLinkClick(item.href)} className="group flex items-center gap-4 text-left">
                  <span className={`text-4xl font-semibold tracking-tight transition-all duration-300 ${activeSection === item.href.substring(1) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>
    </motion.div>
  );
}
