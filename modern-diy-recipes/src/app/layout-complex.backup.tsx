'use client';

import '../styles/terminal-header-footer.css';
import '../styles/exact-layout-match.css';
import '../styles/recipe-terminal.css';
import '../styles/footer-panel-fix.css';
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
  
  // Add inline styles for immediate application - RED headers, GREEN labels, CYAN values, PURPLE accents
  const inlineStyles = `
    /* RED headers for panel titles */
    .section-title,
    .terminal-heading,
    .panel-title,
    .terminal-panel-title,
    [data-text="SYS_STATUS"],
    [data-text="MODULE_STATISTICS"],
    [data-text="LIVE_SYSTEM_LOG"],
    [data-text="COMMANDS"],
    [data-text="SYSTEM_STATUS"],
    [data-text="SYSTEM_COMMANDS"],
    [data-text="SYSTEM_RESOURCES"],
    [data-text="RECENT_ACTIVITY"],
    .footer-panel-title,
    .SYS_STATUS,
    .MODULE_STATISTICS,
    .LIVE_SYSTEM_LOG,
    .COMMANDS {
      color: #FF0000 !important;
      text-shadow: 0 0 10px rgba(255, 0, 0, 0.7) !important;
      font-weight: bold !important;
      letter-spacing: 0.1em !important;
    }

    /* GREEN labels for data fields */
    .stat-label,
    .stats-label,
    .resource-label,
    .label-text,
    .text-text-secondary,
    [data-label="uptime"],
    [data-label="formulations"],
    [data-label="ingredients"],
    [data-label="modules"],
    [data-label="db_conn"],
    [data-label="api"],
    .UPTIME\\:,
    .DB_CONN\\:,
    .CPU\\:,
    .MEMORY\\:,
    .CACHE\\:,
    .FORMULATIONS\\:,
    .INGREDIENTS\\:,
    .MODULES\\:,
    .F1\\:,
    .F2\\:,
    .F3\\:,
    .F10\\:,
    .terminal-table th {
      color: #00FF00 !important;
      text-shadow: 0 0 8px rgba(0, 255, 0, 0.5) !important;
      font-weight: bold !important;
    }

    /* CYAN/BLUE values for metrics */
    .stat-value,
    .stats-value,
    .resource-value,
    .value-text,
    [data-value="uptime"],
    [data-value="formulations"],
    [data-value="ingredients"],
    [data-value="modules"],
    [data-value="db_conn"],
    [data-value="api"],
    .panel-value,
    .activity-type,
    .terminal-vga {
      color: #00FFFF !important;
      text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
    }

    /* PURPLE/MAGENTA accents for special indicators */
    .resource-accent,
    .accent-text,
    [data-value="total"],
    [data-value="used"],
    [data-value="alloc"],
    .panel-accent,
    .TOTAL\\:,
    .USED\\:,
    .ALLOC\\:,
    .TOTAL,
    .USED,
    .ALLOC {
      color: #FF00FF !important;
      text-shadow: 0 0 8px rgba(255, 0, 255, 0.7) !important;
      font-weight: bold !important;
    }

    /* Force all elements to use monospace font */
    .kraftTerminalPanel,
    .terminal-panel,
    [data-terminal],
    [data-panel],
    .terminal-monospace {
      font-family: 'IBM Plex Mono', 'JetBrains Mono', 'Courier New', monospace !important;
    }

    /* Make all panel titles RED regardless of theme */
    .hackers .terminal-heading,
    .dystopia .terminal-heading,
    .neotopia .terminal-heading,
    .hackers .section-title,
    .dystopia .section-title,
    .neotopia .section-title,
    .hackers [data-panel] h3,
    .dystopia [data-panel] h3,
    .neotopia [data-panel] h3 {
      color: #FF0000 !important;
      text-shadow: 0 0 10px rgba(255, 0, 0, 0.7) !important;
      font-weight: bold !important;
      letter-spacing: 0.1em !important;
    }

    /* Style for text content that exactly matches these strings */
    span:contains("SYS_STATUS"),
    div:contains("SYS_STATUS"),
    span:contains("MODULE_STATISTICS"),
    div:contains("MODULE_STATISTICS"),
    span:contains("LIVE_SYSTEM_LOG"),
    div:contains("LIVE_SYSTEM_LOG"),
    span:contains("COMMANDS"),
    div:contains("COMMANDS"),
    span:contains("SYSTEM COMMANDS"),
    div:contains("SYSTEM COMMANDS"),
    span:contains("SYSTEM STATUS"),
    div:contains("SYSTEM STATUS"),
    span:contains("SYSTEM RESOURCES"),
    div:contains("SYSTEM RESOURCES"),
    span:contains("RECENT ACTIVITY"),
    div:contains("RECENT ACTIVITY") {
      color: #FF0000 !important;
      text-shadow: 0 0 10px rgba(255, 0, 0, 0.7) !important;
      font-weight: bold !important;
    }

    /* Style for the exact matches of these labels */
    span:contains("UPTIME:"),
    div:contains("UPTIME:"),
    span:contains("DB_CONN:"),
    div:contains("DB_CONN:"),
    span:contains("CPU:"),
    div:contains("CPU:"),
    span:contains("MEMORY:"),
    div:contains("MEMORY:"),
    span:contains("CACHE:"),
    div:contains("CACHE:"),
    span:contains("FORMULATIONS:"),
    div:contains("FORMULATIONS:"),
    span:contains("INGREDIENTS:"),
    div:contains("INGREDIENTS:"),
    span:contains("MODULES:"),
    div:contains("MODULES:") {
      color: #00FF00 !important;
      text-shadow: 0 0 8px rgba(0, 255, 0, 0.5) !important;
      font-weight: bold !important;
    }

    /* Style for the exact matches of these accent terms */
    span:contains("TOTAL:"),
    div:contains("TOTAL:"),
    span:contains("USED:"),
    div:contains("USED:"),
    span:contains("ALLOC:"),
    div:contains("ALLOC:") {
      color: #FF00FF !important;
      text-shadow: 0 0 8px rgba(255, 0, 255, 0.7) !important;
      font-weight: bold !important;
    }

    /* Panel styling */
    .kraftTerminalPanel,
    [data-panel] {
      background-color: #000000 !important;
      border: 1px solid #004400 !important;
      background-image:
        linear-gradient(rgba(0, 68, 0, 0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 68, 0, 0.8) 1px, transparent 1px) !important;
      background-size: 20px 20px !important;
    }

    /* Resource bars */
    .resource-bar {
      background-color: rgba(0, 68, 0, 0.5) !important;
      border: 1px solid #004400 !important;
    }

    .resource-fill {
      background-color: #00FFFF !important;
      box-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
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
        {/* Terminal style fix scripts */}
        <script src="/fix-only-colors.js"></script>
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