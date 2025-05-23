import { getAudioContext, applyEnvelope, getMasterGainNode, getThemeAudioParams } from './core';
import { type Theme } from '../../providers/SettingsProvider';

// Helper function to play a basic oscillator sound
const playOscillator = (
  frequency: number,
  duration: number,
  type: OscillatorType,
  envelope: { attack: number; decay: number; sustain: number; release: number },
  theme: Theme // Add theme parameter
) => {
  const context = getAudioContext();
  const masterGain = getMasterGainNode();
  if (!masterGain) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(masterGain); // Connect to master gain

  const now = context.currentTime;
  oscillator.start(now);

  // Apply envelope
  applyEnvelope(gainNode, 0, envelope.attack, envelope.decay, envelope.sustain, envelope.release, duration);

  // Stop the oscillator after the duration + release time
  oscillator.stop(now + duration + envelope.release);
};

// Helper function to play a sequence of frequencies (for success/error)
const playFrequencySequence = (
  frequencies: number[],
  duration: number,
  type: OscillatorType,
  envelope: { attack: number; decay: number; sustain: number; release: number },
  theme: Theme // Add theme parameter
) => {
  const context = getAudioContext();
  const masterGain = getMasterGainNode();
  if (!masterGain) return;

  const noteDuration = duration / frequencies.length;

  frequencies.forEach((freq, index) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, context.currentTime + index * noteDuration);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain); // Connect to master gain

    const now = context.currentTime;
    oscillator.start(now + index * noteDuration);

    // Apply envelope for each note
    applyEnvelope(gainNode, index * noteDuration, envelope.attack, envelope.decay, envelope.sustain, envelope.release, noteDuration);

    // Stop the oscillator after the note duration + release time
    oscillator.stop(now + index * noteDuration + noteDuration + envelope.release);
  });
};


// Synth function for button hover
export const playHoverSynth = (theme: Theme) => {
  const audioParams = getThemeAudioParams(theme);
  const { frequency, duration, type, envelope } = audioParams.ui.hover;
  playOscillator(frequency, duration, type, envelope, theme);
};

// Synth function for button click
export const playClickSynth = (theme: Theme) => {
  const audioParams = getThemeAudioParams(theme);
  const { frequency, duration, type, envelope } = audioParams.ui.click;

  // Handle potential frequency array for click (though doc says single freq)
  const freq = Array.isArray(frequency) ? frequency[0] : frequency;

  playOscillator(freq, duration, type, envelope, theme);
};

// Synth function for modal open
export const playModalOpenSynth = (theme: Theme) => {
  const audioParams = getThemeAudioParams(theme);
  const { frequency, duration, type, envelope } = audioParams.ui.modalOpen;
  playOscillator(frequency, duration, type, envelope, theme);
};

// Synth function for success toast
export const playSuccessSynth = (theme: Theme) => {
  const audioParams = getThemeAudioParams(theme);
  const { frequency, duration, type, envelope } = audioParams.ui.success;

  // Ensure frequency is an array for sequence
  const freqs = Array.isArray(frequency) ? frequency : [frequency];

  playFrequencySequence(freqs, duration, type, envelope, theme);
};

// Synth function for error toast
export const playErrorSynth = (theme: Theme) => {
  const audioParams = getThemeAudioParams(theme);
  const { frequency, duration, type, envelope } = audioParams.ui.error;

  // Ensure frequency is an array for sequence
  const freqs = Array.isArray(frequency) ? frequency : [frequency];

  playFrequencySequence(freqs, duration, type, envelope, theme);
};