// lib/animation/variants.ts

import { type Theme } from '../../providers/SettingsProvider'; // Use relative path for consistency
import { getThemeAnimationParams } from './motion';
import { Variants } from 'framer-motion'; // Import Variants type from framer-motion

// Base variants that respect reduced motion
export const getBaseVariants = (prefersReducedMotion: boolean): Variants => {
  if (prefersReducedMotion) {
    // Minimal variants for reduced motion
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  
  // Default variants with motion
  return {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.2 
      } 
    }
  };
};

// Get theme-specific variants
export const getThemeVariants = (theme: Theme, prefersReducedMotion: boolean): Variants => {
  const baseVariants = getBaseVariants(prefersReducedMotion);
  const params = getThemeAnimationParams(theme);
  
  if (prefersReducedMotion) {
    return baseVariants;
  }
  
  switch (theme) {
    case 'synthwave-noir':
      return {
        hidden: { 
          opacity: 0, 
          y: 30, 
          scale: 0.95 
        },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            type: 'spring', 
            stiffness: 300, 
            damping: 20,
            duration: params.duration.medium
          } 
        },
        exit: { 
          opacity: 0, 
          scale: 1.05,
          filter: 'blur(4px)',
          transition: { 
            duration: params.duration.fast,
            ease: params.easing.out
          } 
        },
        hover: {
          scale: params.scale.hover,
          boxShadow: `${params.glow.intensity} ${params.glow.color}`,
          transition: {
            duration: params.duration.fast,
            ease: params.easing.default
          }
        },
        tap: {
          scale: params.scale.tap,
          transition: {
            duration: params.duration.fast * 0.5,
            ease: params.easing.default
          }
        }
      };
    case 'terminal-mono':
      return {
        hidden: { 
          opacity: 0,
          y: 10
        },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: params.duration.fast,
            ease: [0, 0, 1, 1], // Linear easing
            type: "tween"
          }
        },
        exit: {
          opacity: 0,
          transition: {
            duration: params.duration.fast * 0.5,
            ease: [0, 0, 1, 1], // Linear easing
            type: "tween"
          }
        },
        hover: {
          scale: params.scale.hover,
          boxShadow: `${params.glow.intensity} ${params.glow.color}`,
          transition: {
            duration: params.duration.fast,
            ease: [0, 0, 1, 1], // Linear easing
            type: "tween"
          }
        },
        tap: {
          scale: params.scale.tap,
          transition: {
            duration: params.duration.fast * 0.5,
            ease: [0, 0, 1, 1], // Linear easing
            type: "tween"
          }
        }
      };
    case 'paper-ledger':
    default:
      return {
        hidden: { 
          opacity: 0, 
          y: 15 
        },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            type: 'spring', 
            stiffness: 500, 
            damping: 30,
            duration: params.duration.medium
          } 
        },
        exit: { 
          opacity: 0,
          transition: { 
            duration: params.duration.fast,
            ease: params.easing.out
          } 
        },
        hover: {
          scale: params.scale.hover,
          boxShadow: `${params.glow.intensity} ${params.glow.color}`,
          transition: {
            duration: params.duration.medium,
            ease: params.easing.default
          }
        },
        tap: {
          scale: params.scale.tap,
          transition: {
            duration: params.duration.fast,
            ease: params.easing.default
          }
        }
      };
  }
};