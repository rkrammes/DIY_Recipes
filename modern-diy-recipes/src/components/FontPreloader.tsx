'use client';

import { useEffect } from 'react';

/**
 * Component that preloads all fonts using link preload tags and Font Loading API
 * This helps avoid FOUT (Flash of Unstyled Text) and font loading errors
 */
export default function FontPreloader() {
  // Add font preload links to the document head
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Function to load a font with version parameter and better error handling
    const preloadFontWithFallback = async (url: string) => {
      try {
        // Function to check if a font URL is valid (actually returns font data)
        const checkFontUrl = async (fontUrl: string): Promise<boolean> => {
          try {
            const response = await fetch(fontUrl, { method: 'HEAD' });
            return response.ok && response.headers.get('content-type')?.includes('font');
          } catch (error) {
            console.warn(`Error checking font URL ${fontUrl}:`, error);
            return false;
          }
        };

        // Only create preload link if URL is valid
        const isValid = await checkFontUrl(url);
        if (!isValid) {
          console.warn(`Skipping invalid font URL: ${url}`);
          return;
        }

        // Add version parameter to force cache refresh
        const versionedUrl = `${url}?v=2`;
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = versionedUrl;
        link.as = 'font';
        link.type = url.endsWith('woff2') ? 'font/woff2' : 'font/woff';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        // Try to use the Font Loading API as well for more reliable loading
        if ('fonts' in document) {
          try {
            const fontName = url.includes('IBMPlexMono') 
              ? 'IBM Plex Mono' 
              : url.includes('JetBrains') 
                ? 'JetBrains Mono'
                : url.includes('Px437') 
                  ? 'Px437 IBM VGA'
                  : 'Share Tech Mono';
                  
            const fontWeight = url.includes('Bold') 
              ? '700' 
              : url.includes('Medium') 
                ? '500' 
                : '400';
                
            const fontFormat = url.endsWith('woff2') ? 'woff2' : 'woff';
            const fontDesc = `url('${versionedUrl}') format('${fontFormat}')`;
            
            // Create a font face with safe error handling
            try {
              const font = new FontFace(fontName, fontDesc, { weight: fontWeight });
              const loadedFont = await font.load();
              document.fonts.add(loadedFont);
              console.log(`Font loaded: ${fontName} ${fontWeight}`);
            } catch (fontError) {
              console.warn(`Error with FontFace API for ${url}:`, fontError);
              
              // Fallback to system fonts if loading fails
              markFontAsFailed(fontName);
            }
          } catch (error) {
            console.warn(`Error using Font Loading API for ${url}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Error preloading font ${url}:`, error);
      }
    };
    
    // Function to mark a font as failed and trigger fallback
    const markFontAsFailed = (fontFamily: string) => {
      // Add class to body to indicate this font failed
      document.body.classList.add(`font-${fontFamily.toLowerCase().replace(/\s+/g, '-')}-failed`);
      
      // Add style element to use fallbacks
      const style = document.createElement('style');
      style.textContent = `
        .font-${fontFamily.toLowerCase().replace(/\s+/g, '-')}-failed .font-${fontFamily.toLowerCase().replace(/\s+/g, '-')} {
          font-family: ${getFallbackFontString(fontFamily)} !important;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Define fallback font stacks for each font
    const getFallbackFontString = (fontFamily: string): string => {
      switch(fontFamily) {
        case 'IBM Plex Mono':
          return 'Consolas, "Courier New", monospace';
        case 'JetBrains Mono':
          return 'Consolas, "Courier New", monospace';
        case 'Px437 IBM VGA':
          return '"Courier New", monospace';
        case 'Share Tech Mono':
          return 'monospace';
        default:
          return 'monospace';
      }
    };
    
    // Create preload links for all font files with version parameter
    const fontFiles = [
      '/fonts/IBMPlexMono-Regular.woff2',
      '/fonts/IBMPlexMono-Medium.woff2',
      '/fonts/IBMPlexMono-Bold.woff2',
      '/fonts/JetBrainsMono-Regular.woff2',
      '/fonts/Px437_IBM_VGA_8x16.woff',
      '/fonts/Share_Tech_Mono.woff',
    ];
    
    // Preload all fonts concurrently
    fontFiles.forEach(url => preloadFontWithFallback(url));
    
    // Add a style element for font-face declarations with version parameters
    try {
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'IBM Plex Mono';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/IBMPlexMono-Regular.woff2?v=3') format('woff2');
        }
        
        @font-face {
          font-family: 'IBM Plex Mono';
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url('/fonts/IBMPlexMono-Medium.woff2?v=3') format('woff2');
        }
        
        @font-face {
          font-family: 'IBM Plex Mono';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url('/fonts/IBMPlexMono-Bold.woff2?v=3') format('woff2');
        }
        
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
        
        /* Fallback stacks if font loading fails */
        .font-ibm-plex-mono-failed .font-ibm-plex-mono, 
        .font-ibm-plex-mono-failed [data-theme="neotopia"] body,
        .font-ibm-plex-mono-failed [data-theme="paper-ledger"] body {
          font-family: Consolas, "Courier New", monospace !important;
        }
      `;
      document.head.appendChild(style);
    } catch (styleError) {
      console.warn('Error adding font styles:', styleError);
    }
    
    // Add a class to body to indicate fonts are preloaded
    document.body.classList.add('fonts-preloaded');
    
  }, []);
  
  // This is a utility component that doesn't render visible content
  return null;
}