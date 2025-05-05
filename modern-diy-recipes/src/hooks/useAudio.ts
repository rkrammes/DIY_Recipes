import { useEffect, useCallback, useRef, useState } from 'react';
import { getAudioContext, getThemeAudioParams, applyEnvelope, setMasterVolume } from '../lib/audio/core';

// Define here to avoid circular dependency with ThemeProvider
export type Theme = 'hackers' | 'dystopia' | 'neotopia';

export type SoundType = 'hover' | 'click' | 'modalOpen' | 'close' | 'success' | 'error' | 'select' | 'delete' | 'notification';

export function useAudio(enabled: boolean = true) {
  // For SSR safety
  const [mounted, setMounted] = useState(false);
  const audioInitialized = useRef(false);
  const userInteracted = useRef(false);
  const volume = useRef(0.7); // Default volume level
  
  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to play a sound effect
  const playSound = useCallback((type: SoundType, theme: Theme = 'hackers') => {
    // Only allow sound in browser context after user interaction
    if (!mounted || typeof window === 'undefined' || !enabled || !userInteracted.current) {
      return;
    }

    try {
      // Initialize audio if needed
      if (!audioInitialized.current) {
        console.log('Audio not initialized yet, initializing...');
        try {
          getAudioContext();
          audioInitialized.current = true;
        } catch (initError) {
          console.error('Failed to initialize audio context:', initError);
          return; // Exit if init fails
        }
      }

      // Get audio context
      const audioContext = getAudioContext();
      if (!audioContext) {
        console.error('AudioContext not available');
        return;
      }

      // Try to resume if suspended
      if (audioContext.state === 'suspended') {
        console.log('Resuming AudioContext...');
        try {
          audioContext.resume().catch(err => {
            console.warn('Could not resume AudioContext:', err);
            return; // Exit if resume fails
          });
        } catch (resumeError) {
          console.error('Failed to resume audio context:', resumeError);
          return;
        }
      }

      // Get theme parameters
      try {
        const params = getThemeAudioParams(theme);
        if (!params || !params.ui) {
          console.error('Invalid audio parameters for theme:', theme);
          return;
        }
        
        // Check if the sound type exists in the theme parameters
        // If not, use a fallback sound (hover)
        const soundType = params.ui[type] ? type : 'hover';
        const soundParams = params.ui[soundType];
        
        if (!soundParams) {
          console.error('Sound parameters not found for type:', soundType);
          return;
        }

        // Create audio nodes
        try {
          // Create nodes
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          // Add a filter for some sound types
          let filterNode;
          if (['error', 'success', 'notification'].includes(type)) {
            filterNode = audioContext.createBiquadFilter();
            filterNode.type = 'lowpass';
            filterNode.frequency.value = type === 'error' ? 800 : 1500;
            filterNode.Q.value = 1.0;
          }

          // Configure oscillator type with fallback
          oscillator.type = soundParams.type || 'sine';
          
          // Handle multiple frequencies (for arpeggios in success/error)
          try {
            if (Array.isArray(soundParams.frequency)) {
              if (['success', 'notification'].includes(type)) {
                // Create an arpeggio effect for success and notification
                const frequencies = soundParams.frequency;
                const noteDuration = soundParams.duration / frequencies.length;
                
                frequencies.forEach((freq, index) => {
                  oscillator.frequency.setValueAtTime(
                    freq, 
                    audioContext.currentTime + (index * noteDuration)
                  );
                });
              } else {
                // For other sounds with frequency arrays, just use the first one
                oscillator.frequency.setValueAtTime(soundParams.frequency[0], audioContext.currentTime);
              }
            } else {
              oscillator.frequency.setValueAtTime(soundParams.frequency || 440, audioContext.currentTime);
            }
          } catch (freqError) {
            console.error('Error setting frequency:', freqError);
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Fallback
          }

          // Apply envelope
          try {
            if (soundParams.envelope) {
              applyEnvelope(gainNode, soundParams.envelope, soundParams.duration);
            } else {
              // Simple fallback envelope
              gainNode.gain.setValueAtTime(0, audioContext.currentTime);
              gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
              gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + soundParams.duration);
            }
          } catch (envelopeError) {
            console.error('Error applying envelope:', envelopeError);
            // Simplest fallback
            gainNode.gain.value = 0.1;
          }

          // Connect nodes
          try {
            if (filterNode) {
              oscillator.connect(filterNode);
              filterNode.connect(gainNode);
            } else {
              oscillator.connect(gainNode);
            }
            gainNode.connect(audioContext.destination);
          } catch (connectionError) {
            console.error('Error connecting audio nodes:', connectionError);
            return; // Cannot proceed if connections fail
          }

          // Start and stop oscillator
          try {
            oscillator.start();
            oscillator.stop(audioContext.currentTime + (soundParams.duration || 0.3));
          } catch (playError) {
            console.error('Error starting oscillator:', playError);
            return;
          }

          // Clean up
          const cleanup = () => {
            try {
              oscillator.disconnect();
              gainNode.disconnect();
              if (filterNode) filterNode.disconnect();
            } catch (cleanupError) {
              console.warn('Error during audio cleanup:', cleanupError);
            }
          };

          setTimeout(cleanup, (soundParams.duration || 0.3) * 1000 + 100);
        } catch (nodeError) {
          console.error('Error creating audio nodes:', nodeError);
        }
      } catch (paramsError) {
        console.error('Error getting theme audio parameters:', paramsError);
      }
    } catch (error) {
      console.error('Unexpected error playing sound:', error);
    }
  }, [enabled, mounted]);

  // Simple sounds mapped to the main playSound function
  const play = useCallback((type: SoundType) => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      // Get the current theme from data-theme attribute
      const theme = document.documentElement.getAttribute('data-theme') as Theme || 'hackers';
      playSound(type, theme);
    } catch (error) {
      console.error('Error in play function:', error);
    }
  }, [playSound, mounted]);

  // Set volume level (0-1)
  const setVolume = useCallback((level: number) => {
    if (level >= 0 && level <= 1) {
      volume.current = level;
      setMasterVolume(level);
    }
  }, []);

  // Initialize audio context on first interaction
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !enabled) return;

    const initAudio = () => {
      try {
        if (!audioInitialized.current) {
          console.log('Initializing audio context from user interaction...');
          const context = getAudioContext();
          if (context) {
            audioInitialized.current = true;
            console.log('Audio context initialized, state:', context.state);
            
            try {
              setMasterVolume(volume.current);
              console.log('Master volume set to:', volume.current);
            } catch (volumeError) {
              console.warn('Could not set master volume:', volumeError);
            }
          } else {
            console.warn('Could not create audio context');
          }
        }
        userInteracted.current = true;
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    // Initialize on first user interaction
    const handleInteraction = () => {
      if (!userInteracted.current) {
        console.log('User interaction detected, initializing audio...');
      }
      initAudio();
    };

    console.log('Setting up audio interaction listeners');
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [enabled, mounted]);

  return { 
    playSound,  // Play a sound with explicit theme
    play,       // Play a sound using current theme
    setVolume,  // Set master volume
    isInitialized: audioInitialized.current
  };
}