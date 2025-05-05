'use client';

import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useReducedMotion } from '@/lib/animation/motion';
import { getThemeSpecificVariants } from '@/lib/animation/variants';
import { Theme } from '@/types/theme';

/**
 * Hook that provides animation variants based on the current theme and user's motion preferences
 */
export function useAnimationVariants() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  
  // Get the animation variants for the current theme
  const variants = getThemeSpecificVariants(theme, prefersReducedMotion);
  
  return {
    variants,
    prefersReducedMotion,
    currentTheme: theme
  };
}