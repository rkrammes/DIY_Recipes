'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createSafeProvider } from '../lib/mcp-safe-provider';
import { Theme } from '../types/theme';

// Audio context types
type SoundType = 
  | 'hover' 
  | 'click' 
  | 'modalOpen' 
  | 'close' 
  | 'success' 
  | 'error' 
  | 'select' 
  | 'delete' 
  | 'notification';

interface AudioContextType {
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  playSound: (type: SoundType) => void;
  isReady: boolean;
}

// AudioContext needs to be lazy initialized only in browser context
// Using refs within the component rather than module-level variables
// to ensure proper cleanup and isolation

// Theme-specific sound parameters
const themeSoundParams: Record<Theme, Record<string, any>> = {
  hackers: {
    hover: { frequency: 440, duration: 0.05, type: 'sine' },
    click: { frequency: 880, duration: 0.1, type: 'square' },
    modalOpen: { frequency: 660, duration: 0.3, type: 'triangle' },
    close: { frequency: 330, duration: 0.2, type: 'triangle' },
    success: { frequency: [523, 659, 784], duration: 0.5, type: 'sine' },
    error: { frequency: [494, 440, 392], duration: 0.5, type: 'sawtooth' },
    select: { frequency: 550, duration: 0.15, type: 'sine' },
    delete: { frequency: [587, 440], duration: 0.3, type: 'sawtooth' },
    notification: { frequency: [587, 698, 880], duration: 0.6, type: 'sine' }
  },
  dystopia: {
    hover: { frequency: 600, duration: 0.04, type: 'square' },
    click: { frequency: 900, duration: 0.08, type: 'square' },
    modalOpen: { frequency: 700, duration: 0.25, type: 'sawtooth' },
    close: { frequency: 400, duration: 0.15, type: 'square' },
    success: { frequency: [784, 988, 1175], duration: 0.4, type: 'square' },
    error: { frequency: [330, 294, 262], duration: 0.4, type: 'sawtooth' },
    select: { frequency: 800, duration: 0.1, type: 'square' },
    delete: { frequency: [700, 500], duration: 0.25, type: 'square' },
    notification: { frequency: [784, 880, 987], duration: 0.5, type: 'square' }
  },
  neotopia: {
    hover: { frequency: 523, duration: 0.05, type: 'sine' },
    click: { frequency: 1047, duration: 0.1, type: 'sine' },
    modalOpen: { frequency: 784, duration: 0.3, type: 'triangle' },
    close: { frequency: 392, duration: 0.2, type: 'sine' },
    success: { frequency: [659, 784, 988], duration: 0.5, type: 'sine' },
    error: { frequency: [622, 587, 523], duration: 0.5, type: 'triangle' },
    select: { frequency: 659, duration: 0.12, type: 'sine' },
    delete: { frequency: [523, 392], duration: 0.25, type: 'triangle' },
    notification: { frequency: [659, 784, 880], duration: 0.5, type: 'sine' }
  }
};

// Create the safe provider
const { Provider, useValue } = createSafeProvider<AudioContextType>(
  {
    audioEnabled: false,
    setAudioEnabled: () => {},
    playSound: () => {},
    isReady: false
  },
  'Audio'
);

export function AudioProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [audioEnabled, setAudioEnabledState] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const userInteracted = useRef(false);
  const volume = useRef(0.5);
  
  // Using refs for AudioContext instances to avoid recreating on renders
  // and to ensure proper cleanup
  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  
  // Initialize AudioContext lazily
  const initAudioContext = useCallback(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return false;
    
    try {
      if (!audioCtx.current) {
        // Try to get AudioContext with fallback for older browsers
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        if (!AudioContextClass) {
          console.warn('AudioContext not supported in this browser');
          return false;
        }
        
        // Create new AudioContext
        audioCtx.current = new AudioContextClass();
        gainNode.current = audioCtx.current.createGain();
        gainNode.current.connect(audioCtx.current.destination);
        gainNode.current.gain.value = volume.current;
        console.log('Audio context initialized');
      }
      
      // Resume if suspended
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume().catch(err => {
          console.warn('Could not resume AudioContext:', err);
        });
      }
      
      return audioCtx.current.state === 'running';
    } catch (error) {
      console.error('Error initializing AudioContext:', error);
      return false;
    }
  }, []);

  // Set audio enabled state with localStorage persistence
  const setAudioEnabled = useCallback((enabled: boolean) => {
    setAudioEnabledState(enabled);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('audioEnabled', enabled.toString());
        
        if (enabled && !isReady) {
          // Only try to initialize if user has interacted
          if (userInteracted.current) {
            const ready = initAudioContext();
            setIsReady(ready);
          }
        }
      } catch (error) {
        console.error('Error saving audio preference:', error);
      }
    }
  }, [isReady, initAudioContext]);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedAudio = localStorage.getItem('audioEnabled');
      const enabled = savedAudio === 'true';
      setAudioEnabledState(enabled);
    } catch (error) {
      console.error('Error reading audio preference:', error);
    }
  }, []);

  // Setup user interaction detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleUserInteraction = () => {
      userInteracted.current = true;
      
      if (audioEnabled && !isReady) {
        const ready = initAudioContext();
        setIsReady(ready);
      }
    };
    
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioEnabled, isReady, initAudioContext]);

  // Play a sound
  const playSound = useCallback((type: SoundType) => {
    // Multiple safety checks to ensure we only play sounds in a proper browser environment
    // with user interaction and an initialized audio context
    if (
      !audioEnabled || 
      !isReady || 
      !userInteracted.current || 
      typeof window === 'undefined' || 
      !audioCtx.current
    ) {
      return;
    }
    
    try {
      // Get current theme from DOM
      const currentTheme = document.documentElement.getAttribute('data-theme') as Theme || 'hackers';
      const params = themeSoundParams[currentTheme]?.[type];
      
      if (!params) {
        console.warn(`Sound type "${type}" not defined for theme "${currentTheme}"`);
        return;
      }
      
      // Create nodes
      const oscillator = audioCtx.current.createOscillator();
      const noteGain = audioCtx.current.createGain();
      
      // Set oscillator properties
      oscillator.type = params.type as OscillatorType || 'sine';
      
      // Handle frequency
      if (Array.isArray(params.frequency)) {
        const frequencies = params.frequency;
        const noteDuration = params.duration / frequencies.length;
        
        frequencies.forEach((freq: number, index: number) => {
          oscillator.frequency.setValueAtTime(
            freq, 
            audioCtx.current!.currentTime + (index * noteDuration)
          );
        });
      } else {
        oscillator.frequency.value = params.frequency || 440;
      }
      
      // Create envelope
      noteGain.gain.setValueAtTime(0, audioCtx.current.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.1, audioCtx.current.currentTime + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + params.duration);
      
      // Connect nodes
      oscillator.connect(noteGain);
      noteGain.connect(audioCtx.current.destination);
      
      // Play sound
      oscillator.start();
      oscillator.stop(audioCtx.current.currentTime + params.duration);
      
      // Clean up
      setTimeout(() => {
        try {
          oscillator.disconnect();
          noteGain.disconnect();
        } catch (e) {
          // Ignore disconnection errors
        }
      }, params.duration * 1000 + 100);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [audioEnabled, isReady]);

  return (
    <Provider value={{
      audioEnabled,
      setAudioEnabled,
      playSound,
      isReady
    }}>
      {children}
    </Provider>
  );
}

// Export the hook
export const useAudio = useValue;