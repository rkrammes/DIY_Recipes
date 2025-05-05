/**
 * This script sets up font fallbacks for browsers when custom fonts fail to load
 */
(function() {
  // Check if fonts are loaded
  document.addEventListener('DOMContentLoaded', function() {
    const fontCheckInterval = setInterval(() => {
      if (document.fonts && document.fonts.check) {
        const ibmPlexLoaded = document.fonts.check('1em "IBM Plex Mono"');
        const jetBrainsLoaded = document.fonts.check('1em "JetBrains Mono"');
        
        if (!ibmPlexLoaded) {
          console.warn('IBM Plex Mono failed to load - using system monospace fallback');
          document.documentElement.classList.add('ibm-plex-fallback');
        }
        
        if (!jetBrainsLoaded) {
          console.warn('JetBrains Mono failed to load - using system monospace fallback');
          document.documentElement.classList.add('jetbrains-fallback');
        }
        
        // Check if all fonts have been attempted, clear interval
        if ((ibmPlexLoaded || document.documentElement.classList.contains('ibm-plex-fallback')) && 
            (jetBrainsLoaded || document.documentElement.classList.contains('jetbrains-fallback'))) {
          clearInterval(fontCheckInterval);
        }
      }
    }, 500);
    
    // Clear the interval after 5 seconds regardless
    setTimeout(() => clearInterval(fontCheckInterval), 5000);
  });
  
  // Add fallback styles
  const style = document.createElement('style');
  style.textContent = `
    .ibm-plex-fallback [data-theme="hackers"] {
      font-family: monospace !important;
    }
    
    .jetbrains-fallback [data-theme="dystopia"] {
      font-family: monospace !important;
    }
  `;
  document.head.appendChild(style);
})();