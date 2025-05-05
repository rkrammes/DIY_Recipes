import { useState, useEffect } from 'react';
import type { Theme } from '../../types/theme';
import { reverseLegacyMapping } from '../../types/theme';

// Simple animation parameters by theme
export interface SimpleAnimationParams {
  duration: {
    default: number;
  };
  easing: string;
  scale: {
    hover: number;
  };
}

// Get simplified theme-specific animation parameters
export function getSimpleAnimationParams(theme: Theme): SimpleAnimationParams {
  // Map modern theme names to animation parameters
  switch (theme) {
    case 'synthwave-noir':
      return {
        duration: {
          default: 0.3,
        },
        easing: 'ease-out',
        scale: {
          hover: 1.05,
        },
      };
    case 'terminal-mono':
      return {
        duration: {
          default: 0.1,
        },
        easing: 'linear',
        scale: {
          hover: 1.02,
        },
      };
    case 'paper-ledger':
      return {
        duration: {
          default: 0.2,
        },
        easing: 'ease-in-out',
        scale: {
          hover: 1.03,
        },
      };
    // Handle legacy theme names for backward compatibility
    case 'hackers':
      return getSimpleAnimationParams('synthwave-noir');
    case 'dystopia':
      return getSimpleAnimationParams('terminal-mono');
    case 'neotopia':
      return getSimpleAnimationParams('paper-ledger');
    default:
      return {
        duration: {
          default: 0.2,
        },
        easing: 'ease-in-out',
        scale: {
          hover: 1.03,
        },
      };
  }
}

// Generate basic CSS variables for animations
export function generateSimpleAnimationCSSVars(theme: Theme): Record<string, string> {
  try {
    const params = getSimpleAnimationParams(theme);
    
    return {
      '--animation-duration': `${params.duration.default}s`,
      '--animation-easing': params.easing,
      '--animation-scale-hover': params.scale.hover.toString(),
    };
  } catch (error) {
    console.error('Error generating animation CSS variables:', error);
    return {
      '--animation-duration': '0.2s',
      '--animation-easing': 'ease',
      '--animation-scale-hover': '1.03',
    };
  }
}

// Hook for checking reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check initial preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('Error checking motion preferences:', error);
      return () => {};
    }
  }, []);
  
  return prefersReducedMotion;
}