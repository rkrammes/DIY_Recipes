'use client';

import React from 'react';
import { ThemeProvider } from "@/providers/ConsolidatedThemeProvider";
import { AudioProvider } from "@/providers/AudioProvider";
import { ClientFonts } from "@/components/ClientFonts";
import { SettingsOverlay } from "@/components/SettingsOverlay";
import Navigation from "@/components/Navigation";
import McpNavigation from "@/components/McpNavigation";
import McpAuthProvider from "@/providers/McpAuthProvider";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useSupabaseMcp = process.env.NEXT_PUBLIC_USE_SUPABASE_MCP === 'true';
  
  // Use MCP components in development
  const useMcpComponents = isDevelopment;
  
  if (useMcpComponents) {
    return (
      <McpAuthProvider>
        <ThemeProvider>
          <AudioProvider>
            <ClientFonts />
            <div className="fixed top-4 right-4 z-50">
              <SettingsOverlay />
            </div>
            <div className="flex flex-col min-h-screen">
              <McpNavigation />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AudioProvider>
        </ThemeProvider>
      </McpAuthProvider>
    );
  }
  
  // Standard layout - client components only
  return (
    <ThemeProvider>
      <AudioProvider>
        <ClientFonts />
        <div className="fixed top-4 right-4 z-50">
          <SettingsOverlay />
        </div>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </AudioProvider>
    </ThemeProvider>
  );
}