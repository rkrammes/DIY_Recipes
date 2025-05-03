import { type Theme } from '../../providers/ThemeProvider';

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

// Function to get or create the AudioContext
export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

// Get theme-specific audio parameters
export const getThemeAudioParams = (theme: Theme) => {
  switch (theme) {
    case 'synthwave-noir':
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
    case 'terminal-mono':
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
    case 'paper-ledger':
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
            type: 'square' as OscillatorType, 
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.04 } 
          },
          modalOpen: { 
            frequency: 784, 
            duration: 0.3, 
            type: 'triangle' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 } 
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
            type: 'sawtooth' as OscillatorType, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } 
          }
        }
      };
  }
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