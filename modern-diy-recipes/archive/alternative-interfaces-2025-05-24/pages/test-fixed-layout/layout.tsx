import type { Metadata } from "next";
import { ThemeProvider } from "../../providers/ConsolidatedThemeProvider";
import { FixedAnimationProvider } from "../../providers/FixedAnimationProvider";
import { AudioProvider } from "../../providers/AudioProvider";
import { AuthProvider } from "../../providers/AuthProvider";
import ThemeScript from "../../components/ThemeScript";
import "../../styles/tokens.css";
import "../../styles/animations.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "DIY Recipes - Fixed Layout",
  description: "Testing fixed providers to resolve conflicts",
};

export default function FixedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ThemeScript />
      </head>
      <body
        className="antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <div className="theme-background" aria-hidden="true" />
        {/* 
          The key changes here:
          1. AuthProvider first - it has no dependencies
          2. FixedThemeProvider second - it's the most fundamental provider
          3. AudioProvider and FixedAnimationProvider after - they use theme but don't modify it
          
          This removes the circular dependencies that were causing issues
        */}
        <AuthProvider>
          <ThemeProvider>
            {/* 
              The AudioProvider uses ThemeProvider's theme via data-theme attribute
              rather than direct import, breaking the circular dependency
            */}
            <AudioProvider>
              {/* 
                The FixedAnimationProvider gets theme from data-theme attribute
                rather than a direct import
              */}
              <FixedAnimationProvider>
                <main className="flex-1">
                  {children}
                </main>
              </FixedAnimationProvider>
            </AudioProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}