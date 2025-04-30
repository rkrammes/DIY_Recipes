# Animation System Implementation Guide

This document outlines the implementation approach for the animation system described in the research. The goal is to create a cohesive animation experience that enhances the UI while respecting user preferences for reduced motion.

## 1. Animation Design Philosophy

The DIY Recipes app will use an animation system with these key principles:

- **Performance-First**: Prioritize GPU-accelerated properties (transform, opacity)
- **Theme-Integrated**: Animation characteristics vary based on active theme
- **Accessibility-Aware**: Respects user preferences for reduced motion
- **Purposeful**: Animations convey meaning and enhance usability
- **Consistent**: Similar interactions have similar animations

## 2. Animation Specifications

### 2.1 Interaction Animation Profiles

| Interaction           | Animation                         | Tooling                                                 | Perf Notes                     |
| --------------------- | --------------------------------- | ------------------------------------------------------- | ------------------------------ |
| Page transition       | Fade + scale 95→100%              | `framer‑motion` `<AnimatePresence>`                     | Runs on GPU; ok for CSR/SSR.   |
| Scroll‑trigger panels | Parallax Y −40 → 0 px             | `framer-motion`, observer hook                          | Uses `will-change: transform`. |
| Button hover          | Accent ring grow 0→4 px           | Tailwind keyframes (`scale-ripple`).                    | Pure CSS when possible.        |
| Synth event tie‑in    | Quick glow sync to audio envelope | Listen to audio `ended` event; toggle `data-glow` attr. | Keep RAF loops < 60 fps.       |

### 2.2 Theme-Specific Animation Variations

#### Synthwave Noir
- Longer animation durations (0.3s - 0.5s)
- Exaggerated motion (larger transforms)
- Glow effects on hover/focus
- Subtle pulsing animations

#### Terminal Mono
- Quick, abrupt animations (0.1s - 0.2s)
- Minimal motion
- Flicker effects
- Step-based transitions (no easing)

#### Paper Ledger
- Medium duration animations (0.2s - 0.3s)
- Subtle, natural motion
- Soft easing functions
- Minimal glow/special effects

## 3. Implementation Architecture

### 3.1 Core Animation Utilities

```typescript
// lib/animation/motion.ts

import { useEffect, useState } from 'react';
import { type Theme } from '@/providers/SettingsProvider';

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
          color: 'var(--accent)'
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
          color: 'var(--accent)'
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
          color: 'var(--accent)'
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
```

### 3.2 Framer Motion Variants

```typescript
// lib/animation/variants.ts

import { type Theme } from '@/providers/SettingsProvider';
import { getThemeAnimationParams } from './motion';

// Base variants that respect reduced motion
export const getBaseVariants = (prefersReducedMotion: boolean) => {
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
export const getThemeVariants = (theme: Theme, prefersReducedMotion: boolean) => {
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
            ease: 'steps(3)',
          } 
        },
        exit: { 
          opacity: 0,
          transition: { 
            duration: params.duration.fast * 0.5,
            ease: 'steps(2)'
          } 
        },
        hover: {
          scale: params.scale.hover,
          transition: {
            duration: params.duration.fast,
            ease: 'steps(2)'
          }
        },
        tap: {
          scale: params.scale.tap,
          transition: {
            duration: params.duration.fast * 0.5,
            ease: 'steps(1)'
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
```

### 3.3 CSS Animation Keyframes

```typescript
// styles/animations.css

/* Base keyframes for all themes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Theme-specific keyframes */
/* Synthwave Noir */
@keyframes neonPulse {
  0%, 100% { box-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent); }
  50% { box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent), 0 0 30px var(--accent); }
}

@keyframes glitchText {
  0%, 100% { text-shadow: none; }
  25% { text-shadow: -2px 0 var(--accent-hover), 2px 2px var(--accent); }
  50% { text-shadow: 2px -1px var(--accent), -2px 2px var(--accent-hover); }
  75% { text-shadow: 1px 1px var(--accent-hover), -1px -1px var(--accent); }
}

/* Terminal Mono */
@keyframes terminalBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  5% { opacity: 0.96; }
  10% { opacity: 1; }
  15% { opacity: 0.94; }
  20% { opacity: 1; }
  25% { opacity: 0.98; }
  30% { opacity: 1; }
  35% { opacity: 0.97; }
  40% { opacity: 1; }
  45% { opacity: 0.95; }
  50% { opacity: 1; }
}

/* Paper Ledger */
@keyframes pageFlip {
  0% { transform: rotateY(0); }
  100% { transform: rotateY(-15deg); }
}

@keyframes inkSpread {
  0% { background-size: 100% 0; }
  100% { background-size: 100% 100%; }
}

/* Animation utility classes */
.animate-fade-in {
  animation: fadeIn var(--animation-duration-medium) var(--animation-easing-default) forwards;
}

.animate-fade-out {
  animation: fadeOut var(--animation-duration-medium) var(--animation-easing-default) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--animation-duration-medium) var(--animation-easing-default) forwards;
}

.animate-slide-in-up {
  animation: slideInUp var(--animation-duration-medium) var(--animation-easing-default) forwards;
}

.animate-slide-in-down {
  animation: slideInDown var(--animation-duration-medium) var(--animation-easing-default) forwards;
}

.animate-pulse {
  animation: pulse 2s var(--animation-easing-in-out) infinite;
}

/* Theme-specific animation classes */
/* Synthwave Noir */
.synthwave-neon-pulse {
  animation: neonPulse 3s var(--animation-easing-in-out) infinite alternate;
}

.synthwave-glitch-text {
  animation: glitchText 2s step-end infinite;
}

/* Terminal Mono */
.terminal-blink {
  animation: terminalBlink 1s step-end infinite;
}

.terminal-scanline {
  animation: scanline 10s linear infinite;
}

.terminal-flicker {
  animation: flicker 0.15s infinite;
}

/* Paper Ledger */
.paper-page-flip {
  animation: pageFlip 1.5s var(--animation-easing-in-out) alternate;
}

.paper-ink-spread {
  animation: inkSpread 0.5s var(--animation-easing-out) forwards;
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0 100%;
  background-repeat: no-repeat;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, ::after, ::before {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  
  .animate-fade-in,
  .animate-fade-out,
  .animate-scale-in,
  .animate-slide-in-up,
  .animate-slide-in-down,
  .animate-pulse,
  .synthwave-neon-pulse,
  .synthwave-glitch-text,
  .terminal-blink,
  .terminal-scanline,
  .terminal-flicker,
  .paper-page-flip,
  .paper-ink-spread {
    animation: none !important;
  }
}
```

