type AnalyticsValue = string | number | boolean;

export function trackEvent(event: string, metadata?: Record<string, AnalyticsValue>) {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    event,
    path: window.location.pathname,
    metadata,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    return;
  }

  fetch('/api/track', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    body: payload,
  }).catch(() => {
    // Tracking should never block UX.
  });
}
