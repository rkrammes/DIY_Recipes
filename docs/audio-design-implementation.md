# Audio Design Implementation Guide

This document outlines the implementation approach for the synth-only audio design system described in the research. The goal is to create a cohesive audio experience that enhances the UI without requiring external audio samples.

## 1. Audio Design Philosophy

The DIY Recipes app will use a synth-only audio approach with these key principles:

- **Lightweight**: All sounds generated programmatically via Web Audio API
- **Theme-Integrated**: Sound characteristics vary based on active theme
- **Accessibility-Aware**: Respects user preferences for reduced motion/sound
- **Minimal**: Short, subtle sounds that enhance rather than distract
- **Meaningful**: Each interaction type has a distinct audio signature

## 2. Synth Patch Specifications

### 2.1 UI Event Sound Profiles

| UI Event      | Synth Patch                                  | Envelope                          | Implementation Notes                             |
| ------------- | -------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| Button hover  | **Sine blip** at 900 Hz                      | A:2 ms  D:40 ms  S:0  R:20 ms     | Use Web Audio `OscillatorNode`; no sample fetch. |
| Button click  | **Plucky triangle** 300 → 80 Hz portamento   | A:1 ms  D:120 ms  S:0             | Adds tactile "thock" – pans ±10 ° random.        |
| Modal open    | **Lush pad** (saw + sine, 4‑voice)           | A:60 ms  D:600 ms  S:.5  R:450 ms | Low‑pass @ 4 kHz. Volume −12 LUFS.               |
| Success toast | **Fifth interval arpeggio** G4‑D5 via **FM** | A:10 ms  D:300 ms  S:0            | Use Tone.js `FMSynth`.                           |
| Error toast   | **Noise burst** filtered 300 Hz ↗ 100 Hz     | A:0 ms  D:350 ms  S:0             | Pink‑noise `BufferSource` > filter.              |

### 2.2 Theme-Specific Sound Variations

#### Synthwave Noir
- Higher resonance on filters
- More pronounced reverb (80ms decay)
- Slight bitcrushing effect (4-bit reduction)
- Frequency range: 100Hz - 12kHz

#### Terminal Mono
- Minimal reverb
- Slight distortion
- Lower frequency range (80Hz - 8kHz)
- More pronounced low-end

#### Paper Ledger
- Clean, no distortion
- Short reverb (40ms decay)
- Higher frequency range (200Hz - 14kHz)
- Softer attack times

## 3. Implementation Architecture

### 3.1 Core Audio Module

```typescript
// lib/audio/core.ts

import { type Theme } from '@/providers/SettingsProvider';

// AudioContext singleton
let audioContext: AudioContext | null = null;

// Get or create AudioContext (must be called on user interaction)
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  // Resume context if it's suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

// Base envelope generator
export interface EnvelopeParams {
  attack: number;  // seconds
  decay: number;   // seconds
  sustain: number; // 0-1 gain value
  release: number; // seconds
}

export function applyEnvelope(
  gainNode: GainNode, 
  params: EnvelopeParams, 
  triggerRelease: boolean = true
): Promise<void> {
  const { attack, decay, sustain, release } = params;
  const now = gainNode.context.currentTime;
  
  // Reset gain
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(0, now);
  
  // Attack
  gainNode.gain.linearRampToValueAtTime(1, now + attack);
  
  // Decay to sustain
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(0.001, sustain), // Avoid 0 for exponentialRamp
    now + attack + decay
  );
  
  if (triggerRelease) {
    // Release
    const releaseStart = now + attack + decay;
    gainNode.gain.setValueAtTime(Math.max(0.001, sustain), releaseStart);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, // Near-zero for exponentialRamp
      releaseStart + release
    );
    
    // Return promise that resolves when sound is complete
    return new Promise(resolve => {
      setTimeout(() => resolve(), (attack + decay + release) * 1000);
    });
  }
  
  return Promise.resolve();
}

// Theme-specific audio parameters
export function getThemeAudioParams(theme: Theme) {
  switch (theme) {
    case 'synthwave-noir':
      return {
        reverb: { decay: 0.8, wet: 0.3 },
        filter: { frequency: 12000, resonance: 5 },
        distortion: { amount: 0.1 },
        bitcrusher: { bits: 4, enabled: true }
      };
    case 'terminal-mono':
      return {
        reverb: { decay: 0.4, wet: 0.1 },
        filter: { frequency: 8000, resonance: 2 },
        distortion: { amount: 0.2 },
        bitcrusher: { bits: 8, enabled: true }
      };
    case 'paper-ledger':
    default:
      return {
        reverb: { decay: 0.4, wet: 0.15 },
        filter: { frequency: 14000, resonance: 1 },
        distortion: { amount: 0 },
        bitcrusher: { bits: 16, enabled: false }
      };
  }
}

// Master volume control
let masterVolume = 1.0;
export function setMasterVolume(volume: number): void {
  masterVolume = Math.max(0, Math.min(1, volume));
}

export function getMasterVolume(): number {
  return masterVolume;
}
```

## 4. Integration with Theme System

### 4.1 Connecting Sound to Theme Changes

```typescript
// providers/SettingsProvider.tsx (partial)

// ...existing imports
import { playSound } from '@/lib/sound';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ...existing state

  // Play a sound when theme changes
  React.useEffect(() => {
    if (typeof window !== 'undefined' && audioEnabled) {
      // Only play if not the initial load
      if (document.readyState === 'complete') {
        playSound('success', theme);
      }
    }
  }, [theme]);

  // ...rest of component
};
```

## 5. Implementation Steps

1. **Create Audio Core Module**
   - Implement AudioContext management
   - Create envelope generator
   - Add theme-specific parameter functions

2. **Implement Basic Sound Functions**
   - Button hover/click sounds
   - Modal open/close sounds
   - Success/error notification sounds

3. **Connect to Theme System**
   - Update SettingsProvider to include audio preferences
   - Create theme-specific sound variations
   - Add sound triggers to theme changes

4. **Add Component Integration**
   - Create React hooks for sound playback
   - Add sound triggers to common components
   - Implement volume controls in settings panel

5. **Implement Accessibility Features**
   - Respect prefers-reduced-motion
   - Add explicit audio toggle
   - Implement volume control slider

6. **Optimize Performance**
   - Implement audio node pooling
   - Add proper cleanup of audio resources
   - Batch audio operations where possible

## 6. Testing Plan

1. **Unit Tests**
   - Test envelope generator functions
   - Verify theme parameter mapping
   - Test accessibility preference detection

2. **Integration Tests**
   - Verify sounds play on appropriate UI events
   - Test theme switching with audio
   - Validate volume control functionality

3. **Accessibility Testing**
   - Test with screen readers
   - Verify prefers-reduced-motion handling
   - Test keyboard navigation with audio feedback

4. **Performance Testing**
   - Measure memory usage during extended sessions
   - Test audio latency on various devices
   - Verify cleanup of audio resources

## 7. Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js Documentation](https://tonejs.github.io/)
- [Web Audio Synthesis Examples](https://github.com/mdn/webaudio-examples)