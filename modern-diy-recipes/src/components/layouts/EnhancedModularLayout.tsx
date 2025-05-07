"use client";

import React, { ReactNode, useEffect } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import DynamicModuleNavigation from '../DynamicModuleNavigation';
import { initializeModules } from '@/modules';

interface EnhancedModularLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  navVariant?: 'sidebar' | 'terminal' | 'minimal';
  className?: string;
}

/**
 * EnhancedModularLayout - Advanced layout component with theme integration
 * 
 * This layout provides a themed, modular interface with configurable components
 * and dynamic navigation based on the module registry.
 */
export default function EnhancedModularLayout({
  children,
  showNavigation = true,
  showHeader = true,
  showFooter = true,
  navVariant = 'terminal',
  className = ''
}: EnhancedModularLayoutProps) {
  const { theme, setTheme, audioEnabled } = useTheme();
  
  // Initialize modules
  useEffect(() => {
    initializeModules();
  }, []);

  // Render a themed header based on the current theme
  const renderHeader = () => {
    if (!showHeader) return null;
    
    if (navVariant === 'terminal') {
      return (
        <header className="bg-surface-1 border-b border-border-subtle py-1 px-2 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* ASCII logo */}
              <div className="font-bold text-base tracking-tight whitespace-nowrap">
                <div className="text-accent">
                  ┌───────────────────────────┐<br />
                  │ <span className="animate-pulse">></span>DIY FORMULATIONS v2.0   │<br />
                  └───────────────────────────┘
                </div>
              </div>
            </div>
            
            {/* Theme controls */}
            <div className="border border-border-subtle p-1 bg-surface-0">
              <div className="text-accent font-bold text-xs mb-1">╔═ THEME ═╗</div>
              
              <div className="grid grid-cols-1 text-xs gap-y-1 mb-1">
                <div 
                  onClick={() => setTheme('hackers')}
                  className="flex items-center cursor-pointer group"
                >
                  <span className={`mr-1 font-bold ${theme === 'hackers' ? 'text-emerald-500 animate-pulse' : 'text-text-secondary'}`}>
                    {theme === 'hackers' ? '[X]' : '[ ]'}
                  </span>
                  <span className={`${theme === 'hackers' ? 'text-emerald-500' : 'text-text-secondary group-hover:text-accent'}`}>
                    HACKERS
                  </span>
                </div>
                
                <div 
                  onClick={() => setTheme('dystopia')}
                  className="flex items-center cursor-pointer group"
                >
                  <span className={`mr-1 font-bold ${theme === 'dystopia' ? 'text-amber-500 animate-pulse' : 'text-text-secondary'}`}>
                    {theme === 'dystopia' ? '[X]' : '[ ]'}
                  </span>
                  <span className={`${theme === 'dystopia' ? 'text-amber-500' : 'text-text-secondary group-hover:text-accent'}`}>
                    DYSTOPIA
                  </span>
                </div>
                
                <div 
                  onClick={() => setTheme('neotopia')}
                  className="flex items-center cursor-pointer group"
                >
                  <span className={`mr-1 font-bold ${theme === 'neotopia' ? 'text-blue-500 animate-pulse' : 'text-text-secondary'}`}>
                    {theme === 'neotopia' ? '[X]' : '[ ]'}
                  </span>
                  <span className={`${theme === 'neotopia' ? 'text-blue-500' : 'text-text-secondary group-hover:text-accent'}`}>
                    NEOTOPIA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }
    
    // Standard header
    return (
      <header className="bg-white border-b py-2 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">DIY Formulations</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Theme:</span>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-2 py-1 border rounded"
              >
                <option value="hackers">Hackers</option>
                <option value="dystopia">Dystopia</option>
                <option value="neotopia">Neotopia</option>
              </select>
            </div>
            <button className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
              Settings
            </button>
          </div>
        </div>
      </header>
    );
  };
  
  // Render a themed footer based on the current theme
  const renderFooter = () => {
    if (!showFooter) return null;
    
    if (navVariant === 'terminal') {
      return (
        <footer className="bg-surface-1 border-t border-border-subtle py-1 px-2 font-mono text-xs">
          <div className="flex justify-between items-center">
            <div className="text-text-secondary">
              DIY_FORMULATIONS_PLATFORM v2.0 | <span className="text-accent">MODULAR_SYSTEM</span>
            </div>
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">THEME:</span>
              <span className="text-accent uppercase">{theme}</span>
              <span className="text-accent animate-pulse ml-2">_</span>
            </div>
          </div>
        </footer>
      );
    }
    
    // Standard footer
    return (
      <footer className="bg-white border-t py-2 px-4 text-sm">
        <div className="flex justify-between items-center">
          <div>DIY Formulations {new Date().getFullYear()}</div>
          <div>Version 2.0 | Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</div>
        </div>
      </footer>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme} ${className}`}>
      {renderHeader()}
      
      <div className="flex flex-1 overflow-hidden">
        {showNavigation && (
          <DynamicModuleNavigation variant={navVariant} />
        )}
        
        <main className="flex-1 overflow-auto bg-surface-0">
          {children}
        </main>
      </div>
      
      {renderFooter()}
    </div>
  );
}