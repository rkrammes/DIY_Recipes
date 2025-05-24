"use client";

import React, { ReactNode } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import ModuleNavigation from '../ModuleNavigation';
import { ModuleProvider } from '@/lib/modules/moduleContext';
import { initializeModules } from '@/modules';

interface ModularLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * ModularLayout - Core layout component for the application
 * 
 * This layout initializes the module system and provides a consistent
 * structure with optional navigation, header, and footer.
 */
export default function ModularLayout({
  children,
  showNavigation = true,
  showHeader = true,
  showFooter = true
}: ModularLayoutProps) {
  const { theme } = useTheme();
  
  // Initialize all modules when the layout mounts
  React.useEffect(() => {
    initializeModules();
  }, []);
  
  return (
    <ModuleProvider>
      <div className={`min-h-screen flex flex-col ${theme}`}>
        {/* Header */}
        {showHeader && (
          <header className="bg-surface-1 border-b border-border-subtle py-2 px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">DIY Formulations</h1>
              <div className="flex items-center space-x-4">
                <button className="px-2 py-1 rounded hover:bg-surface-2">
                  Settings
                </button>
                <button className="px-2 py-1 rounded hover:bg-surface-2">
                  Help
                </button>
              </div>
            </div>
          </header>
        )}
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation */}
          {showNavigation && <ModuleNavigation />}
          
          {/* Content */}
          <main className="flex-1 overflow-auto bg-surface-0">
            {children}
          </main>
        </div>
        
        {/* Footer */}
        {showFooter && (
          <footer className="bg-surface-1 border-t border-border-subtle py-2 px-4 text-sm">
            <div className="flex justify-between items-center">
              <div>DIY Formulations {new Date().getFullYear()}</div>
              <div>Version 1.0</div>
            </div>
          </footer>
        )}
      </div>
    </ModuleProvider>
  );
}