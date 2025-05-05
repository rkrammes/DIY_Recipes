'use client';

import { useEffect } from 'react';

export default function Fonts() {
  useEffect(() => {
    // We'll create a new style element for better versioning and caching
    const uniqueId = `font-styles-${Date.now()}`;
    const style = document.createElement('style');
    style.id = uniqueId;
    
    // Add @font-face declarations with version query parameters to force reload
    // Skip IBM Plex Mono fonts as they're currently broken
    style.textContent = `
      /* Don't include IBM Plex Mono fonts as they are currently broken */
      
      @font-face {
        font-family: 'JetBrains Mono';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/JetBrainsMono-Regular.woff2?v=2') format('woff2');
      }
      
      @font-face {
        font-family: 'Px437 IBM VGA';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/Px437_IBM_VGA_8x16.woff?v=2') format('woff');
      }
      
      @font-face {
        font-family: 'Share Tech Mono';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/Share_Tech_Mono.woff?v=2') format('woff');
      }
      
      /* Add fallback font stacks for IBM Plex Mono since it's broken */
      .font-mono,
      [data-theme="neotopia"] .font-mono,
      [data-theme="paper-ledger"] .font-mono {
        font-family: Consolas, 'Courier New', monospace !important;
      }
      
      /* Use fallbacks for IBM Plex Mono in theme variables */
      :root {
        --font-mono: Consolas, 'Courier New', monospace;
      }
      
      [data-theme="neotopia"] {
        --font-body: Consolas, 'Courier New', monospace;
        --font-heading: Consolas, 'Courier New', monospace;
        --font-mono: Consolas, 'Courier New', monospace;
        --font-display: Consolas, 'Courier New', monospace;
        --font-terminal: Consolas, 'Courier New', monospace;
      }
      
      [data-theme="paper-ledger"] {
        --font-body: Consolas, 'Courier New', monospace;
        --font-heading: Consolas, 'Courier New', monospace;
        --font-mono: Consolas, 'Courier New', monospace;
        --font-display: Consolas, 'Courier New', monospace;
        --font-terminal: Consolas, 'Courier New', monospace;
      }
    `;
    
    // Remove any existing font style tags
    const existingStyleTags = document.head.querySelectorAll('style[id^="font-styles-"]');
    existingStyleTags.forEach(tag => {
      try {
        document.head.removeChild(tag);
      } catch (e) {
        console.warn('Error removing font style tag:', e);
      }
    });
    
    // Add the new style element
    document.head.appendChild(style);
    
    // Optionally preload fonts with JavaScript - but only the working ones
    const preloadFonts = () => {
      const fontFiles = [
        '/fonts/JetBrainsMono-Regular.woff2?v=2',
        '/fonts/Px437_IBM_VGA_8x16.woff?v=2',
        '/fonts/Share_Tech_Mono.woff?v=2'
      ];
      
      fontFiles.forEach(fontUrl => {
        try {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = fontUrl;
          link.as = 'font';
          link.type = fontUrl.endsWith('woff2') ? 'font/woff2' : 'font/woff';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        } catch (e) {
          console.warn(`Error preloading font ${fontUrl}:`, e);
        }
      });
    };
    
    preloadFonts();
    
    return () => {
      try {
        const styleTag = document.getElementById(uniqueId);
        if (styleTag) {
          document.head.removeChild(styleTag);
        }
      } catch (e) {
        console.warn('Error cleaning up font styles:', e);
      }
    };
  }, []);
  
  return null;
}