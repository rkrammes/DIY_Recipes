'use client';

import { useState } from 'react';
import { useTheme } from '../../providers/FixedThemeProvider';
import { useFixedAnimation } from '../../providers/FixedAnimationProvider';
import { useAudio } from '../../providers/AudioProvider';
import { Button } from '../../components/ui/button';

export default function TestFixedPage() {
  const { theme, setTheme, toggleTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { isReducedMotion, getThemeVariants } = useFixedAnimation();
  const { playSound, isReady } = useAudio();
  const [count, setCount] = useState(0);
  
  // Get animation variants for the button
  const buttonVariants = getThemeVariants('buttonHover');
  
  // Handle button click
  const handleClick = () => {
    setCount(count + 1);
    
    if (audioEnabled && isReady) {
      playSound('click');
    }
  };
  
  return (
    <div className="container p-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Testing Fixed Providers</h1>
      
      <div className="space-y-8">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Theme Provider Test</h2>
          <p className="mb-4">Current theme: <strong>{theme}</strong></p>
          
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={() => setTheme('hackers')}
              variant={theme === 'hackers' ? 'default' : 'outline'}
            >
              Hackers
            </Button>
            <Button 
              onClick={() => setTheme('dystopia')}
              variant={theme === 'dystopia' ? 'default' : 'outline'}
            >
              Dystopia
            </Button>
            <Button 
              onClick={() => setTheme('neotopia')}
              variant={theme === 'neotopia' ? 'default' : 'outline'}
            >
              Neotopia
            </Button>
            <Button onClick={toggleTheme}>Cycle Themes</Button>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Animation Provider Test</h2>
          <p className="mb-4">Reduced motion: <strong>{isReducedMotion ? 'Yes' : 'No'}</strong></p>
          
          <div 
            className="p-4 border rounded-md mb-4"
            style={{
              transform: `scale(${buttonVariants?.hover?.scale || 1})`,
              transition: 'transform 0.3s ease'
            }}
          >
            This element uses theme-specific animation values
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Audio Provider Test</h2>
          <p className="mb-4">Audio enabled: <strong>{audioEnabled ? 'Yes' : 'No'}</strong></p>
          <p className="mb-4">Audio ready: <strong>{isReady ? 'Yes' : 'No'}</strong></p>
          
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant={audioEnabled ? 'default' : 'outline'}
            >
              {audioEnabled ? 'Disable Audio' : 'Enable Audio'}
            </Button>
            
            <Button 
              onClick={handleClick}
              disabled={!audioEnabled || !isReady}
            >
              Play Sound (Clicks: {count})
            </Button>
          </div>
          
          {audioEnabled && !isReady && (
            <p className="text-warning text-sm">
              Click anywhere on the page to initialize audio context
            </p>
          )}
        </div>
      </div>
    </div>
  );
}