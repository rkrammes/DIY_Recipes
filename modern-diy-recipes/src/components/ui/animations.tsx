'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation, useEntranceAnimation, useStaggerAnimation, useInteractiveAnimation } from '../../providers/AnimationProvider';

// Basic animated component with entrance animation
export function AnimatedElement({
  children,
  className = '',
  as = 'div',
  variants,
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  variants?: Record<string, any>;
  delay?: number;
  [key: string]: any;
}) {
  const { variants: defaultVariants, isReducedMotion } = useAnimation();
  const animationVariants = variants || defaultVariants.fadeIn;
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={animationVariants}
      transition={{ 
        delay: isReducedMotion ? 0 : delay,
        duration: isReducedMotion ? 0 : 0.5
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in animation
export function FadeIn({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  [key: string]: any;
}) {
  const { isReducedMotion } = useAnimation();
  
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay: isReducedMotion ? 0 : delay,
        duration: isReducedMotion ? 0 : duration
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide up animation
export function SlideUp({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  distance = 20,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  [key: string]: any;
}) {
  const { isReducedMotion } = useAnimation();
  
  return (
    <motion.div
      className={className}
      initial={{ y: isReducedMotion ? 0 : distance, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        delay: isReducedMotion ? 0 : delay,
        duration: isReducedMotion ? 0 : duration
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale animation
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  [key: string]: any;
}) {
  const { isReducedMotion } = useAnimation();
  
  return (
    <motion.div
      className={className}
      initial={{ scale: isReducedMotion ? 1 : 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: isReducedMotion ? 0 : delay,
        duration: isReducedMotion ? 0 : duration
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
export function AnimatedList({
  children,
  className = '',
  staggerDelay = 0.05,
  ...props
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  [key: string]: any;
}) {
  const { isReducedMotion } = useAnimation();
  
  return (
    <motion.div className={className} {...props}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: isReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: isReducedMotion ? 0 : index * staggerDelay,
            duration: isReducedMotion ? 0 : 0.3
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Interactive button with animations
export function AnimatedButton({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const animation = useInteractiveAnimation();
  
  return (
    <motion.button
      className={className}
      {...animation}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated presence wrapper for exit animations
export function AnimatedTransition({
  children,
  isVisible,
  className = '',
  mode = 'wait',
  ...props
}: {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
  mode?: 'wait' | 'sync';
  [key: string]: any;
}) {
  const { variants } = useAnimation();
  
  return (
    <AnimatePresence mode={mode}>
      {isVisible && (
        <motion.div
          className={className}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants.pageTransition}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Theme-specific animation components
export function ThemeAnimation({
  children,
  className = '',
  type,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  type: 'neonPulse' | 'terminalFlicker' | 'paperFold' | string;
  [key: string]: any;
}) {
  const { variants, isReducedMotion } = useAnimation();
  
  // Skip animation if reduced motion is preferred
  if (isReducedMotion) {
    return <div className={className} {...props}>{children}</div>;
  }
  
  // Use theme-specific animation if available, or fall back to basic fade
  const animationVariants = variants[type] || variants.fadeIn;
  
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={animationVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}