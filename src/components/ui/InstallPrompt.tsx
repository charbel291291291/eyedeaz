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
  const [isIos] = useState(() => {
    if (typeof window === 'undefined') return false;

    const iosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const safari = /safari/i.test(window.navigator.userAgent) && !/crios|fxios|edgios/i.test(window.navigator.userAgent);

    return iosDevice && safari;
  });

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const dismissed = window.localStorage.getItem('eyedeaz-install-dismissed') === 'true';
    const iosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const safari = /safari/i.test(window.navigator.userAgent) && !/crios|fxios|edgios/i.test(window.navigator.userAgent);

    if (isStandalone || dismissed) {
      return;
    }

    let timer = window.setTimeout(() => {
      if (iosDevice && safari) {
        setIsVisible(true);
        trackEvent('install_prompt_shown', { platform: 'ios' });
      }
    }, 9000);

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setIsVisible(true);
        trackEvent('install_prompt_shown', { platform: 'supported' });
      }, 6000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.clearTimeout(timer);
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
    trackEvent('install_prompt_dismissed', { platform: isIos ? 'ios' : 'supported' });
    setIsVisible(false);
  }

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          className="fixed bottom-6 left-6 right-6 z-[9999] rounded-3xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl md:left-auto md:right-6 md:w-96"
        >
          <div className="flex items-start gap-4">
            <div className="icon-badge">
              <Download className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h4 className="mb-1 text-sm font-semibold text-white">Install eyedeaz</h4>
              <p className="mb-3 text-xs leading-relaxed text-slate-300">
                {isIos
                  ? 'On iPhone or iPad, tap Share then “Add to Home Screen” for the full app-like experience.'
                  : 'Add eyedeaz to your home screen for faster repeat visits and offline-ready access.'}
              </p>

              <div className="flex gap-2">
                {isIos ? (
                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-200">
                    Share → Add to Home Screen
                  </div>
                ) : (
                  <button type="button" onClick={handleInstall} className="button-primary w-full justify-center text-xs">
                    Install now
                  </button>
                )}

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
