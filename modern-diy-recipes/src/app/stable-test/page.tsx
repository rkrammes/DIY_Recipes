'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useFixedAnimation } from '@/providers/FixedAnimationProvider';

export default function StableTestPage() {
  const { value: theme } = useTheme();
  const { value: animation } = useFixedAnimation();
  const [mounted, setMounted] = useState(false);
  
  // Safe mounting to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Stability Test Page</h1>
      
      <div className="bg-surface-2 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Theme State</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">Theme Name:</div>
          <div>{theme.theme}</div>
          
          <div className="font-medium">Audio Enabled:</div>
          <div>{theme.audioEnabled ? 'Yes' : 'No'}</div>
          
          <div className="font-medium">Theme Ready:</div>
          <div>{theme.themeReady ? 'Yes' : 'No'}</div>
        </div>
      </div>
      
      <div className="bg-surface-2 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Animation State</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">Animation Theme:</div>
          <div>{animation.theme}</div>
          
          <div className="font-medium">Reduced Motion:</div>
          <div>{animation.isReducedMotion ? 'Yes' : 'No'}</div>
        </div>
      </div>
      
      <div className="bg-surface-2 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Theme Switching Test</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => theme.setTheme('hackers')}
          >
            Hackers
          </button>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => theme.setTheme('dystopia')}
          >
            Dystopia
          </button>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => theme.setTheme('neotopia')}
          >
            Neotopia
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
        <pre className="bg-surface-1 p-4 rounded overflow-auto">
          {JSON.stringify({
            browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
            env: process.env.NODE_ENV,
            time: new Date().toISOString(),
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}