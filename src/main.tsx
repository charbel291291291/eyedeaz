import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ExperienceProvider } from './providers/experience-provider.tsx';

const MAIN_URL = 'https://eyedeaz227.vercel.app/';

function redirectToMainUrl() {
  if (typeof window === 'undefined') return;
  if (window.location.href === MAIN_URL) return;

  try {
    window.location.href = MAIN_URL;
  } catch {
    window.location.replace(MAIN_URL);
  }
}

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </StrictMode>,
);
