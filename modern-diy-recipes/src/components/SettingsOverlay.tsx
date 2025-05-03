'use client';

import React, { useCallback } from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

export function SettingsOverlay() {
  const { theme, setTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { playSound } = useAudio(audioEnabled);

  const handleThemeChange = useCallback((newTheme: 'synthwave-noir' | 'terminal-mono' | 'paper-ledger') => {
    console.log('Theme change:', newTheme, 'Audio enabled:', audioEnabled);
    setTheme(newTheme);
    if (audioEnabled) {
      console.log('Playing theme change sound...');
      playSound('modalOpen', newTheme);
    }
  }, [setTheme, audioEnabled, playSound]);

  const handleAudioToggle = useCallback(() => {
    const newState = !audioEnabled;
    console.log('Toggling audio:', newState);
    setAudioEnabled(newState);
    localStorage.setItem('audioEnabled', newState.toString());
    
    if (newState) {
      console.log('Playing test sound...');
      // Small delay to ensure audio context is initialized
      setTimeout(() => {
        playSound('success', theme);
      }, 100);
    }
  }, [audioEnabled, setAudioEnabled, theme, playSound]);

  return (
    <motion.div
      className="p-4 rounded-lg bg-surface-1/80 backdrop-blur"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-bold mb-4">Settings</h2>
      
      <div className="space-y-4">
        {/* Theme Selection */}
        <div>
          <h3 className="text-sm font-medium mb-2">Theme</h3>
          <div className="space-y-2">
            <motion.button
              onClick={() => handleThemeChange('synthwave-noir')}
              className={`w-full px-4 py-2 rounded transition-all ${
                theme === 'synthwave-noir'
                  ? 'bg-accent text-surface-0'
                  : 'bg-surface-2/50 hover:bg-surface-2'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => audioEnabled && playSound('hover', theme)}
            >
              Switch to Synthwave Noir
            </motion.button>
            <motion.button
              onClick={() => handleThemeChange('terminal-mono')}
              className={`w-full px-4 py-2 rounded transition-all ${
                theme === 'terminal-mono'
                  ? 'bg-accent text-surface-0'
                  : 'bg-surface-2/50 hover:bg-surface-2'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => audioEnabled && playSound('hover', theme)}
            >
              Switch to Terminal Mono
            </motion.button>
            <motion.button
              onClick={() => handleThemeChange('paper-ledger')}
              className={`w-full px-4 py-2 rounded transition-all ${
                theme === 'paper-ledger'
                  ? 'bg-accent text-surface-0'
                  : 'bg-surface-2/50 hover:bg-surface-2'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => audioEnabled && playSound('hover', theme)}
            >
              Switch to Paper Ledger
            </motion.button>
          </div>
        </div>

        {/* Audio Toggle */}
        <div>
          <h3 className="text-sm font-medium mb-2">Audio</h3>
          <motion.button
            onClick={handleAudioToggle}
            className={`w-full px-4 py-2 rounded transition-all ${
              audioEnabled
                ? 'bg-accent text-surface-0'
                : 'bg-surface-2/50 hover:bg-surface-2'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {audioEnabled ? 'Sound Effects: On' : 'Sound Effects: Off'}
          </motion.button>
          <p className="text-xs text-text-secondary mt-1">
            {audioEnabled
              ? 'Click anywhere to initialize audio'
              : 'Enable for interactive sound effects'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}