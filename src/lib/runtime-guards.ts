import { CANONICAL_HOST, MAIN_URL, isLocalHostname, shouldRedirectToCanonicalHost } from './site-config';

function redirectToMainUrl() {
  if (typeof window === 'undefined') return;
  if (window.location.href === MAIN_URL) return;

  try {
    window.location.href = MAIN_URL;
  } catch {
    window.location.replace(MAIN_URL);
  }
}

function handleTopLevelGuards() {
  if (typeof window === 'undefined') return false;

  if (window.top !== window.self) {
    try {
      window.top!.location.href = MAIN_URL;
    } catch {
      window.location.replace(MAIN_URL);
    }
    return true;
  }

  if (shouldRedirectToCanonicalHost(window.location.hostname)) {
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.hostname = CANONICAL_HOST;
    window.location.replace(canonicalUrl.toString());
    return true;
  }

  if (window.location.protocol === 'http:' && !isLocalHostname(window.location.hostname)) {
    const httpsUrl = new URL(window.location.href);
    httpsUrl.protocol = 'https:';
    window.location.replace(httpsUrl.toString());
    return true;
  }

  return false;
}

function registerGlobalNavigationRecovery() {
  window.addEventListener('error', (event) => {
    const message = String(event.message || '');

    if (
      message.includes('chrome-error://chromewebdata') ||
      message.includes('Unsafe attempt to load URL') ||
      message.includes('Failed to fetch dynamically imported module')
    ) {
      redirectToMainUrl();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || '');

    if (
      reason.includes('chrome-error://chromewebdata') ||
      reason.includes('Unsafe attempt to load URL') ||
      reason.includes('Failed to fetch dynamically imported module')
    ) {
      redirectToMainUrl();
    }
  });
}

export function initializeRuntimeGuards() {
  if (typeof window === 'undefined') return;

  const navigationHandled = handleTopLevelGuards();
  if (navigationHandled) return;

  registerGlobalNavigationRecovery();
}
