export const CANONICAL_HOST = 'eyedeaz227.vercel.app';
export const MAIN_URL = `https://${CANONICAL_HOST}/`;
export const WHATSAPP_URL = 'https://wa.me/96170126177';

export function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function shouldRedirectToCanonicalHost(hostname: string) {
  return hostname.endsWith('.vercel.app') && hostname !== CANONICAL_HOST;
}
