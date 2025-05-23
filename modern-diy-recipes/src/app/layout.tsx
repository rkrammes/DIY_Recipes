import './globals.css';
import ThemeScript from '@/components/ThemeScript';
import { FixedThemeProvider } from '@/providers/FixedThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { UserPreferencesProvider } from '@/Settings/providers/UserPreferencesProvider';
import { ThemeAdapter } from '@/Settings/adapters/ThemeAdapter';
import { ModuleProvider } from '@/lib/modules/moduleContext';
import ClientFontsWrapper from '@/components/ClientFontsWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ThemeScript />
        {/* Preload fonts */}
        <link
          rel="preload"
          href="/fonts/JetBrainsMono-Regular.woff2?v=2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Px437_IBM_VGA_8x16.woff?v=2"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Share_Tech_Mono.woff?v=2"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-background text-foreground font-body" suppressHydrationWarning>
        <div className="theme-background" aria-hidden="true"></div>
        <FixedThemeProvider>
          <AuthProvider>
            <UserPreferencesProvider>
              <ThemeAdapter>
                <ModuleProvider>
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