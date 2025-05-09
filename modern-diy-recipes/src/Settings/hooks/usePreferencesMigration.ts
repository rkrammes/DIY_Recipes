import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

/**
 * Hook to migrate user preferences from localStorage to Supabase
 * This only runs once when a user logs in and doesn't have preferences in Supabase yet
 */
export function usePreferencesMigration() {
  const { user, isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    // Skip if not authenticated or still loading auth state
    if (!isAuthenticated || loading || !user) return;
    
    const migratePreferences = async () => {
      try {
        // Check if user already has preferences in Supabase
        const { data, error } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If there's an error or user already has preferences, skip migration
        if (error || data) return;
        
        console.log('No preferences found in Supabase, migrating from localStorage...');
        
        // Get preferences from localStorage
        const theme = localStorage.getItem('theme');
        const audioEnabled = localStorage.getItem('audioEnabled');
        const volume = localStorage.getItem('volume');
        
        // Skip if no localStorage preferences
        if (!theme && !audioEnabled && !volume) return;
        
        // Create preferences in Supabase
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id,
            theme: theme || 'hackers',
            audio_enabled: audioEnabled === 'true',
            volume: volume ? parseFloat(volume) : 0.7,
            // Migrate user metadata if available
            display_name: user.user_metadata?.name,
            avatar: user.user_metadata?.avatar,
            color: user.user_metadata?.color,
          }]);
        
        if (insertError) {
          console.error('Error migrating preferences to Supabase:', insertError);
        } else {
          console.log('Successfully migrated preferences to Supabase');
        }
      } catch (err) {
        console.error('Error in preferences migration:', err);
      }
    };
    
    migratePreferences();
  }, [isAuthenticated, user, loading]);
}