## 4. Integration with Theme System

### 4.1 Connecting Animations to Theme Provider

```typescript
// providers/SettingsProvider.tsx (partial)

// ...existing imports
import { generateAnimationCSSVars } from '@/lib/animation/motion';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ...existing state
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Apply animation CSS variables when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const animationVars = generateAnimationCSSVars(theme);
    
    // Apply CSS variables to document root
    Object.entries(animationVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);
  
  // ...rest of component
  
  return (
    <SettingsContext.Provider value={{ 
      // ...existing values
      prefersReducedMotion,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
```

### 4.2 Component Integration Examples

```tsx
// Example AnimatedCard Component
import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/providers/SettingsProvider';
import { getThemeVariants } from '@/lib/animation/variants';

interface AnimatedCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  onClick, 
  className = '' 
}) => {
  const { theme, prefersReducedMotion } = useSettings();
  const variants = getThemeVariants(theme, prefersReducedMotion);
  
  return (
    <motion.div
      className={`bg-surface-1 p-4 rounded-md shadow-soft ${className}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      variants={variants}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
```

```tsx
// Example CSS Animation Component
import React from 'react';
import { useSettings } from '@/providers/SettingsProvider';

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  children, 
  className = '' 
}) => {
  const { theme, prefersReducedMotion } = useSettings();
  
  // Choose animation class based on theme
  const animationClass = React.useMemo(() => {
    if (prefersReducedMotion) return '';
    
    switch (theme) {
      case 'synthwave-noir':
        return 'synthwave-glitch-text';
      case 'terminal-mono':
        return 'terminal-flicker';
      case 'paper-ledger':
        return 'paper-ink-spread';
      default:
        return '';
    }
  }, [theme, prefersReducedMotion]);
  
  return (
    <span className={`${animationClass} ${className}`}>
      {children}
    </span>
  );
};
```

## 5. Synth-Animation Synchronization

### 5.1 Connecting Audio Events to Animations

```typescript
// hooks/useSynthAnimation.ts

import { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/providers/SettingsProvider';
import { playSound } from '@/lib/sound';

interface SynthAnimationOptions {
  soundEvent: 'hover' | 'click' | 'success' | 'error';
  animationDuration?: number;
}

export function useSynthAnimation({ soundEvent, animationDuration }: SynthAnimationOptions) {
  const { theme, audioEnabled, prefersReducedMotion } = useSettings();
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Trigger animation and sound
  const trigger = () => {
    // Skip if reduced motion or audio disabled
    if (prefersReducedMotion) return;
    
    // Play sound if enabled
    if (audioEnabled) {
      playSound(soundEvent, theme);
    }
    
    // Start animation
    setIsAnimating(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Calculate animation duration based on theme
    let duration = animationDuration;
    if (!duration) {
      switch (theme) {
        case 'synthwave-noir':
          duration = 400;
          break;
        case 'terminal-mono':
          duration = 200;
          break;
        case 'paper-ledger':
          duration = 300;
          break;
        default:
          duration = 300;
      }
    }
    
    // End animation after duration
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isAnimating,
    trigger
  };
}
```

### 5.2 Using the Hook in Components

```tsx
// Example Button with Synth Animation
import React from 'react';
import { useSynthAnimation } from '@/hooks/useSynthAnimation';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  const { isAnimating, trigger } = useSynthAnimation({ 
    soundEvent: 'click' 
  });
  
  const handleClick = (e: React.MouseEvent) => {
    trigger();
    if (onClick) onClick(e);
  };
  
  return (
    <button
      className={`
        px-4 py-2 
        rounded-md 
        transition-all 
        ${variant === 'primary' ? 'bg-accent text-surface-0' : 'bg-surface-1 text-text-primary border border-accent'}
        ${isAnimating ? 'scale-95' : ''}
      `}
      onClick={handleClick}
      data-animating={isAnimating}
    >
      {children}
    </button>
  );
};
```

## 6. Implementation Steps

1. **Create Animation Core Module**
   - Implement reduced motion detection
   - Create theme-specific animation parameters
   - Generate CSS variables for animations

2. **Implement Animation Variants**
   - Create Framer Motion variants
   - Add CSS keyframes and utility classes
   - Implement theme-specific animations

3. **Connect to Theme System**
   - Update SettingsProvider to include animation preferences
   - Apply CSS variables when theme changes
   - Create hooks for animation control

4. **Add Component Integration**
   - Create animated component wrappers
   - Add animation triggers to common components
   - Implement synth-animation synchronization

5. **Implement Accessibility Features**
   - Add reduced motion detection
   - Create alternative animations for reduced motion
   - Ensure animations can be disabled

6. **Optimize Performance**
   - Use will-change property judiciously
   - Implement animation cleanup
   - Monitor frame rates and optimize as needed

## 7. Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [CSS Animations MDN Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Designing Accessible Animations](https://www.smashingmagazine.com/2018/04/designing-accessible-animation/)