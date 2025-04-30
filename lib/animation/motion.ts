// lib/animation/motion.ts

import { useEffect, useState } from 'react';
import { type Theme } from '../../providers/SettingsProvider';

// Check for reduced motion preference
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

// Get theme-specific animation parameters
export function getThemeAnimationParams(theme: Theme) {
  switch (theme) {
    case 'synthwave-noir':
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
    case 'terminal-mono':
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
    case 'paper-ledger':
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
  const params = getThemeAnimationParams(theme);
  
  return {
    '--animation-duration-fast': `${params.duration.fast}s`,
    '--animation-duration-medium': `${params.duration.medium}s`,
    '--animation-duration-slow': `${params.duration.slow}s`,
    '--animation-easing-default': `cubic-bezier(${params.easing.default.join(', ')})`,
    '--animation-easing-in': `cubic-bezier(${params.easing.in.join(', ')})`,
    '--animation-easing-out': `cubic-bezier(${params.easing.out.join(', ')})`,
    '--animation-easing-in-out': `cubic-bezier(${params.easing.inOut.join(', ')})`,
    '--animation-scale-hover': params.scale.hover.toString(),
    '--animation-scale-tap': params.scale.tap.toString(),
    '--animation-glow-intensity': params.glow.intensity,
    '--animation-glow-color': params.glow.color
  };
}