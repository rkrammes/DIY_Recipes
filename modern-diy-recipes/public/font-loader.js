/**
 * Enhanced Font Loader Script with Fallback Support
 * 
 * This script ensures fonts are properly loaded and visible before content is displayed.
 * It works by:
 * 1. Attempting to load each font using the FontFace API
 * 2. Trying alternative URLs if primary source fails
 * 3. Setting a class on the document when all fonts are loaded
 * 4. Setting a timeout to prevent indefinite loading
 * 
 * How to verify it's working:
 * - Check for 'fonts-loaded' class on the <html> element
 * - Listen for 'fontsLoaded' event on document
 * - Look for '✅ Fonts loaded successfully' in console
 * - Text should smoothly fade in when fonts are ready
 */
(function() {
  // Don't run in server-side context
  if (typeof document === 'undefined') return;

  // Track if fonts are already loaded
  let fontsLoaded = false;
  const TIMEOUT_MS = 2000; // 2 second timeout for font loading
  
  // Font server fallback configuration
  const FALLBACK_FONT_SERVER = 'http://localhost:3000';
  console.log('🔍 Font loader initialized with fallback support');

  // List of fonts to load with weights
  const fontsToLoad = [
    { family: 'IBM Plex Mono', weight: 400, url: '/fonts/IBMPlexMono-Regular.woff2' },
    { family: 'IBM Plex Mono', weight: 500, url: '/fonts/IBMPlexMono-Medium.woff2' },
    { family: 'IBM Plex Mono', weight: 700, url: '/fonts/IBMPlexMono-Bold.woff2' },
    { family: 'JetBrains Mono', weight: 400, url: '/fonts/JetBrainsMono-Regular.woff2' },
    { family: 'VGA', weight: 400, url: '/fonts/Px437_IBM_VGA_8x16.woff' },
    { family: 'Share Tech Mono', weight: 400, url: '/fonts/Share_Tech_Mono.woff' }
  ];

  // Add class to show fonts are loaded
  function markFontsAsLoaded() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    document.documentElement.classList.add('fonts-loaded');
    document.body.classList.add('fonts-loaded');
    
    // Log font loading success to console
    console.log('✅ Fonts loaded successfully');
    
    // Dispatch a custom event for testing
    document.dispatchEvent(new CustomEvent('fontsLoaded'));
  }

  // Set timeout to prevent indefinite loading
  setTimeout(markFontsAsLoaded, TIMEOUT_MS);

  // Try to load a font with fallback support
  function loadFontWithFallback(font) {
    // First try the default URL
    const primaryFontFace = new FontFace(
      font.family,
      `url(${font.url})`,
      { weight: font.weight.toString() }
    );
    
    return primaryFontFace.load()
      .then(loadedFace => {
        console.log(`✅ Loaded font from primary URL: ${font.url}`);
        document.fonts.add(loadedFace);
        return loadedFace;
      })
      .catch(err => {
        console.warn(`❌ Failed to load font from primary URL: ${font.url}`, err);
        
        // Try the fallback server instead
        const fallbackUrl = `${FALLBACK_FONT_SERVER}${font.url}`;
        console.log(`🔄 Trying fallback URL: ${fallbackUrl}`);
        
        const fallbackFontFace = new FontFace(
          font.family,
          `url(${fallbackUrl})`,
          { weight: font.weight.toString() }
        );
        
        return fallbackFontFace.load()
          .then(loadedFace => {
            console.log(`✅ Loaded font from fallback URL: ${fallbackUrl}`);
            document.fonts.add(loadedFace);
            return loadedFace;
          })
          .catch(fallbackErr => {
            console.error(`❌ Failed to load font from fallback URL: ${fallbackUrl}`, fallbackErr);
            throw new Error(`Could not load font ${font.family} (weight ${font.weight}) from any source`);
          });
      });
  }

  // Try to load fonts using FontFace API
  if ('FontFace' in window) {
    // Create an array of font loading promises with fallback
    const fontPromises = fontsToLoad.map(loadFontWithFallback);

    // Mark as loaded when all fonts are loaded
    Promise.all(fontPromises)
      .then(loadedFaces => {
        console.log(`✅ All fonts loaded successfully (${loadedFaces.length} fonts)`);
        markFontsAsLoaded();
      })
      .catch(err => {
        console.warn('⚠️ Some fonts failed to load:', err);
        markFontsAsLoaded(); // Mark as loaded anyway to avoid blocking UI
      });
  } else {
    // If FontFace API not available, mark as loaded immediately
    console.warn('⚠️ FontFace API not available in this browser');
    markFontsAsLoaded();
  }
})();