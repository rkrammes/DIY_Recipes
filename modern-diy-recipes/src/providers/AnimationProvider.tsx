'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// Import Theme type from the dedicated types file instead of hooks/useAudio
import { type Theme } from '../types/theme';
import { useReducedMotion } from '../lib/animation/motion';
import { getThemeSpecificVariants } from '../lib/animation/variants';

interface AnimationContextType {
  isReducedMotion: boolean;
  variants: Record<string, any>;
  theme: Theme;
}

// Use the createSafeProvider pattern for SSR safety
import { createSafeProvider } from '../lib/mcp-safe-provider';

// Create a safe provider with default values
const { Provider, useValue } = createSafeProvider<AnimationContextType>(
  {
    isReducedMotion: false,
    variants: {},
    theme: 'hackers',
  },
  'Animation'
);

export function AnimationProvider({
  children,
  initialTheme = 'hackers',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const prefersReducedMotion = useReducedMotion();
  const [isReducedMotion, setIsReducedMotion] = useState(prefersReducedMotion);
  const [variants, setVariants] = useState<Record<string, any>>(
    getThemeSpecificVariants(initialTheme, prefersReducedMotion)
  );
  
  // Watch for theme changes via data-theme attribute
  // This reads from DOM rather than importing from ThemeProvider
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get initial theme from data-theme attribute
      const currentTheme = document.documentElement.getAttribute('data-theme') as Theme;
      if (currentTheme && ['hackers', 'dystopia', 'neotopia'].includes(currentTheme)) {
        setTheme(currentTheme as Theme);
      }
      
      // Watch for theme attribute changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName === 'data-theme' && 
            mutation.target === document.documentElement
          ) {
            const newTheme = document.documentElement.getAttribute('data-theme') as Theme;
            if (newTheme && ['hackers', 'dystopia', 'neotopia'].includes(newTheme)) {
              setTheme(newTheme as Theme);
            }
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      return () => {
        observer.disconnect();
      };
    } catch (error) {
      console.error('Error watching theme changes:', error);
    }
  }, []);

  // Update animation variants when theme changes or motion preferences change
  useEffect(() => {
    setIsReducedMotion(prefersReducedMotion);
    setVariants(getThemeSpecificVariants(theme, prefersReducedMotion));
  }, [theme, prefersReducedMotion]);

  return (
    <Provider value={{ 
      isReducedMotion,
      variants,
      theme
    }}>
      {children}
    </Provider>
  );
}

// Export the hook with the safe value accessor
export const useAnimation = useValue;

// Helper hooks for common animation patterns
export function useEntranceAnimation(customVariants?: Record<string, any>) {
  const { variants, isReducedMotion } = useAnimation();
  
  // Use the provided custom variants or fall back to default entrance animation
  const animationVariants = customVariants || variants.fadeIn;
  
  // Don't animate if user prefers reduced motion
  if (isReducedMotion) {
    return {
      initial: "visible",
      animate: "visible",
      variants: animationVariants,
    };
  }
  
  return {
    initial: "hidden",
    animate: "visible",
    variants: animationVariants,
  };
}

// Animation for interactive elements
export function useInteractiveAnimation(customVariants?: Record<string, any>) {
  const { variants, isReducedMotion } = useAnimation();
  
  // Use the provided custom variants or fall back to button hover animation
  const animationVariants = customVariants || variants.buttonHover;
  
  // Simplified behavior for reduced motion
  if (isReducedMotion) {
    return {
      variants: {
        rest: { opacity: 1 },
        hover: { opacity: 0.9 },
        tap: { opacity: 0.8 },
      },
      initial: "rest",
      whileHover: "hover",
      whileTap: "tap",
    };
  }
  
  return {
    variants: animationVariants,
    initial: "rest",
    whileHover: "hover",
    whileTap: "tap",
  };
}

// List item stagger animation
export function useStaggerAnimation(index: number, customVariants?: Record<string, any>) {
  const { variants, isReducedMotion } = useAnimation();
  
  // Use the provided custom variants or fall back to list item stagger animation
  const animationVariants = customVariants || variants.listItem;
  
  // Don't stagger if user prefers reduced motion
  if (isReducedMotion) {
    return {
      initial: "visible",
      animate: "visible",
      variants: animationVariants,
      custom: index,
    };
  }
  
  return {
    initial: "hidden",
    animate: "visible",
    variants: animationVariants,
    custom: index,
  };
}