'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../providers/ThemeProvider';
import { 
  FadeIn, 
  SlideUp, 
  ScaleIn, 
  AnimatedList, 
  AnimatedButton,
  ThemeAnimation
} from '../../components/ui/animations';

export default function ThemeTestPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <FadeIn>
        <h1 className="text-4xl font-heading font-bold mb-8">Font & Animation System Test</h1>
      </FadeIn>
      
      <SlideUp delay={0.1}>
        <p className="text-lg mb-8">
          Current theme: <span className="font-bold">{theme}</span>
        </p>
      </SlideUp>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <ScaleIn delay={0.2}>
          <div className="p-6 bg-surface-1 rounded-lg">
            <h2 className="text-2xl font-heading mb-4">Font Test</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-1">Body Text (--font-body)</h3>
                <p className="font-sans">
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Heading Text (--font-heading)</h3>
                <p className="font-heading">
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Monospace Text (--font-mono)</h3>
                <p className="font-mono">
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Display Text (--font-display)</h3>
                <p className="font-display">
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Terminal Text (--font-terminal)</h3>
                <p className="font-terminal">
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
              </div>
            </div>
          </div>
        </ScaleIn>
        
        <ScaleIn delay={0.3}>
          <div className="p-6 bg-surface-1 rounded-lg">
            <h2 className="text-2xl font-heading mb-4">Basic Animations</h2>
            
            <AnimatedList staggerDelay={0.1}>
              <div className="p-3 bg-surface-0 rounded mb-2">Fade In</div>
              <div className="p-3 bg-surface-0 rounded mb-2">Slide Up</div>
              <div className="p-3 bg-surface-0 rounded mb-2">Scale In</div>
              <div className="p-3 bg-surface-0 rounded mb-2">Staggered List</div>
              <div className="p-3 bg-surface-0 rounded mb-2">Interactive Elements</div>
            </AnimatedList>
          </div>
        </ScaleIn>
        
        <ScaleIn delay={0.4}>
          <div className="p-6 bg-surface-1 rounded-lg">
            <h2 className="text-2xl font-heading mb-4">Theme-Specific</h2>
            
            <div className="space-y-4">
              {theme === 'hackers' && (
                <ThemeAnimation type="neonPulse" className="p-4 bg-surface-0/50 border border-accent/50 rounded-lg">
                  <p className="text-shadow-glow text-center">
                    Hackers Theme Special Effect
                  </p>
                </ThemeAnimation>
              )}
              
              {theme === 'dystopia' && (
                <ThemeAnimation type="terminalFlicker" className="p-4 bg-surface-0/50 border border-text-primary/30 rounded-lg terminal-scanlines">
                  <p className="font-mono text-center cursor-blink">
                    Dystopia Theme Special Effect
                  </p>
                </ThemeAnimation>
              )}
              
              {theme === 'neotopia' && (
                <ThemeAnimation type="paperFold" className="p-4 bg-surface-0/50 border border-border-subtle rounded-lg paper-texture">
                  <p className="font-serif text-center">
                    Neotopia Theme Special Effect
                  </p>
                </ThemeAnimation>
              )}
            </div>
          </div>
        </ScaleIn>
      </div>
      
      <div className="flex justify-center mt-10">
        <AnimatedButton 
          onClick={toggleTheme}
          className="px-6 py-3 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover active:bg-accent-active transition-colors"
        >
          Toggle Theme
        </AnimatedButton>
      </div>
    </div>
  );
}