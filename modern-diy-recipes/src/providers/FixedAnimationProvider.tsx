'use client';

import React, { useEffect, useState } from 'react';
import type { Theme } from '../types/theme';
import { createSafeProvider } from '../lib/safe-provider';

interface AnimationContextType {
  isReducedMotion: boolean;
  theme: Theme;
  getThemeVariants: (variant: string) => any;
}

// Create a safe provider using the MCP pattern to prevent SSR issues
const { Provider, useValue } = createSafeProvider<AnimationContextType>(
  {
    isReducedMotion: false,
    theme: 'hackers',
    getThemeVariants: () => ({})
  },
  'FixedAnimation'
);

// Base animation configurations
const baseAnimations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  },
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  },
  buttonHover: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }
};

// Theme-specific animation variants
const themeVariants: Record<Theme, Record<string, any>> = {
  hackers: {
    ...baseAnimations,
    buttonHover: {
      ...baseAnimations.buttonHover,
      hover: { 
        scale: 1.05,
        boxShadow: '0 0 8px var(--color-accent)',
        transition: { duration: 0.3 }
      },
    }
  },
  dystopia: {
    ...baseAnimations,
    buttonHover: {
      ...baseAnimations.buttonHover,
      hover: { 
        scale: 1.02,
        transition: { duration: 0.1 }
      },
      tap: { 
        scale: 0.98,
        transition: { duration: 0.05 }
      }
    }
  },
  neotopia: {
    ...baseAnimations,
    buttonHover: {
      ...baseAnimations.buttonHover,
      hover: { 
        scale: 1.03,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: { duration: 0.25 }
      },
    }
  }
};

export function FixedAnimationProvider({
  children,
  initialTheme = 'hackers',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Listen for reduced motion preference
  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('Error checking motion preferences:', error);
    }
  }, []);
  
  // Update theme when data-theme attribute changes
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;
    
    try {
      // Get initial theme from data-theme attribute
      try {
        const currentTheme = document.documentElement.getAttribute('data-theme') as Theme;
        if (currentTheme && ['hackers', 'dystopia', 'neotopia'].includes(currentTheme)) {
          setTheme(currentTheme as Theme);
          console.log('Initial animation theme set to:', currentTheme);
        }
      } catch (initialError) {
        console.warn('Could not get initial theme:', initialError);
      }
      
      // Set up observer for theme changes
      try {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            try {
              if (
                mutation.attributeName === 'data-theme' && 
                mutation.target === document.documentElement
              ) {
                const newTheme = document.documentElement.getAttribute('data-theme') as Theme;
                if (newTheme && ['hackers', 'dystopia', 'neotopia'].includes(newTheme)) {
                  setTheme(newTheme as Theme);
                  console.log('Animation theme updated to:', newTheme);
                }
              }
            } catch (mutationError) {
              console.warn('Error processing mutation:', mutationError);
            }
          });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        return () => {
          try {
            observer.disconnect();
          } catch (disconnectError) {
            console.warn('Error disconnecting observer:', disconnectError);
          }
        };
      } catch (observerError) {
        console.error('Could not create mutation observer:', observerError);
        // Fallback: periodically check for theme changes
        const intervalId = setInterval(() => {
          try {
            const currentTheme = document.documentElement.getAttribute('data-theme') as Theme;
            if (currentTheme && ['hackers', 'dystopia', 'neotopia'].includes(currentTheme) && currentTheme !== theme) {
              setTheme(currentTheme as Theme);
              console.log('Animation theme updated (fallback) to:', currentTheme);
            }
          } catch (intervalError) {
            console.warn('Error in fallback theme check:', intervalError);
          }
        }, 1000);
        
        return () => clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Unexpected error in animation theme effect:', error);
    }
  }, [mounted, theme]);
  
  // Get animation variants for the current theme
  const getThemeVariants = (variant: string) => {
    // If reduced motion is preferred, return simplified variants
    if (isReducedMotion) {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
        rest: { scale: 1 },
        hover: { scale: 1 },
        tap: { scale: 1 }
      };
    }
    
    // Return the requested variant for the current theme
    return themeVariants[theme]?.[variant] || baseAnimations[variant as keyof typeof baseAnimations] || {};
  };
  
  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Provider value={{ 
      isReducedMotion,
      theme,
      getThemeVariants
    }}>
      {children}
    </Provider>
  );
}

// Export the hook with the safe provider value accessor
export const useFixedAnimation = useValue;