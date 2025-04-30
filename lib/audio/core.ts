import { type Theme } from '@/providers/SettingsProvider';

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

// Function to get or create the AudioContext
// Should be called on a user interaction (e.g., button click)
export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
    console.log('AudioContext created');
  }
  return audioContext;
};

export const getMasterGainNode = (): GainNode | null => {
  return masterGainNode;
};

// Apply an ADSR envelope to a gain node
export const applyEnvelope = (
  gainNode: GainNode,
  startTime: number,
  attackTime: number,
  decayTime: number,
  sustainLevel: number,
  releaseTime: number,
  duration: number // Total duration of the note
) => {
  const context = gainNode.context;
  const now = context.currentTime;

  gainNode.gain.setValueAtTime(0, now + startTime);
  gainNode.gain.linearRampToValueAtTime(1, now + startTime + attackTime);
  gainNode.gain.linearRampToValueAtTime(sustainLevel, now + startTime + attackTime + decayTime);
  // Schedule release just before the note ends
  gainNode.gain.setValueAtTime(sustainLevel, now + startTime + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration);
};

// Get theme-specific audio parameters
export const getThemeAudioParams = (theme: Theme): {
  masterVolume: number;
  ui: {
    hover: { frequency: number; duration: number; type: OscillatorType; envelope: { attack: number; decay: number; sustain: number; release: number } };
    click: { frequency: number | number[]; duration: number; type: OscillatorType; envelope: { attack: number; decay: number; sustain: number; release: number } };
    modalOpen: { frequency: number; duration: number; type: OscillatorType; envelope: { attack: number; decay: number; sustain: number; release: number } };
    success: { frequency: number | number[]; duration: number; type: OscillatorType; envelope: { attack: number; decay: number; sustain: number; release: number } };
    error: { frequency: number | number[]; duration: number; type: OscillatorType; envelope: { attack: number; decay: number; sustain: number; release: number } };
  };
} => {
  // These are placeholder values. In a real implementation, these would come from
  // theme tokens or a theme configuration object.
  switch (theme) {
    case 'synthwave-noir':
      return {
        masterVolume: 0.8,
        ui: {
          hover: { frequency: 440, duration: 0.05, type: 'sine', envelope: { attack: 0.01, decay: 0.02, sustain: 0.5, release: 0.02 } },
          click: { frequency: 880, duration: 0.1, type: 'square', envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.04 } },
          modalOpen: { frequency: 660, duration: 0.3, type: 'triangle', envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 } },
          success: { frequency: [523, 659, 784], duration: 0.5, type: 'sine', envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } }, // C5, E5, G5
          error: { frequency: [494, 440, 392], duration: 0.5, type: 'sawtooth', envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } }, // B4, A4, G4
        }
      };
    case 'terminal-mono':
      return {
        masterVolume: 0.7, // Slightly lower volume
        ui: {
          hover: { frequency: 600, duration: 0.04, type: 'square', envelope: { attack: 0.005, decay: 0.02, sustain: 0.6, release: 0.03 } },
          click: { frequency: 900, duration: 0.08, type: 'square', envelope: { attack: 0.005, decay: 0.04, sustain: 0.7, release: 0.035 } },
          modalOpen: { frequency: 700, duration: 0.25, type: 'sawtooth', envelope: { attack: 0.04, decay: 0.08, sustain: 0.6, release: 0.13 } },
          success: { frequency: [784, 988, 1175], duration: 0.4, type: 'square', envelope: { attack: 0.04, decay: 0.08, sustain: 0.7, release: 0.2 } }, // G5, B5, D6
          error: { frequency: [330, 294, 262], duration: 0.4, type: 'sawtooth', envelope: { attack: 0.04, decay: 0.08, sustain: 0.7, release: 0.2 } }, // E4, D4, C4
        }
      };
    case 'paper-ledger':
    default:
      return {
        masterVolume: 0.6,
        ui: {
          hover: { frequency: 523, duration: 0.05, type: 'sine', envelope: { attack: 0.01, decay: 0.02, sustain: 0.5, release: 0.02 } }, // C5
          click: { frequency: 1047, duration: 0.1, type: 'square', envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.04 } }, // C6
          modalOpen: { frequency: 784, duration: 0.3, type: 'triangle', envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 } }, // G5
          success: { frequency: [659, 784, 988], duration: 0.5, type: 'sine', envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } }, // E5, G5, B5
          error: { frequency: [622, 587, 523], duration: 0.5, type: 'sawtooth', envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 } }, // D#5, D5, C5
        }
      };
  }
};

// Set the master volume
export const setMasterVolume = (volume: number) => {
  if (masterGainNode) {
    masterGainNode.gain.setValueAtTime(volume, masterGainNode.context.currentTime);
  }
};