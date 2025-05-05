/**
 * Font Loader - Client-side font loading with validation
 * This script handles font loading efficiently and provides fallbacks
 */

(function() {
  // Force cache refresh with version parameter
  const version = new Date().getTime();
  
  // Fonts to load
  const fonts = [
    { url: '/fonts/ibm-plex-mono-latin-400-normal.woff2', family: 'IBM Plex Mono', weight: 400 },
    { url: '/fonts/ibm-plex-mono-latin-500-normal.woff2', family: 'IBM Plex Mono', weight: 500 },
    { url: '/fonts/ibm-plex-mono-latin-700-normal.woff2', family: 'IBM Plex Mono', weight: 700 },
    { url: '/fonts/jetbrains-mono-latin-400-normal.woff2', family: 'JetBrains Mono', weight: 400 },
    { url: '/fonts/Px437_IBM_VGA_8x16.woff', family: 'VGA', weight: 400 },
    { url: '/fonts/Share_Tech_Mono.woff', family: 'Share Tech Mono', weight: 400 }
  ];
  
  // Preload fonts with validation
  async function preloadFontWithValidation(fontData) {
    try {
      const { url, family, weight } = fontData;
      const fontUrl = `${url}?v=${version}`;
      
      // Check if URL is valid before trying to preload
      const response = await fetch(fontUrl, { method: 'HEAD' });
      
      // Verify this is actually a font file
      const contentType = response.headers.get('content-type');
      const isFontFile = contentType && 
        (contentType.includes('font') || 
         contentType.includes('octet-stream'));
      
      if (!response.ok || !isFontFile) {
        console.warn(`Invalid font file detected: ${fontUrl}`);
        return;
      }
      
      // Create preload link
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'preload';
      link.as = 'font';
      link.type = url.endsWith('woff2') ? 'font/woff2' : 'font/woff';
      link.crossOrigin = 'anonymous';
      
      // Force browser to fetch by adding to document
      document.head.appendChild(link);
      
      // Also add a font-face definition dynamically
      const fontFace = new FontFace(
        family, 
        `url(${fontUrl}) format('${url.endsWith('woff2') ? 'woff2' : 'woff'}')`, 
        { weight: String(weight) }
      );
      
      // Load the font and add it to the document
      try {
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
        console.log(`Font loaded: ${family} (${weight})`);
      } catch (e) {
        console.error(`Failed to load font: ${family} (${weight})`, e);
      }
    } catch (error) {
      console.error(`Error handling font:`, error);
    }
  }
  
  // Staggered loading of all fonts to prevent network congestion
  fonts.forEach((font, index) => {
    setTimeout(() => {
      preloadFontWithValidation(font);
    }, index * 100);
  });
})();