import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeRuntimeGuards } from './lib/runtime-guards.ts';
import { ExperienceProvider } from './providers/experience-provider.tsx';

initializeRuntimeGuards();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </StrictMode>,
);
