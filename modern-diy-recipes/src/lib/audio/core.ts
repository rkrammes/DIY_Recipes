import type { Theme } from '../../providers/ThemeProvider';

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

// Function to get or create the AudioContext
export const getAudioContext = (): AudioContext | null => {
  try {
    // Only create AudioContext in browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      // Check if AudioContext is supported in this browser
      if (!AudioContextClass) {
        console.warn('AudioContext not supported in this browser');
        return null;
      }
      
      audioContext = new AudioContextClass();
      masterGainNode = audioContext.createGain();
      masterGainNode.connect(audioContext.destination);
    }
    
    if (audioContext.state === 'suspended') {
      // Only attempt to resume if explicitly requested
      // We'll rely on our audio activation system to call this at the right time
      audioContext.resume().catch(err => {
        console.warn('Could not resume AudioContext:', err);
      });
    }
    
    return audioContext;
  } catch (error) {
    console.error('Error creating or accessing AudioContext:', error);
    return null;
  }
};

// Define audio parameter interface
export interface AudioParams {
  masterVolume: number;
  ui: Record<string, any>;
}

// Get theme-specific audio parameters
export const getThemeAudioParams = (theme: Theme): AudioParams => {
  // Handle legacy theme names first
  if (theme === 'synthwave-noir') return getThemeAudioParams('hackers');
  if (theme === 'terminal-mono') return getThemeAudioParams('dystopia');
  if (theme === 'paper-ledger') return getThemeAudioParams('neotopia');
  
  switch (theme) {
    case 'hackers':
      return {
        masterVolume: 0.8,
        ui: {
          hover: { 
            frequency: 440, 
            duration: 0.05, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.02, sustain: 0.5, release: 0.02 } 
          },
          click: { 
            frequency: 880, 
            duration: 0.1, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.04 } 
          },
          modalOpen: { 
            frequency: 660, 
            duration: 0.3, 
            type: 'triangle' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 } 
          },
          close: { 
            frequency: 330, 
            duration: 0.2, 
            type: 'triangle' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1 } 
          },
          select: { 
            frequency: 550, 
            duration: 0.15, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.08 } 
          },
          delete: { 
            frequency: [587, 440], 
            duration: 0.3, 
            type: 'sawtooth' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.15 } 
          },
          notification: { 
            frequency: [587, 698, 880], 
            duration: 0.6, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.3 } 
          },
          success: { 
            frequency: [523, 659, 784], 
            duration: 0.5, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } 
          },
          error: { 
            frequency: [494, 440, 392], 
            duration: 0.5, 
            type: 'sawtooth' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } 
          }
        }
      };
    case 'dystopia':
      return {
        masterVolume: 0.7,
        ui: {
          hover: { 
            frequency: 600, 
            duration: 0.04, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.005, decay: 0.02, sustain: 0.6, release: 0.03 } 
          },
          click: { 
            frequency: 900, 
            duration: 0.08, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.005, decay: 0.04, sustain: 0.7, release: 0.035 } 
          },
          modalOpen: { 
            frequency: 700, 
            duration: 0.25, 
            type: 'sawtooth' as OscillatorType, 
            envelope: { attack: 0.04, decay: 0.08, sustain: 0.6, release: 0.13 } 
          },
          close: { 
            frequency: 400, 
            duration: 0.15, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.005, decay: 0.03, sustain: 0.5, release: 0.05 } 
          },
          select: { 
            frequency: 800, 
            duration: 0.1, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.03, sustain: 0.6, release: 0.06 } 
          },
          delete: { 
            frequency: [700, 500], 
            duration: 0.25, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.005, decay: 0.08, sustain: 0.5, release: 0.1 } 
          },
          notification: { 
            frequency: [784, 880, 987], 
            duration: 0.5, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.03, decay: 0.07, sustain: 0.6, release: 0.2 } 
          },
          success: { 
            frequency: [784, 988, 1175], 
            duration: 0.4, 
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.04, decay: 0.08, sustain: 0.7, release: 0.2 } 
          },
          error: { 
            frequency: [330, 294, 262], 
            duration: 0.4, 
            type: 'sawtooth' as OscillatorType, 
            envelope: { attack: 0.04, decay: 0.08, sustain: 0.7, release: 0.2 } 
          }
        }
      };
    case 'neotopia':
    default:
      return {
        masterVolume: 0.6,
        ui: {
          hover: { 
            frequency: 523, 
            duration: 0.05, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.02, sustain: 0.5, release: 0.02 } 
          },
          click: { 
            frequency: 1047, 
            duration: 0.1, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.04 } 
          },
          modalOpen: { 
            frequency: 784, 
            duration: 0.3, 
            type: 'triangle' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 } 
          },
          close: { 
            frequency: 392, 
            duration: 0.2, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.02, decay: 0.04, sustain: 0.5, release: 0.1 } 
          },
          select: { 
            frequency: 659, 
            duration: 0.12, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.03, decay: 0.04, sustain: 0.6, release: 0.05 } 
          },
          delete: { 
            frequency: [523, 392], 
            duration: 0.25, 
            type: 'triangle' as OscillatorType, 
            envelope: { attack: 0.02, decay: 0.08, sustain: 0.5, release: 0.1 } 
          },
          notification: { 
            frequency: [659, 784, 880], 
            duration: 0.5, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.08, sustain: 0.6, release: 0.3 } 
          },
          success: { 
            frequency: [659, 784, 988], 
            duration: 0.5, 
            type: 'sine' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } 
          },
          error: { 
            frequency: [622, 587, 523], 
            duration: 0.5, 
            type: 'triangle' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } 
          }
        }
      };
  }
  
  // Support for legacy theme names
  if (theme === 'synthwave-noir') return getThemeAudioParams('hackers');
  if (theme === 'terminal-mono') return getThemeAudioParams('dystopia');
  if (theme === 'paper-ledger') return getThemeAudioParams('neotopia');
};

// Apply an envelope to a gain node
export const applyEnvelope = (
  gainNode: GainNode,
  params: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  },
  duration: number
) => {
  const now = gainNode.context.currentTime;
  const { attack, decay, sustain, release } = params;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + attack);
  gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
  gainNode.gain.setValueAtTime(sustain, now + duration - release);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
};

// Set master volume
export const setMasterVolume = (volume: number) => {
  if (masterGainNode) {
    masterGainNode.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      masterGainNode.context.currentTime
    );
  }
};

// Get master gain node
export const getMasterGainNode = (): GainNode | null => masterGainNode;