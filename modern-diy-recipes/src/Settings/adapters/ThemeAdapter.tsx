'use client';

import React, { useEffect } from 'react';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useAudio } from '@/hooks/useAudio';

/**
 * ThemeAdapter bridges the gap between the new user preferences system and the old theme system.
 * It syncs theme and audio settings both ways until full migration can be completed.
 */
export function ThemeAdapter({ children }: { children: React.ReactNode }) {
  const { value: oldThemeContext } = useTheme();
  const preferences = useUserPreferencesContext();
  const { setVolume } = useAudio(preferences.audioEnabled);
  
  // Sync from old theme system to new preferences system
  useEffect(() => {
    if (oldThemeContext && !preferences.loading) {
      // Only sync if values differ to avoid circular updates
      if (oldThemeContext.theme !== preferences.theme) {
        preferences.setTheme(oldThemeContext.theme as any);
      }
      
      if (oldThemeContext.audioEnabled !== preferences.audioEnabled) {
        preferences.setAudioEnabled(oldThemeContext.audioEnabled);
      }
    }
  }, [oldThemeContext?.theme, oldThemeContext?.audioEnabled]);
  
  // Sync from new preferences system to old theme system
  useEffect(() => {
    if (oldThemeContext && !preferences.loading) {
      // Only sync if values differ to avoid circular updates
      if (oldThemeContext.theme !== preferences.theme && oldThemeContext.setTheme) {
        oldThemeContext.setTheme(preferences.theme);
      }
      
      if (oldThemeContext.audioEnabled !== preferences.audioEnabled && oldThemeContext.setAudioEnabled) {
        oldThemeContext.setAudioEnabled(preferences.audioEnabled);
      }
    }
  }, [preferences.theme, preferences.audioEnabled]);
  
  // Apply volume setting to audio system
  useEffect(() => {
    if (!preferences.loading) {
      setVolume(preferences.volume);
    }
  }, [preferences.volume, setVolume]);
  
  // Apply theme to document for CSS styling
  useEffect(() => {
    if (typeof document !== 'undefined' && !preferences.loading) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
      document.documentElement.classList.remove('hackers', 'dystopia', 'neotopia');
      document.documentElement.classList.add(preferences.theme);
    }
  }, [preferences.theme, preferences.loading]);
  
  return <>{children}</>;
}