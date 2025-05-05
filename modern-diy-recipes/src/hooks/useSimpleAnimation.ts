import { useEffect, useState } from 'react';
import { useSimpleTheme } from '@/providers/SimpleThemeProviderCompat';
import { getSimpleAnimationParams, useReducedMotion } from '@/lib/animation/simple-motion';

export function useSimpleAnimation() {
  const { theme } = useSimpleTheme();
  const prefersReducedMotion = useReducedMotion();
  const [animationParams, setAnimationParams] = useState(getSimpleAnimationParams(theme));
  
  // Update animation parameters when theme changes
  useEffect(() => {
    try {
      setAnimationParams(getSimpleAnimationParams(theme));
    } catch (error) {
      console.error('Error updating animation parameters:', error);
    }
  }, [theme]);

  // Generate CSS for components
  const generateTransition = (property: string = 'all') => {
    if (prefersReducedMotion) return '';
    return `${property} ${animationParams.duration.default}s ${animationParams.easing}`;
  };

  // Generate style object for hover effects
  const getHoverStyles = (isHovered: boolean) => {
    if (prefersReducedMotion) return {};
    
    return {
      transform: isHovered 
        ? `scale(${animationParams.scale.hover})` 
        : 'scale(1)',
      transition: generateTransition('transform')
    };
  };

  return {
    animationParams,
    prefersReducedMotion,
    generateTransition,
    getHoverStyles
  };
}