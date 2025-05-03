import { useEffect, useCallback, useRef } from 'react';
import { getAudioContext, getThemeAudioParams } from '../lib/audio/core';
import { type Theme } from '../providers/ThemeProvider';

export function useAudio(enabled: boolean) {
  const audioInitialized = useRef(false);

  const playSound = useCallback((type: 'hover' | 'click' | 'modalOpen' | 'success' | 'error', theme: Theme) => {
    if (!enabled) return;

    try {
      console.log('Attempting to play sound:', type, 'for theme:', theme);
      
      if (!audioInitialized.current) {
        console.log('Audio not initialized yet, initializing...');
        getAudioContext();
        audioInitialized.current = true;
      }

      const audioContext = getAudioContext();
      console.log('AudioContext state:', audioContext.state);

      if (audioContext.state === 'suspended') {
        console.log('Resuming AudioContext...');
        audioContext.resume();
      }

      const params = getThemeAudioParams(theme);
      const soundParams = params.ui[type];

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configure oscillator
      oscillator.type = soundParams.type;
      if (Array.isArray(soundParams.frequency)) {
        // For sounds with multiple frequencies (like success/error)
        oscillator.frequency.setValueAtTime(soundParams.frequency[0], audioContext.currentTime);
      } else {
        oscillator.frequency.setValueAtTime(soundParams.frequency, audioContext.currentTime);
      }

      // Configure envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + soundParams.envelope.attack);
      gainNode.gain.linearRampToValueAtTime(
        soundParams.envelope.sustain,
        audioContext.currentTime + soundParams.envelope.attack + soundParams.envelope.decay
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        audioContext.currentTime + soundParams.duration
      );

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      console.log('Starting oscillator...');
      oscillator.start();
      oscillator.stop(audioContext.currentTime + soundParams.duration);

      // Clean up
      const cleanup = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };

      setTimeout(cleanup, soundParams.duration * 1000);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [enabled]);

  // Initialize audio context on first interaction
  useEffect(() => {
    if (!enabled) return;

    const initAudio = () => {
      try {
        if (!audioInitialized.current) {
          console.log('Initializing audio on user interaction...');
          getAudioContext();
          audioInitialized.current = true;
        }
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    // Initialize on first user interaction
    const handleInteraction = () => {
      initAudio();
      // Don't remove listeners yet - keep them for subsequent interactions
      // that might be needed to resume suspended audio context
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [enabled]);

  return { playSound };
}