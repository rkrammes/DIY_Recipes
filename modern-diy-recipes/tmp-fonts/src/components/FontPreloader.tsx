import React, { useEffect } from 'react';

interface FontPreloaderProps {
  fontUrls: string[];
}

/**
 * FontPreloader component that efficiently preloads font files
 * with validation and error handling
 */
export const FontPreloader: React.FC<FontPreloaderProps> = ({ fontUrls }) => {
  useEffect(() => {
    // Skip in SSR context
    if (typeof window === 'undefined') return;
    
    // Function to validate and load a font
    const preloadFontWithValidation = async (url: string) => {
      try {
        // Check if URL is valid before trying to preload
        const response = await fetch(url, { method: 'HEAD' });
        
        // Verify this is actually a font file
        const contentType = response.headers.get('content-type');
        const isFontFile = contentType && 
          (contentType.includes('font') || 
           contentType.includes('octet-stream'));
        
        if (!response.ok || !isFontFile) {
          console.warn(`Invalid font file detected: ${url}`);
          return;
        }
        
        // Create preload link
        const link = document.createElement('link');
        link.href = url;
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2'; // Adjust based on font type
        link.crossOrigin = 'anonymous';
        
        // Force browser to fetch by adding to document
        document.head.appendChild(link);
        
        console.log(`Font preloaded: ${url}`);
      } catch (error) {
        console.error(`Error preloading font ${url}:`, error);
      }
    };
    
    // Preload all fonts with a small delay between each
    fontUrls.forEach((url, index) => {
      setTimeout(() => {
        preloadFontWithValidation(url);
      }, index * 100); // Staggered loading to prevent network congestion
    });
    
  }, [fontUrls]);
  
  // This component doesn't render anything visible
  return null;
};

export default FontPreloader;