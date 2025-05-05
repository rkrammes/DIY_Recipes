'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../providers/ConsolidatedThemeProvider';
import { useAudio } from '../providers/AudioProvider';
import { motion } from 'framer-motion';

// Define available themes
const AVAILABLE_THEMES = {
  'hackers': 'Hackers Terminal',
  'dystopia': 'Dystopian Noir',
  'neotopia': 'Neotopia Light'
};

export function SettingsOverlay() {
  // Use the safe provider value accessor
  const { value: themeContext } = useTheme();
  const { value: audioContext } = useAudio();
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle theme change with proper error handling
  const handleThemeChange = useCallback((newTheme: string) => {
    if (!themeContext || !themeContext.setTheme) return;
    
    try {
      themeContext.setTheme(newTheme);
      
      // Play sound if audio is enabled and ready
      if (
        themeContext.audioEnabled && 
        audioContext && 
        audioContext.isReady && 
        audioContext.playSound
      ) {
        audioContext.playSound('modalOpen');
      }
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  }, [themeContext, audioContext]);
  
  // Handle audio toggle with proper error handling
  const handleAudioToggle = useCallback(() => {
    if (!themeContext || !themeContext.setAudioEnabled) return;
    
    try {
      const newState = !themeContext.audioEnabled;
      themeContext.setAudioEnabled(newState);
      
      // Play test sound if enabled
      if (
        newState && 
        audioContext && 
        audioContext.isReady && 
        audioContext.playSound
      ) {
        setTimeout(() => {
          audioContext.playSound('success');
        }, 100);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  }, [themeContext, audioContext]);
  
  // Play hover sound if audio is enabled
  const handleHover = useCallback(() => {
    if (
      themeContext?.audioEnabled && 
      audioContext?.isReady && 
      audioContext?.playSound
    ) {
      audioContext.playSound('hover');
    }
  }, [themeContext, audioContext]);
  
  // Don't render until mounted to prevent hydration issues
  if (!mounted || !themeContext) {
    return (
      <div className="p-4 rounded-lg bg-surface-1/80 backdrop-blur">
        <div className="animate-pulse h-6 w-24 bg-surface-2 rounded mb-4"></div>
        <div className="animate-pulse h-32 w-full bg-surface-2 rounded"></div>
      </div>
    );
  }
  
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
            {Object.entries(AVAILABLE_THEMES).map(([themeKey, themeName]) => (
              <motion.button
                key={themeKey}
                onClick={() => handleThemeChange(themeKey)}
                className={`w-full px-4 py-2 rounded transition-all ${
                  themeContext.theme === themeKey
                    ? 'bg-accent text-surface-0'
                    : 'bg-surface-2/50 hover:bg-surface-2'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={handleHover}
              >
                {themeName} {themeKey === 'hackers' ? '💻' : themeKey === 'dystopia' ? '🔮' : '✨'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Audio Toggle */}
        <div>
          <h3 className="text-sm font-medium mb-2">Audio</h3>
          <motion.button
            onClick={handleAudioToggle}
            className={`w-full px-4 py-2 rounded transition-all ${
              themeContext.audioEnabled
                ? 'bg-accent text-surface-0'
                : 'bg-surface-2/50 hover:bg-surface-2'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {themeContext.audioEnabled ? 'Sound Effects: On' : 'Sound Effects: Off'}
          </motion.button>
          <p className="text-xs text-text-secondary mt-1">
            {themeContext.audioEnabled
              ? 'Click anywhere to initialize audio'
              : 'Enable for interactive sound effects'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}