import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ExperienceProvider } from './providers/experience-provider.tsx';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration failures.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </StrictMode>,
);
