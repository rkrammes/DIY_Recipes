'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from "@/providers/ConsolidatedThemeProvider";
import { FixedAnimationProvider } from "@/providers/FixedAnimationProvider";
import { AudioProvider } from "@/providers/AudioProvider";
import { ClientFonts } from "@/components/ClientFonts";
import { SettingsOverlay } from "@/components/SettingsOverlay";
import Navigation from "@/components/Navigation";
import McpNavigation from "@/components/McpNavigation";
import McpAuthProvider from "@/providers/McpAuthProvider";

/**
 * This fixed layout component resolves server stability issues
 * by organizing providers in a hierarchy that avoids circular dependencies
 * and properly manages browser APIs.
 */
export function FixedLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  // Track mounted state to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);
  
  // Determine which components to use based on environment
  const isDevelopment = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
  const useMcpComponents = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MCP_ENABLED === 'true';
  
  // Set mounted state after initial render
  // This ensures we only render client components after hydration
  useEffect(() => {
    // Use requestAnimationFrame to ensure we're in the browser environment
    // and the DOM is fully available
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
        <div className="container mx-auto p-4">
          {/* 
            We render a minimal SSR-safe version of the content
            that will be replaced with the full version during hydration.
            This ensures we don't access browser APIs during SSR.
          */}
          <div className="py-16">
            <div className="w-full h-8 bg-surface-2 animate-pulse rounded mb-4"></div>
            <div className="w-2/3 h-4 bg-surface-2 animate-pulse rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-surface-2 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Choose the appropriate components based on environment
  // Only do this client-side to avoid hydration mismatches
  const NavComponent = useMcpComponents ? McpNavigation : Navigation;
  
  // Render MCP wrapper only when explicitly enabled
  const content = (
    /* 
      Provider hierarchy is critical for stability:
      1. ThemeProvider - Fundamental provider with no circular dependencies
      2. AudioProvider - Uses theme via DOM attributes, not imports
      3. AnimationProvider - Also uses theme via DOM attributes
    */
    <ThemeProvider>
      <AudioProvider>
        <FixedAnimationProvider>
          <ClientFonts />
          <div className="fixed top-4 right-4 z-50">
            <SettingsOverlay />
          </div>
          <div className="flex flex-col min-h-screen">
            <NavComponent />
            <main className="flex-1">
              {children}
            </main>
            <footer className="py-4 text-center text-sm opacity-70">
              <p>DIY Recipes - Modern Implementation</p>
            </footer>
          </div>
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