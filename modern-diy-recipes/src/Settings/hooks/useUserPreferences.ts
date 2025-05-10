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
  const [supabaseAvailable, setSupabaseAvailable] = useState<boolean>(true);

  // Check for locally stored preferences
  const getLocalPreferences = () => {
    try {
      const localTheme = localStorage.getItem('theme');
      const localAudio = localStorage.getItem('audioEnabled');
      
      return {
        ...defaultPreferences,
        theme: (localTheme as 'hackers' | 'dystopia' | 'neotopia') || defaultPreferences.theme,
        audio_enabled: localAudio === 'true',
      };
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      return defaultPreferences;
    }
  };
  
  // Fetch user preferences from Supabase
  const fetchPreferences = async () => {
    // If no user or Supabase is unavailable, use localStorage
    if (!user || !supabaseAvailable) {
      setPreferences(getLocalPreferences());
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
        // Display the error but don't throw, allow fallback to localStorage
        console.error('Error fetching preferences from Supabase:', error);
        setError(new Error(`Supabase error: ${error.message}`));
        setSupabaseAvailable(false);
        
        // Fall back to localStorage
        setPreferences(getLocalPreferences());
        return;
      }

      // If we got data from Supabase, use it
      setPreferences({
        ...defaultPreferences,
        ...data,
      });
    } catch (err) {
      console.error('Error in fetchPreferences:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching preferences'));
      setSupabaseAvailable(false);
      
      // Fall back to localStorage
      setPreferences(getLocalPreferences());
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    // Always update localStorage
    try {
      if (updates.theme) localStorage.setItem('theme', updates.theme);
      if (updates.audio_enabled !== undefined) localStorage.setItem('audioEnabled', String(updates.audio_enabled));
    } catch (err) {
      console.error('Error updating localStorage:', err);
    }
    
    // Update local state immediately
    setPreferences(prev => ({ ...prev, ...updates }));
    
    // Skip Supabase if no user or Supabase is unavailable
    if (!user || !supabaseAvailable) {
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
        setError(new Error(`Supabase error: ${checkError.message}`));
        setSupabaseAvailable(false);
        return;
      }

      // If record doesn't exist, create it
      if (!existingData) {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([{ user_id: user.id, ...updates }]);

        if (insertError) {
          console.error('Error creating preferences:', insertError);
          setError(new Error(`Supabase error: ${insertError.message}`));
          setSupabaseAvailable(false);
          return;
        }
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating preferences:', updateError);
          setError(new Error(`Supabase error: ${updateError.message}`));
          setSupabaseAvailable(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error in updatePreferences:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating preferences'));
      setSupabaseAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  // Set up initial preferences and Supabase subscription
  useEffect(() => {
    // Initialize preferences from localStorage immediately
    setPreferences(getLocalPreferences());
    setLoading(false);

    if (!user) return;

    // Try to fetch from Supabase
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
    supabaseAvailable,
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