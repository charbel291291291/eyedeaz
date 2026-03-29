import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type PerformanceLevel = 'low' | 'medium' | 'high';

type ExperienceState = {
  performance: PerformanceLevel;
  prefersReducedMotion: boolean;
  enhancedVisuals: boolean;
};

const ExperienceContext = createContext<ExperienceState>({
  performance: 'high',
  prefersReducedMotion: false,
  enhancedVisuals: true,
});

type PerformanceNavigator = Navigator & {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
  };
};

function detectExperience(): ExperienceState {
  const performanceNavigator = navigator as PerformanceNavigator;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = performanceNavigator.deviceMemory || 4;
  const effectiveType = performanceNavigator.connection?.effectiveType || '4g';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCompactViewport = window.matchMedia('(max-width: 767px)').matches;

  let performance: PerformanceLevel = 'high';

  if (
    prefersReducedMotion ||
    isCompactViewport ||
    cores <= 4 ||
    memory <= 4 ||
    effectiveType.includes('2g') ||
    effectiveType.includes('3g')
  ) {
    performance = 'low';
  } else if (cores <= 8 || memory <= 8) {
    performance = 'medium';
  }

  return {
    performance,
    prefersReducedMotion,
    enhancedVisuals: performance === 'high' && !prefersReducedMotion,
  };
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state] = useState<ExperienceState>(() => {
    if (typeof window === 'undefined') {
      return {
        performance: 'high',
        prefersReducedMotion: false,
        enhancedVisuals: true,
      };
    }

    return detectExperience();
  });

  const value = useMemo(() => state, [state]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  return useContext(ExperienceContext);
}
