import type { Theme } from '../../types/theme';

// Define animation variants for each theme
export const getThemeSpecificVariants = (theme: Theme, prefersReducedMotion: boolean = false) => {
  // Base variants that work across all themes
  const baseVariants = {
    // Fade in animation
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: 'easeOut'
        }
      }
    },
    
    // Slide up animation
    slideUp: {
      hidden: { y: 20, opacity: 0 },
      visible: { 
        y: 0, 
        opacity: 1,
        transition: { 
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: 'easeOut'
        }
      }
    },
    
    // Scale animation
    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { 
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: 'easeOut'
        }
      }
    },
    
    // Button hover animation
    buttonHover: {
      rest: { scale: 1 },
      hover: { 
        scale: prefersReducedMotion ? 1 : 1.05,
        transition: { duration: 0.2 }
      },
      tap: { 
        scale: prefersReducedMotion ? 1 : 0.95,
        transition: { duration: 0.1 }
      }
    },
    
    // List stagger animation
    listItem: {
      hidden: { opacity: 0, x: -10 },
      visible: (custom: number) => ({
        opacity: 1,
        x: 0,
        transition: {
          delay: prefersReducedMotion ? 0 : custom * 0.05,
          duration: prefersReducedMotion ? 0 : 0.3
        }
      })
    },
  };
  
  // Theme-specific variants
  if (theme === 'hackers') {
    return {
      ...baseVariants,
      // Neon glow animation
      neonPulse: {
        initial: { boxShadow: '0 0 5px 0px oklch(var(--accent)/0.4)' },
        animate: {
          boxShadow: [
            '0 0 5px 0px oklch(var(--accent)/0.4)',
            '0 0 10px 2px oklch(var(--accent)/0.6)',
            '0 0 5px 0px oklch(var(--accent)/0.4)',
          ],
          transition: {
            duration: prefersReducedMotion ? 0 : 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        }
      },
      // Special page transition
      pageTransition: {
        initial: { 
          opacity: 0,
          y: 10,
          filter: 'hue-rotate(0deg)' 
        },
        animate: { 
          opacity: 1,
          y: 0,
          filter: 'hue-rotate(0deg)',
          transition: {
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: [0.25, 0.1, 0.25, 1]
          }
        },
        exit: { 
          opacity: 0,
          y: -10,
          filter: 'hue-rotate(30deg)',
          transition: {
            duration: prefersReducedMotion ? 0 : 0.4
          }
        }
      }
    };
  }
  
  if (theme === 'dystopia') {
    return {
      ...baseVariants,
      // Terminal flicker animation
      terminalFlicker: {
        initial: { opacity: 1 },
        animate: {
          opacity: [1, 0.9, 1, 0.95, 1],
          transition: {
            duration: prefersReducedMotion ? 0 : 0.2,
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatDelay: 3,
            ease: 'linear'
          }
        }
      },
      // Typing animation
      typing: {
        initial: { width: '0%' },
        animate: {
          width: '100%',
          transition: {
            duration: prefersReducedMotion ? 0 : 1,
            ease: 'steps(40)'
          }
        }
      },
      // Special page transition
      pageTransition: {
        initial: { 
          opacity: 0,
          y: 5,
          clipPath: 'inset(0% 0% 100% 0%)' 
        },
        animate: { 
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          transition: {
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: 'linear'
          }
        },
        exit: { 
          opacity: 0,
          clipPath: 'inset(100% 0% 0% 0%)',
          transition: {
            duration: prefersReducedMotion ? 0 : 0.2
          }
        }
      }
    };
  }
  
  // Paper Ledger theme
  return {
    ...baseVariants,
    // Paper fold animation
    paperFold: {
      initial: { 
        rotateX: prefersReducedMotion ? 0 : 10,
        opacity: 0,
        transformOrigin: 'top'
      },
      animate: { 
        rotateX: 0,
        opacity: 1,
        transition: {
          duration: prefersReducedMotion ? 0 : 0.6,
          ease: 'easeOut'
        }
      }
    },
    // Subtle paper hover effect
    paperHover: {
      rest: { y: 0, boxShadow: 'var(--shadow-soft)' },
      hover: { 
        y: prefersReducedMotion ? 0 : -3,
        boxShadow: '0 6px 10px rgba(0,0,0,0.1)',
        transition: { duration: 0.3, ease: 'easeOut' }
      }
    },
    // Special page transition
    pageTransition: {
      initial: { 
        opacity: 0,
        scale: 0.98,
        y: 5
      },
      animate: { 
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: 'easeOut'
        }
      },
      exit: { 
        opacity: 0,
        scale: 0.98,
        y: 5,
        transition: {
          duration: prefersReducedMotion ? 0 : 0.3
        }
      }
    }
  };
};