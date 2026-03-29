import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, X } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  preventDefault: () => void;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const dismissed = window.localStorage.getItem('eyedeaz-install-dismissed') === 'true';

    if (isStandalone || dismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setIsVisible(true);
      trackEvent('install_prompt_shown', { platform: 'supported' });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    trackEvent('install_prompt_choice', { outcome });
    setDeferredPrompt(null);
    setIsVisible(false);
  }

  function handleDismiss() {
    window.localStorage.setItem('eyedeaz-install-dismissed', 'true');
    trackEvent('install_prompt_dismissed', { platform: 'supported' });
    setIsVisible(false);
  }

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-24 left-4 right-4 z-[90] rounded-3xl border border-white/10 bg-slate-950/92 p-4 shadow-2xl backdrop-blur-xl md:bottom-6 md:left-auto md:right-6 md:w-96"
        >
          <div className="flex items-start gap-4">
            <div className="icon-badge">
              <Download className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h4 className="mb-1 text-sm font-semibold text-white">Install eyedeaz</h4>
              <p className="mb-3 text-xs leading-relaxed text-slate-300">
                Add eyedeaz to your home screen for faster repeat visits and a cleaner app-like experience.
              </p>

              <div className="flex gap-2">
                <button type="button" onClick={handleInstall} className="button-primary w-full justify-center text-xs">
                  Install now
                </button>

                <button type="button" onClick={handleDismiss} className="rounded-2xl border border-white/10 bg-white/5 px-3 text-slate-300 transition-colors hover:bg-white/10" aria-label="Dismiss install prompt">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
