import { useState, useEffect } from 'react';
import type { Theme } from '../../providers/ThemeProvider';

// Define animation parameters interface for proper typing
export interface AnimationParams {
  duration: {
    fast: number;
    medium: number;
    slow: number;
  };
  easing: {
    default: number[];
    in: number[];
    out: number[];
    inOut: number[];
  };
  scale: {
    hover: number;
    tap: number;
  };
  glow: {
    intensity: string;
    color: string;
  };
}

// Get theme-specific animation parameters
export function getThemeAnimationParams(theme: Theme): AnimationParams {
  // Handle legacy theme names first
  if (theme === 'synthwave-noir') return getThemeAnimationParams('hackers');
  if (theme === 'terminal-mono') return getThemeAnimationParams('dystopia');
  if (theme === 'paper-ledger') return getThemeAnimationParams('neotopia');
  
  switch (theme) {
    case 'hackers':
      return {
        duration: {
          fast: 0.3,
          medium: 0.4,
          slow: 0.5
        },
        easing: {
          default: [0.4, 0, 0.2, 1], // cubic-bezier
          in: [0.4, 0, 1, 1],
          out: [0, 0, 0.2, 1],
          inOut: [0.4, 0, 0.2, 1]
        },
        scale: {
          hover: 1.05,
          tap: 0.95
        },
        glow: {
          intensity: '0 0 10px',
          color: 'var(--glow-pulse)'
        }
      };
    case 'dystopia':
      return {
        duration: {
          fast: 0.1,
          medium: 0.15,
          slow: 0.2
        },
        easing: {
          default: [0, 0, 1, 1], // cubic-bezier (linear)
          in: [0, 0, 1, 1],
          out: [0, 0, 1, 1],
          inOut: [0, 0, 1, 1]
        },
        scale: {
          hover: 1.02,
          tap: 0.98
        },
        glow: {
          intensity: '0 0 5px',
          color: 'var(--glow-pulse)'
        }
      };
    case 'neotopia':
    default:
      return {
        duration: {
          fast: 0.2,
          medium: 0.25,
          slow: 0.3
        },
        easing: {
          default: [0.4, 0, 0.2, 1], // cubic-bezier
          in: [0.4, 0, 1, 1],
          out: [0, 0, 0.2, 1],
          inOut: [0.4, 0, 0.2, 1]
        },
        scale: {
          hover: 1.03,
          tap: 0.97
        },
        glow: {
          intensity: '0 0 3px',
          color: 'var(--glow-pulse)'
        }
      };
  }
}

// Generate CSS variables for animations based on theme
export function generateAnimationCSSVars(theme: Theme): Record<string, string> {
  try {
    const params = getThemeAnimationParams(theme);
    
    // Use default values as fallbacks if params or properties are undefined
    const duration = params?.duration || { fast: 0.2, medium: 0.3, slow: 0.4 };
    const easing = params?.easing || { 
      default: [0.4, 0, 0.2, 1], 
      in: [0.4, 0, 1, 1], 
      out: [0, 0, 0.2, 1], 
      inOut: [0.4, 0, 0.2, 1] 
    };
    const scale = params?.scale || { hover: 1.03, tap: 0.97 };
    const glow = params?.glow || { intensity: '0 0 5px', color: 'var(--glow-pulse)' };
    
    return {
      '--animation-duration-fast': `${duration.fast}s`,
      '--animation-duration-medium': `${duration.medium}s`,
      '--animation-duration-slow': `${duration.slow}s`,
      '--animation-easing-default': `cubic-bezier(${easing.default.join(', ')})`,
      '--animation-easing-in': `cubic-bezier(${easing.in.join(', ')})`,
      '--animation-easing-out': `cubic-bezier(${easing.out.join(', ')})`,
      '--animation-easing-in-out': `cubic-bezier(${easing.inOut.join(', ')})`,
      '--animation-scale-hover': scale.hover.toString(),
      '--animation-scale-tap': scale.tap.toString(),
      '--animation-glow-intensity': glow.intensity,
      '--animation-glow-color': glow.color
    };
  } catch (error) {
    console.error('Error generating animation CSS variables:', error);
    // Return safe fallback values in case of error
    return {
      '--animation-duration-fast': '0.2s',
      '--animation-duration-medium': '0.3s',
      '--animation-duration-slow': '0.4s',
      '--animation-easing-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--animation-easing-in': 'cubic-bezier(0.4, 0, 1, 1)',
      '--animation-easing-out': 'cubic-bezier(0, 0, 0.2, 1)',
      '--animation-easing-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--animation-scale-hover': '1.03',
      '--animation-scale-tap': '0.97',
      '--animation-glow-intensity': '0 0 5px',
      '--animation-glow-color': 'var(--glow-pulse)'
    };
  }
}

// Hook for checking reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
}