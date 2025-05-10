'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserPreferences, UserPreferences } from '../hooks/useUserPreferences';
import { usePreferencesMigration } from '../hooks/usePreferencesMigration';
import { createSafeProvider } from '@/lib/safe-provider';

// Define the context type
interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  loading: boolean;
  error: Error | null;
  supabaseAvailable: boolean;
  // Convenience getters
  theme: 'hackers' | 'dystopia' | 'neotopia';
  audioEnabled: boolean;
  volume: number;
  debugMode: boolean;
  // Convenience setters
  setTheme: (theme: 'hackers' | 'dystopia' | 'neotopia') => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleTheme: () => void;
}

// Create a safe provider using the same pattern as other providers
const { Provider, useValue } = createSafeProvider<UserPreferencesContextType>(
  {
    preferences: {
      theme: 'hackers',
      audio_enabled: false,
      volume: 0.7,
      default_view: 'formulations',
      debug_mode: false,
      show_experimental: false,
    },
    updatePreferences: async () => {},
    loading: true,
    error: null,
    supabaseAvailable: true,
    theme: 'hackers',
    audioEnabled: false,
    volume: 0.7,
    debugMode: false,
    setTheme: () => {},
    setAudioEnabled: () => {},
    setVolume: () => {},
    toggleTheme: () => {},
  },
  'UserPreferences'
);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const preferencesData = useUserPreferences();
  
  // Run the migration from localStorage to Supabase for authenticated users
  usePreferencesMigration();
  
  // Effect to sync with document attributes when theme changes
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !preferencesData.loading) {
      // Set data-theme attribute for CSS
      document.documentElement.setAttribute('data-theme', preferencesData.theme);
      
      // Update theme class for easier CSS targeting
      document.documentElement.classList.remove('hackers', 'dystopia', 'neotopia');
      document.documentElement.classList.add(preferencesData.theme);
    }
  }, [preferencesData.theme, preferencesData.loading]);

  return <Provider value={preferencesData}>{children}</Provider>;
}

// Export the hook to use the context
export function useUserPreferencesContext() {
  const { value } = useValue();
  return value;
}