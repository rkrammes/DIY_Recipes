import type { Metadata } from "next";
import ThemeScript from "../components/ThemeScript";
import { AuthProvider } from "../providers/AuthProvider";
import { FixedThemeProvider } from "../providers/FixedThemeProvider";
import ClientFontsWrapper from "../components/ClientFontsWrapper";
import "./globals.css";

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
            {/* Pass children directly, TripleColumnLayout will be applied in page.tsx */}
            {children}
          </AuthProvider>
        </FixedThemeProvider>
        <ClientFontsWrapper />
      </body>
    </html>
  );
}