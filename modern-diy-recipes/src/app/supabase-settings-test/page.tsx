'use client';

import React, { useEffect, useState } from 'react';
import { useUserPreferencesContext } from '@/Settings/providers/UserPreferencesProvider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function SupabaseSettingsTest() {
  const { preferences, updatePreferences, loading } = useUserPreferencesContext();
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [dbPreferences, setDbPreferences] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  // Run test to verify preferences are being stored in Supabase
  const runTest = async () => {
    setTestStatus('testing');
    
    try {
      // Test 1: Make a change to preferences
      const newTheme = preferences.theme === 'hackers' ? 'dystopia' : 'hackers';
      await updatePreferences({ theme: newTheme });
      
      // Test 2: Check if preferences are saved to Supabase
      if (isAuthenticated && user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          throw new Error(`Error fetching preferences from Supabase: ${error.message}`);
        }
        
        setDbPreferences(data);
        
        // Test 3: Verify the data matches
        const testResults = {
          dbPreferencesMatch: data.theme === newTheme,
          preferencesUpdated: preferences.theme === newTheme,
          isAuthenticated,
          authInfo: user ? { id: user.id, email: user.email } : null,
          storageTheme: localStorage.getItem('theme'),
          storageAudioEnabled: localStorage.getItem('audioEnabled'),
          success: data.theme === newTheme && preferences.theme === newTheme,
        };
        
        setTestResults(testResults);
        setTestStatus(testResults.success ? 'success' : 'error');
      } else {
        // For non-authenticated users, just check localStorage
        const testResults = {
          isAuthenticated: false,
          preferencesUpdated: preferences.theme === newTheme,
          storageTheme: localStorage.getItem('theme'),
          storageAudioEnabled: localStorage.getItem('audioEnabled'),
          success: preferences.theme === newTheme && localStorage.getItem('theme') === newTheme,
        };
        
        setTestResults(testResults);
        setTestStatus(testResults.success ? 'success' : 'error');
      }
    } catch (err) {
      console.error('Test error:', err);
      setTestStatus('error');
      setTestResults({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  };
  
  // Check theme styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const docTheme = document.documentElement.getAttribute('data-theme');
      const hasThemeClass = document.documentElement.classList.contains(preferences.theme);
      
      console.log('Document theme:', docTheme);
      console.log('Has theme class:', hasThemeClass);
    }
  }, [preferences.theme]);
  
  if (loading) {
    return <div className="p-8">Loading preferences...</div>;
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Settings Test</h1>
      
      <div className="bg-surface-1 border rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Preferences</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Theme:</span>
            <span className="ml-2">{preferences.theme}</span>
          </div>
          <div>
            <span className="font-medium">Audio Enabled:</span>
            <span className="ml-2">{preferences.audioEnabled ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="font-medium">Volume:</span>
            <span className="ml-2">{preferences.volume}</span>
          </div>
          <div>
            <span className="font-medium">Display Name:</span>
            <span className="ml-2">{preferences.display_name || 'Not set'}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => updatePreferences({ theme: 'hackers' })}
            className={`p-3 rounded border ${preferences.theme === 'hackers' ? 'bg-accent/20 border-accent' : 'bg-surface-1'}`}
          >
            Hackers Theme
          </button>
          <button 
            onClick={() => updatePreferences({ theme: 'dystopia' })}
            className={`p-3 rounded border ${preferences.theme === 'dystopia' ? 'bg-accent/20 border-accent' : 'bg-surface-1'}`}
          >
            Dystopia Theme
          </button>
          <button 
            onClick={() => updatePreferences({ theme: 'neotopia' })}
            className={`p-3 rounded border ${preferences.theme === 'neotopia' ? 'bg-accent/20 border-accent' : 'bg-surface-1'}`}
          >
            Neotopia Theme
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => updatePreferences({ audio_enabled: !preferences.audioEnabled })}
            className={`p-3 rounded border ${preferences.audioEnabled ? 'bg-accent/20 border-accent' : 'bg-surface-1'}`}
          >
            {preferences.audioEnabled ? 'Disable Audio' : 'Enable Audio'}
          </button>
          
          <button 
            onClick={() => updatePreferences({ volume: Math.min(1, preferences.volume + 0.1) })}
            className="p-3 rounded border bg-surface-1"
            disabled={preferences.volume >= 1}
          >
            Volume Up
          </button>
          
          <button 
            onClick={() => updatePreferences({ volume: Math.max(0, preferences.volume - 0.1) })}
            className="p-3 rounded border bg-surface-1"
            disabled={preferences.volume <= 0}
          >
            Volume Down
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={runTest}
          className="px-6 py-3 rounded bg-accent text-text-inverse"
          disabled={testStatus === 'testing'}
        >
          {testStatus === 'testing' ? 'Running Test...' : 'Run Supabase Storage Test'}
        </button>
        
        {testResults && (
          <div className={`border rounded p-4 ${testStatus === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <h2 className="text-lg font-semibold mb-2">
              Test Results: {testStatus === 'success' ? 'Success' : 'Failed'}
            </h2>
            <pre className="bg-surface-1 p-3 rounded overflow-auto max-h-60 text-xs">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
        
        {dbPreferences && (
          <div className="border border-blue-500 rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Database Preferences</h2>
            <pre className="bg-surface-1 p-3 rounded overflow-auto max-h-60 text-xs">
              {JSON.stringify(dbPreferences, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <a href="/settings" className="text-accent hover:underline">
          Go to Settings Page →
        </a>
      </div>
    </div>
  );
}