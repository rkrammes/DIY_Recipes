import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Define the preferences type
export interface UserPreferences {
  // Theme preferences
  theme: 'hackers' | 'dystopia' | 'neotopia';
  audio_enabled: boolean;
  volume: number;
  
  // User preferences
  default_view: string;
  avatar?: string;
  display_name?: string;
  color?: string;
  
  // Developer options
  debug_mode: boolean;
  show_experimental: boolean;
}

// Default preferences as fallback
const defaultPreferences: UserPreferences = {
  theme: 'hackers',
  audio_enabled: false,
  volume: 0.7,
  default_view: 'formulations',
  debug_mode: false,
  show_experimental: false,
};

export function useUserPreferences() {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user preferences from Supabase
  const fetchPreferences = async () => {
    if (!user) {
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching preferences:', error);
        throw new Error(error.message);
      }

      // Merge with defaults in case some fields are missing
      setPreferences({
        ...defaultPreferences,
        ...data,
      });
    } catch (err) {
      console.error('Error in fetchPreferences:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching preferences'));
      
      // Fall back to defaults & localStorage
      const localTheme = localStorage.getItem('theme');
      const localAudio = localStorage.getItem('audioEnabled');
      
      setPreferences({
        ...defaultPreferences,
        theme: (localTheme as any) || defaultPreferences.theme,
        audio_enabled: localAudio === 'true',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences in Supabase
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) {
      // Store in localStorage for non-authenticated users
      if (updates.theme) localStorage.setItem('theme', updates.theme);
      if (updates.audio_enabled !== undefined) localStorage.setItem('audioEnabled', String(updates.audio_enabled));
      
      // Update local state
      setPreferences(prev => ({ ...prev, ...updates }));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First check if a preference record exists
      const { data: existingData, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking preferences:', checkError);
        throw new Error(checkError.message);
      }

      // If record doesn't exist, create it
      if (!existingData) {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([{ user_id: user.id, ...updates }]);

        if (insertError) {
          console.error('Error creating preferences:', insertError);
          throw new Error(insertError.message);
        }
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating preferences:', updateError);
          throw new Error(updateError.message);
        }
      }

      // Update local state
      setPreferences(prev => ({ ...prev, ...updates }));
      
      // Also update localStorage for better offline experience
      if (updates.theme) localStorage.setItem('theme', updates.theme);
      if (updates.audio_enabled !== undefined) localStorage.setItem('audioEnabled', String(updates.audio_enabled));
    } catch (err) {
      console.error('Error in updatePreferences:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating preferences'));
      
      // Still update local state even if server update fails
      setPreferences(prev => ({ ...prev, ...updates }));
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for preference updates
  useEffect(() => {
    if (!user) return;

    fetchPreferences();

    // Set up a subscription for real-time updates
    const subscription = supabase
      .channel(`preferences-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Preferences changed:', payload);
          fetchPreferences();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, isAuthenticated]);

  return {
    preferences,
    updatePreferences,
    loading,
    error,
    // Convenience getters for common preferences
    theme: preferences.theme,
    audioEnabled: preferences.audio_enabled,
    volume: preferences.volume,
    debugMode: preferences.debug_mode,
    // Setters for common preferences
    setTheme: (theme: 'hackers' | 'dystopia' | 'neotopia') => updatePreferences({ theme }),
    setAudioEnabled: (enabled: boolean) => updatePreferences({ audio_enabled: enabled }),
    setVolume: (volume: number) => updatePreferences({ volume }),
    toggleTheme: () => {
      const themes: Array<'hackers' | 'dystopia' | 'neotopia'> = ['hackers', 'dystopia', 'neotopia'];
      const currentIndex = themes.indexOf(preferences.theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      updatePreferences({ theme: nextTheme });
    }
  };
}