'use client';

import React, { useState, useEffect } from 'react';
import { SimpleThemeProvider } from "../providers/SimpleThemeProvider";
import { ClientFonts } from "../components/ClientFonts";
import { SettingsOverlay } from "../components/SettingsOverlay";
import Navigation from "../components/Navigation";

interface MinimalLayoutProps {
  children: React.ReactNode;
}

/**
 * This is a minimal layout with only essential functionality
 * Used as a fallback to ensure server stability in production
 */
export function MinimalLayout({ children }: MinimalLayoutProps) {
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Server-side rendering fallback
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <SimpleThemeProvider>
      <ClientFonts />
      <div className="fixed top-4 right-4 z-50">
        <SettingsOverlay />
      </div>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="py-6 text-center text-sm opacity-70">
          <p>DIY Recipes - Modern Implementation</p>
        </footer>
      </div>
    </SimpleThemeProvider>
  );
}