'use client';

import React, { ReactNode, useState } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';

interface TerminalSettingsWrapperProps {
  children: ReactNode;
}

/**
 * TerminalSettingsWrapper - Adapts the settings content to fit the Terminal UI 3-column layout
 * This wrapper adds terminal-specific styling and layout to the settings panel
 */
export default function TerminalSettingsWrapper({ children }: TerminalSettingsWrapperProps) {
  const { theme } = useTheme();
  const { preferences, loading, error, supabaseAvailable } = useUserPreferencesContext();
  
  // Categories for the Settings module in terminal style
  const categories = [
    { id: 'theme', name: 'Theme Settings', icon: '🎨' },
    { id: 'audio', name: 'Audio Controls', icon: '🔊' },
    { id: 'profile', name: 'User Profile', icon: '👤' },
    { id: 'system', name: 'System Info', icon: '🖥️' },
  ];
  
  const [activeCategory, setActiveCategory] = useState('theme');
  
  // Format system info for terminal display
  const getSystemInfo = () => {
    return {
      status: supabaseAvailable ? 'ONLINE' : 'OFFLINE',
      statusClass: supabaseAvailable ? 'text-green-500' : 'text-red-500',
      version: '1.0.2',
      lastSync: new Date().toISOString().replace('T', ' ').substring(0, 19),
      theme: preferences.theme,
      themeClass: 
        preferences.theme === 'hackers' ? 'text-cyan-500' : 
        preferences.theme === 'dystopia' ? 'text-green-500' : 
        'text-blue-500',
    };
  };
  
  const systemInfo = getSystemInfo();
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Terminal header with settings title */}
      <div className="border-b border-border-subtle bg-surface-1 p-2">
        <div className="text-xs text-accent mb-1">┌──────────────────────────────────────────────────────────┐</div>
        <div className="flex justify-between items-center">
          <div className="text-lg text-accent font-bold px-2 flex items-center">
            <span className="mr-2">⚙️</span>
            SYSTEM SETTINGS
          </div>
          <div className="text-xs text-text-secondary px-2">
            STATUS: <span className={systemInfo.statusClass}>{systemInfo.status}</span> • 
            VERSION: <span className="text-accent">{systemInfo.version}</span> • 
            THEME: <span className={systemInfo.themeClass}>{systemInfo.theme.toUpperCase()}</span>
          </div>
        </div>
        <div className="text-xs text-accent">└──────────────────────────────────────────────────────────┘</div>
      </div>
      
      {/* Main content area with terminal styling */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar for settings categories */}
        <div className="w-48 bg-surface-0 border-r border-border-subtle flex-shrink-0 flex flex-col">
          <div className="text-xs uppercase text-accent bg-surface-2 py-1 px-2 border-b border-border-subtle">
            Configuration Matrix
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-accent/20 text-accent font-bold' 
                    : 'hover:bg-surface-2 text-text-secondary'
                }`}
              >
                <span className="mr-2 font-bold">
                  {activeCategory === category.id ? '►' : ' '}
                </span>
                <span className="mr-2 text-lg">{category.icon}</span>
                <span className="uppercase text-sm">{category.name}</span>
              </div>
            ))}
          </div>
          
          {/* Terminal decoration */}
          <div className="mt-auto p-3 border-t border-border-subtle">
            <div className="text-xs text-text-secondary">
              <div className="mb-2">— System Settings —</div>
              <div className="flex justify-between">
                <span>LAST SYNC:</span>
                <span className="text-accent">{systemInfo.lastSync}</span>
              </div>
              <div className="mt-2 text-xs">
                <span className={`${supabaseAvailable ? 'text-green-500' : 'text-red-500'} animate-pulse`}>
                  {supabaseAvailable ? '▀ ▄ ▀ ▄ ▀ ▄' : '_ _ _ _ _ _'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center section - Status and info */}
        <div className="w-0 lg:w-48 border-r border-border-subtle flex-shrink-0 hidden lg:flex flex-col">
          <div className="text-xs uppercase text-accent bg-surface-2 py-1 px-2 border-b border-border-subtle">
            System Status
          </div>
          
          <div className="flex-1 p-3 text-xs text-text-secondary">
            {/* Connection status */}
            <div className="mb-4">
              <div className="uppercase font-bold mb-1 text-accent">Connection</div>
              <div className="flex items-center mb-1">
                <div className={`w-2 h-2 rounded-full ${supabaseAvailable ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                <span>Supabase: {supabaseAvailable ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {error && (
                <div className="mt-1 text-red-500 text-[10px] border border-red-500/30 p-1">
                  {error.message}
                </div>
              )}
            </div>
            
            {/* System Info */}
            <div className="mb-4">
              <div className="uppercase font-bold mb-1 text-accent">System</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>1.0.2</span>
                </div>
                <div className="flex justify-between">
                  <span>Theme:</span>
                  <span className="capitalize">{preferences.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio:</span>
                  <span>{preferences.audio_enabled ? 'On' : 'Off'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span>{preferences.volume}%</span>
                </div>
              </div>
            </div>
            
            {/* Status Box */}
            <div className="mt-auto">
              <div className="border border-border-subtle p-2 font-mono text-[10px] leading-tight h-32 overflow-auto">
                <div className="text-text-secondary mb-1">[SYSTEM] Settings module initialized</div>
                <div className="text-text-secondary mb-1">[CONFIG] Detected theme: {preferences.theme}</div>
                <div className="text-text-secondary mb-1">[CONFIG] Audio: {preferences.audio_enabled ? 'enabled' : 'disabled'}</div>
                <div className="text-accent mb-1">[LOAD] UI components ready</div>
                <div className="text-green-500 mb-1">[STATUS] User preferences loaded</div>
                {supabaseAvailable ? (
                  <div className="text-green-500 mb-1">[SYNC] Database connection available</div>
                ) : (
                  <div className="text-red-500 mb-1">[ERROR] Database connection failed</div>
                )}
                <div className="text-amber-500 animate-pulse">[INPUT] Awaiting user selection...</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-0">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-accent flex flex-col items-center">
                <div className="text-2xl font-mono mb-2 animate-pulse">LOADING SETTINGS...</div>
                <div className="w-32 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-accent animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
}