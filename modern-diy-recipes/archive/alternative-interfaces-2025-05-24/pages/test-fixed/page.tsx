'use client';

import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { useAudio } from '../../providers/AudioProvider';

export default function TestFixedPage() {
  const { theme, setTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { playSound, isReady } = useAudio();

  const handleThemeChange = (newTheme: 'hackers' | 'dystopia' | 'neotopia') => {
    setTheme(newTheme);
    if (audioEnabled && isReady) {
      playSound('success');
    }
  };

  const handleAudioToggle = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Theme and Audio Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Theme: {theme}</h2>
        <div className="space-y-2">
          <button 
            onClick={() => handleThemeChange('hackers')}
            className={`px-4 py-2 rounded ${theme === 'hackers' ? 'bg-accent text-white' : 'bg-surface-2'}`}
          >
            Hackers Theme
          </button>
          <button 
            onClick={() => handleThemeChange('dystopia')}
            className={`block px-4 py-2 rounded ${theme === 'dystopia' ? 'bg-accent text-white' : 'bg-surface-2'}`}
          >
            Dystopia Theme
          </button>
          <button 
            onClick={() => handleThemeChange('neotopia')}
            className={`block px-4 py-2 rounded ${theme === 'neotopia' ? 'bg-accent text-white' : 'bg-surface-2'}`}
          >
            Neotopia Theme
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Audio Settings</h2>
        <button 
          onClick={handleAudioToggle}
          className={`px-4 py-2 rounded ${audioEnabled ? 'bg-accent text-white' : 'bg-surface-2'}`}
        >
          Audio: {audioEnabled ? 'Enabled' : 'Disabled'}
        </button>
        {audioEnabled && (
          <div className="mt-4">
            <button 
              onClick={() => isReady && playSound('success')}
              className="px-4 py-2 rounded bg-surface-2"
            >
              Play Success Sound
            </button>
            <button 
              onClick={() => isReady && playSound('error')}
              className="ml-2 px-4 py-2 rounded bg-surface-2"
            >
              Play Error Sound
            </button>
            <button 
              onClick={() => isReady && playSound('hover')}
              className="ml-2 px-4 py-2 rounded bg-surface-2"
            >
              Play Hover Sound
            </button>
          </div>
        )}
      </div>
    </div>
  );
}