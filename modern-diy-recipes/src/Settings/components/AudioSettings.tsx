'use client';

import React, { useEffect } from 'react';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/hooks/useAudio';

export default function AudioSettings() {
  const { audioEnabled, setAudioEnabled, volume, setVolume, theme } = useUserPreferencesContext();
  const { play, setVolume: setAudioVolume } = useAudio(audioEnabled);

  // Sync volume with audio system when it changes
  useEffect(() => {
    setAudioVolume(volume);
  }, [volume, setAudioVolume]);

  // Play a sample sound when toggling audio or changing volume
  const handleToggleAudio = (checked: boolean) => {
    setAudioEnabled(checked);
    if (checked) {
      // Delay to make sure audio context has time to initialize
      setTimeout(() => play('click'), 100);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioEnabled) {
      play('click');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Audio Settings</h2>
        <p className="text-text-secondary">
          Configure system sounds and effects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
          <CardDescription>
            Enable or disable interface sound effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="audio-toggle" className="font-medium">
                Interface Sounds
              </Label>
              <p className="text-sm text-text-secondary">
                Play sounds for interface interactions
              </p>
            </div>
            <Switch
              id="audio-toggle"
              checked={audioEnabled}
              onCheckedChange={handleToggleAudio}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume-slider" className="font-medium">
              Volume: {Math.round(volume * 100)}%
            </Label>
            <Slider
              id="volume-slider"
              disabled={!audioEnabled}
              value={[volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className={audioEnabled ? '' : 'opacity-50'}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sound Theme</CardTitle>
          <CardDescription>
            {theme === 'hackers' 
              ? 'Retro digital sounds inspired by 90s tech' 
              : theme === 'dystopia'
                ? 'Matrix-style digital tones with synthetic texture'
                : 'Clean, bright tones with digital clarity'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <button
                  onClick={() => play('click')}
                  disabled={!audioEnabled}
                  className={`w-full p-3 rounded border bg-surface-0 hover:bg-surface-1 ${!audioEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Click Sound
                </button>
              </div>
              <div>
                <button
                  onClick={() => play('hover')}
                  disabled={!audioEnabled}
                  className={`w-full p-3 rounded border bg-surface-0 hover:bg-surface-1 ${!audioEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Hover Sound
                </button>
              </div>
              <div>
                <button
                  onClick={() => play('success')}
                  disabled={!audioEnabled}
                  className={`w-full p-3 rounded border bg-surface-0 hover:bg-surface-1 ${!audioEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Success Sound
                </button>
              </div>
              <div>
                <button
                  onClick={() => play('error')}
                  disabled={!audioEnabled}
                  className={`w-full p-3 rounded border bg-surface-0 hover:bg-surface-1 ${!audioEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Error Sound
                </button>
              </div>
            </div>

            <p className="text-sm text-text-secondary mt-4">
              Sound effects are automatically themed to match your visual theme.
              {!audioEnabled && ' Enable audio to test the sounds.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}