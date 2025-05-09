'use client';

import { useAudio } from './useAudio';
import { useUserPreferencesContext } from '@/Settings/providers/UserPreferencesProvider';
import { useEffect } from 'react';

/**
 * Enhanced audio hook that integrates with the user preferences system.
 * This automatically applies the user's volume setting and respects their audio enabled preference.
 */
export function useUserAudio() {
  const { audioEnabled, volume, setAudioEnabled, setVolume } = useUserPreferencesContext();
  const audioHook = useAudio(audioEnabled);
  
  // Apply volume setting to audio system
  useEffect(() => {
    audioHook.setVolume(volume);
  }, [volume, audioHook.setVolume]);
  
  // Enhanced play function that respects the user's audio preference
  const play = (type: Parameters<typeof audioHook.play>[0]) => {
    if (audioEnabled) {
      audioHook.play(type);
    }
  };
  
  return {
    ...audioHook,
    play,
    // Add preference-aware toggles
    toggleAudio: () => setAudioEnabled(!audioEnabled),
    setAudioEnabled,
    setVolume,
    volume,
    enabled: audioEnabled
  };
}