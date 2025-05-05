import React from 'react';
import FontPreloader from './FontPreloader';

/**
 * A client-side wrapper component that handles font preloading
 * This component should be rendered with 'use client' directive
 */
export default function ClientFontsWrapper() {
  // Version parameter forces browser to refresh cached fonts
  const version = new Date().getTime();
  
  // Define fonts to preload
  const fonts = [
    // IBM Plex Mono fonts with version parameter to force fresh loads
    `/fonts/ibm-plex-mono-latin-400-normal.woff2?v=${version}`,
    `/fonts/ibm-plex-mono-latin-500-normal.woff2?v=${version}`,
    `/fonts/ibm-plex-mono-latin-700-normal.woff2?v=${version}`,
    
    // Additional fonts
    `/fonts/jetbrains-mono-latin-400-normal.woff2?v=${version}`,
    `/fonts/Px437_IBM_VGA_8x16.woff?v=${version}`,
    `/fonts/Share_Tech_Mono.woff?v=${version}`
  ];
  
  return (
    <>
      <FontPreloader fontUrls={fonts} />
      <style jsx global>{`
        /* Font fallback strategy */
        body {
          font-family: 
            'IBM Plex Mono', 
            'JetBrains Mono',
            'Share Tech Mono', 
            'Courier New', 
            monospace;
        }
        
        /* Ensure fonts are loaded with proper display strategy */
        @font-face {
          font-family: 'IBM Plex Mono';
          src: url('/fonts/ibm-plex-mono-latin-400-normal.woff2?v=${version}') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'IBM Plex Mono';
          src: url('/fonts/ibm-plex-mono-latin-500-normal.woff2?v=${version}') format('woff2');
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'IBM Plex Mono';
          src: url('/fonts/ibm-plex-mono-latin-700-normal.woff2?v=${version}') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'JetBrains Mono';
          src: url('/fonts/jetbrains-mono-latin-400-normal.woff2?v=${version}') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'VGA';
          src: url('/fonts/Px437_IBM_VGA_8x16.woff?v=${version}') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Share Tech Mono';
          src: url('/fonts/Share_Tech_Mono.woff?v=${version}') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </>
  );
}