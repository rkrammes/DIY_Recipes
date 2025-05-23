'use client';

import '../styles/terminal-header-footer.css';
import '../styles/exact-layout-match.css';
import ThemeScript from '@/components/ThemeScript';
import { FixedThemeProvider } from '@/providers/FixedThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { UserPreferencesProvider } from '@/Settings/providers/UserPreferencesProvider';
import { ThemeAdapter } from '@/Settings/adapters/ThemeAdapter';
import { ModuleProvider } from '@/lib/modules/moduleContext';
import ClientFontsWrapper from '@/components/ClientFontsWrapper';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Apply direct style injection to fix header and footer colors
  useEffect(() => {
    // Get all elements in the document
    const elements = document.querySelectorAll('*');
    
    // Function to apply colors based on text content
    const applyColorsByText = () => {
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (!text) return;
        
        // Panel titles (red)
        if (text === 'SYS_STATUS' || text === 'MODULE_STATISTICS' || 
            text === 'LIVE_SYSTEM_LOG' || text === 'COMMANDS') {
          el.setAttribute('style', 'color: #FF0000 !important; text-shadow: 0 0 5px rgba(255, 0, 0, 0.5) !important;');
          el.classList.add('panel-title');
        }
        
        // Labels (green)
        if (text === 'UPTIME:' || text === 'DB_CONN:' || text === 'API:' ||
            text === 'FORMULATIONS:' || text === 'INGREDIENTS:' || text === 'MODULES:') {
          el.setAttribute('style', 'color: #00FF00 !important; text-shadow: 0 0 5px rgba(0, 255, 0, 0.5) !important;');
          el.classList.add('label-text');
        }
        
        // Special values (purple)
        if (text === 'TOTAL:' || text === 'USED:') {
          el.setAttribute('style', 'color: #FF00FF !important; text-shadow: 0 0 5px rgba(255, 0, 255, 0.5) !important;');
          el.classList.add('accent-text');
        }
      });
    };
    
    // Apply colors immediately
    applyColorsByText();
    
    // Apply colors whenever the DOM changes
    const observer = new MutationObserver(() => {
      applyColorsByText();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    
    // Clean up the observer
    return () => observer.disconnect();
  }, []);
  
  // Add inline styles for immediate application
  const inlineStyles = `
    /* Panel titles in RED */
    .panel-title, 
    [data-text="SYS_STATUS"], 
    [data-text="MODULE_STATISTICS"],
    [data-text="LIVE_SYSTEM_LOG"],
    [data-text="COMMANDS"] {
      color: #FF0000 !important;
      text-shadow: 0 0 5px rgba(255, 0, 0, 0.5) !important;
    }
    
    /* Labels in GREEN */
    .label-text,
    [data-label="uptime"],
    [data-label="formulations"],
    [data-label="ingredients"],
    [data-label="modules"],
    [data-label="db_conn"],
    [data-label="api"] {
      color: #00FF00 !important;
      text-shadow: 0 0 5px rgba(0, 255, 0, 0.5) !important;
    }
    
    /* Values in CYAN */
    .value-text,
    [data-value="uptime"],
    [data-value="formulations"],
    [data-value="ingredients"],
    [data-value="modules"],
    [data-value="db_conn"],
    [data-value="api"] {
      color: #00FFFF !important;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.5) !important;
    }
    
    /* Accents in PURPLE */
    .accent-text,
    [data-value="total"],
    [data-value="used"] {
      color: #FF00FF !important;
      text-shadow: 0 0 5px rgba(255, 0, 255, 0.5) !important;
    }
  `;

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
        {/* Inline styles for immediate effect */}
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      </head>
      <body className="antialiased bg-background text-foreground font-body" suppressHydrationWarning>
        <div className="theme-background" aria-hidden="true"></div>
        <div className="theme-loading" style={{ visibility: 'hidden' }}></div>
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