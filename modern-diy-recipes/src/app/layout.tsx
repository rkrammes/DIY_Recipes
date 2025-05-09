import type { Metadata } from "next";
import ThemeScript from "../components/ThemeScript";
import { AuthProvider } from "../providers/AuthProvider";
import { FixedThemeProvider } from "../providers/FixedThemeProvider";
import ClientFontsWrapper from "../components/ClientFontsWrapper";
import { ModuleProvider } from "../lib/modules/moduleContext";
import { UserPreferencesProvider } from "../Settings/providers/UserPreferencesProvider";
import { ThemeAdapter } from "../Settings/adapters/ThemeAdapter";
import "./globals.css";
import "../styles/inline-fonts.css";

export const metadata: Metadata = {
  title: "KRAFT_AI",
  description: "KRAFT_AI - Advanced recipe formulation and tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * This root layout uses a console-style layout for sci-fi retro-futuristic UI.
   * It imports client-side components dynamically to avoid SSR issues.
   * It also provides the Module Registry to all components via ModuleProvider.
   */
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* ThemeScript runs before React hydration to prevent flicker */}
        <ThemeScript />
        {/* Preload working font files only - IBM Plex Mono fonts are broken */}
        <link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2?v=2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Px437_IBM_VGA_8x16.woff?v=2" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Share_Tech_Mono.woff?v=2" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body
        className="antialiased bg-background text-foreground font-body"
        suppressHydrationWarning
      >
        <div className="theme-background" aria-hidden="true" />
        <FixedThemeProvider>
          <AuthProvider>
            <UserPreferencesProvider>
              <ThemeAdapter>
                <ModuleProvider>
                  {/* Pass children directly, TripleColumnLayout will be applied in page.tsx */}
                  {children}
                </ModuleProvider>
              </ThemeAdapter>
            </UserPreferencesProvider>
          </AuthProvider>
        </FixedThemeProvider>
        <ClientFontsWrapper />
      </body>
    </html>
  );
}