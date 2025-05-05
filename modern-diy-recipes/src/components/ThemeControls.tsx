'use client';

import React from 'react';
import { useTheme } from '../providers/FixedThemeProvider';
import { useAudio } from '../hooks/useAudio';

interface ThemeControlsProps {
  onClose?: () => void;
}

export default function ThemeControls({ onClose }: ThemeControlsProps) {
  // Get the theme context directly from our fixed provider
  const { theme, setTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { playSound } = useAudio();

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    console.log('Changing theme to:', newTheme);
    setTheme(newTheme);
    if (audioEnabled) {
      playSound('click');
    }
  };

  // Handle audio toggle
  const handleAudioToggle = (checked: boolean) => {
    console.log('Setting audio to:', checked);
    setAudioEnabled(checked);
    if (checked) {
      playSound('success');
    }
  };

  return (
    <div className="p-2 bg-surface-1 border-2 border-accent shadow-lg max-w-2xl w-full font-mono text-xs">
      {/* ASCII art header */}
      <div className="text-accent">
        ┌────────────────────────────────────────────────────────────────┐
        <br />
        │                  <span className="text-sm font-bold animate-pulse">&gt; KRAFT_AI SYSTEM CONFIGURATION &lt;</span>                │
        <br />
        ├────────────────────────────────────────────────────────────────┤
      </div>
      
      <div className="grid grid-cols-2 gap-1 p-2">
        {/* Left column - Theme selection */}
        <div className="border border-border-subtle p-3">
          <div className="text-accent mb-2">
            ┌─────────────────────────────┐
            <br />
            │     COLOR SCHEME SELECT     │
            <br />
            └─────────────────────────────┘
          </div>
          
          <div className="space-y-2 ml-2 mt-4">
            {/* Old-school text-based radio buttons */}
            <div 
              onClick={() => handleThemeChange('hackers')}
              className="flex items-start cursor-pointer group"
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <div className={`${theme === 'hackers' ? 'text-emerald-500 animate-pulse' : 'text-text-secondary'}`}>
                  ┌───┐
                  <br />
                  │ {theme === 'hackers' ? 'X' : ' '} │
                  <br />
                  └───┘
                </div>
              </div>
              <div>
                <div className={`${theme === 'hackers' ? 'text-emerald-500' : 'text-text-secondary'} font-bold`}>HACKERS TERMINAL</div>
                <div className="text-text-secondary mt-1">Classic green-on-black terminal interface with
                <br />hacker aesthetic and retro computer styling.</div>
              </div>
            </div>
            
            <div className="text-text-secondary my-1">────────────────────────────────────</div>
            
            <div 
              onClick={() => handleThemeChange('dystopia')}
              className="flex items-start cursor-pointer group"
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <div className={`${theme === 'dystopia' ? 'text-amber-500 animate-pulse' : 'text-text-secondary'}`}>
                  ┌───┐
                  <br />
                  │ {theme === 'dystopia' ? 'X' : ' '} │
                  <br />
                  └───┘
                </div>
              </div>
              <div>
                <div className={`${theme === 'dystopia' ? 'text-amber-500' : 'text-text-secondary'} font-bold`}>DYSTOPIAN NOIR</div>
                <div className="text-text-secondary mt-1">Dark cyberpunk interface with amber/red accents
                <br />and dystopian cyberpunk aesthetic.</div>
              </div>
            </div>
            
            <div className="text-text-secondary my-1">────────────────────────────────────</div>
            
            <div 
              onClick={() => handleThemeChange('neotopia')}
              className="flex items-start cursor-pointer group"
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <div className={`${theme === 'neotopia' ? 'text-blue-500 animate-pulse' : 'text-text-secondary'}`}>
                  ┌───┐
                  <br />
                  │ {theme === 'neotopia' ? 'X' : ' '} │
                  <br />
                  └───┘
                </div>
              </div>
              <div>
                <div className={`${theme === 'neotopia' ? 'text-blue-500' : 'text-text-secondary'} font-bold`}>NEOTOPIA LIGHT</div>
                <div className="text-text-secondary mt-1">Modern bright interface with blue accents and
                <br />clean futuristic design elements.</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Audio and other settings */}
        <div className="border border-border-subtle p-3">
          <div className="text-purple-500 mb-2">
            ┌─────────────────────────────┐
            <br />
            │    SYSTEM AUDIO CONTROLS    │
            <br />
            └─────────────────────────────┘
          </div>
          
          {/* ASCII art toggle switches */}
          <div className="mt-4 mb-6">
            <div className="flex items-center gap-6">
              <div 
                onClick={() => handleAudioToggle(true)}
                className={`cursor-pointer ${audioEnabled ? 'text-purple-500' : 'text-text-secondary'}`}
              >
                ┌──────────┐
                <br />
                │  ▄████▄  │ 
                <br />
                │ ███{audioEnabled ? "█" : " "}███ │ SOUND ON
                <br />
                │ ██{audioEnabled ? "█" : " "}█{audioEnabled ? "█" : " "}██ │
                <br />
                │  ▀████▀  │
                <br />
                └──────────┘
                {audioEnabled && <div className="text-purple-500 animate-pulse text-center mt-1">▂▃▄▅▆▇▉</div>}
              </div>
              
              <div 
                onClick={() => handleAudioToggle(false)}
                className={`cursor-pointer ${!audioEnabled ? 'text-purple-500' : 'text-text-secondary'}`}
              >
                ┌──────────┐
                <br />
                │  ▄████▄  │ 
                <br />
                │ ███ ███ │ SOUND OFF
                <br />
                │ ██ █ ██ │
                <br />
                │  ▀████▀  │
                <br />
                └──────────┘
                {!audioEnabled && <div className="text-purple-500 animate-pulse text-center mt-1">▬▬▬▬▬▬▬</div>}
              </div>
            </div>
          </div>
          
          {/* System status */}
          <div className="border border-border-subtle p-2 mt-4">
            <div className="text-accent">SYSTEM STATUS</div>
            <div className="text-text-secondary mt-2">
              VERSION: <span className="text-accent">KRAFT_AI v1.0.2</span>
              <br />
              MEMORY: <span className="text-accent"><MemoryUsage /></span>
              <br />
              THEME: <span className="text-accent">{theme.toUpperCase()}</span>
              <br />
              AUDIO: <span className="text-accent">{audioEnabled ? "ENABLED" : "DISABLED"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ASCII footer with controls */}
      <div className="mt-2 text-accent">
        ├────────────────────────────────────────────────────────────────┤
        <br />
        <div className="flex justify-between px-4">
          <span className="text-text-secondary">
            <span className="animate-pulse text-accent">█</span> PRESS ESC TO RETURN │ F1: HELP │ F2: DEFAULT SETTINGS
          </span>
          {onClose && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  if (audioEnabled) playSound('success');
                } catch (error) {
                  console.warn('Error playing sound:', error);
                }
                onClose();
              }}
              className="text-accent hover:text-accent/80"
            >
              [ SAVE & EXIT ]
            </button>
          )}
        </div>
        <br />
        └────────────────────────────────────────────────────────────────┘
      </div>
    </div>
  );
}

// No need for ThemeButton component anymore as we're using ASCII art radio buttons