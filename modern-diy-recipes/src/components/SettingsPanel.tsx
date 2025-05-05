'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../providers/ConsolidatedThemeProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Define available themes with their display names
const THEME_NAMES = {
  'hackers': 'Hackers Terminal',
  'dystopia': 'Dystopian Noir',
  'neotopia': 'Neotopia Light'
};

export default function SettingsPanel() {
  const { user, loading, error, signInWithMagicLink, signOut } = useAuth();
  const { value: themeContext } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle magic link login
  const handleMagicLink = async () => {
    try {
      const email = prompt('Enter your email for magic link login:');
      if (email) {
        await signInWithMagicLink(email);
      }
    } catch (error) {
      console.error('Error with magic link:', error);
    }
  };
  
  // Get the next theme in rotation
  const getNextThemeName = (currentTheme: string) => {
    const themes = Object.keys(THEME_NAMES);
    const currentIndex = themes.indexOf(currentTheme);
    if (currentIndex === -1) return THEME_NAMES['hackers']; // Default fallback
    
    const nextIndex = (currentIndex + 1) % themes.length;
    return THEME_NAMES[themes[nextIndex] as keyof typeof THEME_NAMES];
  };
  
  // Don't render until mounted to prevent hydration issues
  if (!mounted || !themeContext) {
    return (
      <aside className="w-full sm:w-64 md:w-72 border-l border-subtle p-4 md:p-6 flex flex-col gap-6 h-full overflow-y-auto bg-surface text-text">
        <div className="animate-pulse h-6 w-32 bg-surface-2 rounded mb-4"></div>
        <div className="animate-pulse h-32 w-full bg-surface-2 rounded"></div>
      </aside>
    );
  }
  
  return (
    <aside className="w-full sm:w-64 md:w-72 border-l border-subtle p-4 md:p-6 flex flex-col gap-6 h-full overflow-y-auto bg-surface text-text">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* Simplified settings panel with just theme and audio controls */}
      <section>
        <h3 className="font-semibold mb-3">Theme</h3>
        <Button
          variant="outline"
          onClick={() => themeContext.toggleTheme?.()}
          className="w-full justify-center border-subtle hover:bg-surface-1 mb-2"
        >
          Switch to {getNextThemeName(themeContext.theme)}
        </Button>
        
        <Button
          variant={themeContext.audioEnabled ? "default" : "outline"}
          onClick={() => themeContext.setAudioEnabled?.(!themeContext.audioEnabled)}
          className={`w-full justify-center mt-4 ${
            themeContext.audioEnabled 
              ? "bg-accent text-text-inverse hover:bg-accent-hover" 
              : "border-subtle hover:bg-surface-1"
          }`}
        >
          Sound Effects: {themeContext.audioEnabled ? "On" : "Off"}
        </Button>
      </section>
    </aside>
  );
}