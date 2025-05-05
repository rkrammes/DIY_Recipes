'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from "@/providers/ConsolidatedThemeProvider";
import { FixedAnimationProvider } from "@/providers/FixedAnimationProvider";
import { AudioProvider } from "@/providers/AudioProvider";
import { ClientFonts } from "@/components/ClientFonts";
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthStatus from "@/components/auth/AuthStatus";
import { SettingsOverlay } from "@/components/SettingsOverlay";
import McpAuthProvider from "@/providers/McpAuthProvider";
import { HackerTreeNavigation } from "@/components/HackerTreeNavigation";

/**
 * Console-style layout that follows sci-fi retro-futuristic aesthetic
 * with different styling for each theme.
 */
export function ConsoleLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  // Track mounted state to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Determine which components to use based on environment
  const isDevelopment = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
  const useMcpComponents = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MCP_ENABLED === 'true';
  
  // Set mounted state after initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    }
  }, []);
  
  // Don't render client components during SSR to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="grid-background h-screen w-full fixed -z-10 opacity-10"></div>
        <div className="container mx-auto p-4">
          <div className="py-16">
            <div className="w-full h-8 bg-surface-2 animate-pulse rounded mb-4"></div>
            <div className="w-2/3 h-4 bg-surface-2 animate-pulse rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-surface-2 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // The actual content with the console layout
  const content = (
    <ThemeProvider>
      <AudioProvider>
        <FixedAnimationProvider>
          <ClientFonts />
          <ConsoleDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            {children}
          </ConsoleDashboard>
        </FixedAnimationProvider>
      </AudioProvider>
    </ThemeProvider>
  );
  
  // Conditionally wrap in MCP provider only when needed
  return useMcpComponents ? (
    <McpAuthProvider>
      {content}
    </McpAuthProvider>
  ) : content;
}

// The Dashboard component with console-style UI
function ConsoleDashboard({ 
  children,
  sidebarOpen,
  setSidebarOpen 
}: { 
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { value: themeContext } = useTheme();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const [timeString, setTimeString] = useState('00:00:00');
  const [dateString, setDateString] = useState('0000-00-00');
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString());
      setDateString(now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Determine which theme styles to use
  const themeStyle = themeContext?.theme === 'dystopia' || themeContext?.theme === 'terminal-mono'
    ? 'terminal'
    : themeContext?.theme === 'neotopia' || themeContext?.theme === 'paper-ledger'
      ? 'paper'
      : 'synthwave';
  
  // Navigation links with icons - simplified to only core functionality
  const navLinks = [
    { path: '/', label: 'Recipes', icon: '📋' },
    { path: '/ingredients', label: 'Ingredients', icon: '🧪' },
    // Removed unnecessary sections: Theme Demo, Integrations, Database, Auth, Docs
  ];
  
  return (
    <div className={`min-h-screen flex flex-col bg-surface-0 text-text ${
      themeStyle === 'terminal' 
        ? 'terminal-scanlines font-terminal terminal-text' 
        : themeStyle === 'paper' 
          ? 'paper-texture font-mono' 
          : 'grid-background font-mono'
    }`}>
      {/* Theme-specific background effects */}
      <div className="theme-background" aria-hidden="true"></div>
      
      {/* Top navigation bar */}
      <header className={`border-b border-border-subtle ${
        themeStyle === 'terminal' 
          ? 'bg-surface-1/95' 
          : themeStyle === 'paper' 
            ? 'bg-surface-1/90' 
            : 'bg-surface-1/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {/* Logo and title */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-md transition-colors ${
                themeStyle === 'terminal' 
                  ? 'hover:bg-text-primary/20' 
                  : themeStyle === 'paper' 
                    ? 'hover:bg-surface-2' 
                    : 'hover:bg-accent/20'
              }`}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            
            <Link href="/" className={`text-xl font-semibold ${
              themeStyle === 'terminal' 
                ? 'text-text-primary animation-flicker terminal-text' 
                : themeStyle === 'paper' 
                  ? 'text-text-primary text-emboss font-medium' 
                  : 'text-text-primary text-shadow-glow display-text'
            }`}>
              DIY <span className="text-accent">Recipes</span> <span className="text-sm ml-1 opacity-70">v1.0</span>
            </Link>
          </div>
          
          {/* System stats and user */}
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 text-sm ${
              themeStyle === 'terminal' 
                ? 'text-text-secondary' 
                : themeStyle === 'paper' 
                  ? 'text-text-secondary' 
                  : 'text-text-secondary'
            }`}>
              <span>{dateString}</span>
              <span className={themeStyle === 'terminal' ? 'cursor-blink' : ''}>{timeString}</span>
            </div>
            <div className="h-8 border-l border-border-subtle mx-2" />
            <AuthStatus />
          </div>
        </div>
      </header>
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar navigation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '16rem', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-r border-border-subtle overflow-y-auto ${
                themeStyle === 'terminal' 
                  ? 'bg-surface-1/95' 
                  : themeStyle === 'paper' 
                    ? 'bg-surface-1/90' 
                    : 'bg-surface-1/80 backdrop-blur-sm'
              }`}
            >
              {/* Use our new hacker-style tree navigation */}
              <HackerTreeNavigation />
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <div className={`rounded-lg border ${
            themeStyle === 'terminal' 
              ? 'border-text-primary/30' 
              : themeStyle === 'paper' 
                ? 'border-border-subtle shadow-md' 
                : 'border-accent/30 shadow-[0_0_15px_rgba(0,0,0,0.1)]'
          } overflow-hidden h-full`}>
            {/* Content header bar */}
            <div className={`py-2 px-4 border-b border-border-subtle ${
              themeStyle === 'terminal' 
                ? 'bg-surface-1/90'
                : themeStyle === 'paper' 
                  ? 'bg-surface-1/80' 
                  : 'bg-surface-1/70 backdrop-blur-sm'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    themeStyle === 'terminal' 
                      ? 'bg-text-primary animation-flicker' 
                      : themeStyle === 'paper' 
                        ? 'bg-accent' 
                        : 'bg-accent animate-pulse'
                  }`}></span>
                  <h1 className="text-sm font-medium uppercase">
                    {pathname === '/' 
                      ? 'Recipe Management' 
                      : pathname.split('/')[1].replace(/-/g, ' ').toUpperCase()}
                  </h1>
                </div>
                <div className="text-xs text-text-secondary opacity-70">
                  {themeStyle === 'terminal' && 'TERMINAL MODE'} 
                  {themeStyle === 'paper' && 'DOCUMENT VIEW'} 
                  {themeStyle === 'synthwave' && 'SYNTHWAVE INTERFACE'}
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className={`p-1 bg-surface-0 overflow-auto h-[calc(100%-40px)]`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}