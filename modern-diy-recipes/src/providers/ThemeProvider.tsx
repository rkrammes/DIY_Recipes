'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateAnimationCSSVars } from '../lib/animation/motion';
import { getAudioContext, getThemeAudioParams } from '../lib/audio/core';

type Theme = 'synthwave-noir' | 'terminal-mono' | 'paper-ledger';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>('synthwave-noir');
  const [audioEnabled, setAudioEnabled] = useState(false); // Default to false
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedAudio = localStorage.getItem('audioEnabled');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme && ['synthwave-noir', 'terminal-mono', 'paper-ledger'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('synthwave-noir');
    } else {
      setTheme('paper-ledger');
    }

    // Initialize audio state from localStorage
    if (savedAudio !== null) {
      console.log('Loading saved audio state:', savedAudio);
      setAudioEnabled(savedAudio === 'true');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = localStorage.getItem('theme');
      if (!currentTheme) {
        setTheme(mediaQuery.matches ? 'synthwave-noir' : 'paper-ledger');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update document theme attribute and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Apply animation CSS variables
    const animationVars = generateAnimationCSSVars(theme);
    Object.entries(animationVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Play theme change sound if audio is enabled and initialized
    if (audioEnabled && audioInitialized && document.readyState === 'complete') {
      console.log('Playing theme change sound');
      try {
        const audioContext = getAudioContext();
        console.log('AudioContext state:', audioContext.state);

        if (audioContext.state === 'suspended') {
          console.log('Resuming AudioContext...');
          audioContext.resume();
        }

        const params = getThemeAudioParams(theme);
        
        // Create and configure oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(params.ui.modalOpen.frequency as number, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        console.log('Starting oscillator...');
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);

        // Clean up
        setTimeout(() => {
          oscillator.disconnect();
          gainNode.disconnect();
        }, 300);
      } catch (error) {
        console.error('Error playing theme change sound:', error);
      }
    }
  }, [theme, audioEnabled, audioInitialized]);

  // Initialize audio context on first user interaction
  useEffect(() => {
    if (!audioEnabled) return;

    const initAudio = () => {
      if (!audioInitialized) {
        try {
          console.log('Initializing audio context...');
          getAudioContext();
          setAudioInitialized(true);
        } catch (error) {
          console.error('Failed to initialize audio context:', error);
        }
      }
    };

    // Initialize on first user interaction
    const handleInteraction = () => {
      initAudio();
      // Keep the listeners for subsequent interactions that might be needed
      // to resume suspended audio context
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [audioEnabled, audioInitialized]);

  // Setup keyboard shortcut for theme cycling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        const themes: Theme[] = ['synthwave-noir', 'terminal-mono', 'paper-ledger'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['synthwave-noir', 'terminal-mono', 'paper-ledger'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      audioEnabled,
      setAudioEnabled
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export the Theme type for use in other components
export type { Theme };