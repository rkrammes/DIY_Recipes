/**
 * Fix Only Colors Script
 * 
 * This script ONLY fixes the color scheme of the terminal UI without changing the layout:
 * - RED headers for panel titles (SYS_STATUS, MODULE_STATISTICS, etc.)
 * - GREEN labels for data fields (UPTIME, FORMULATIONS, etc.) 
 * - CYAN/BLUE values for metrics and numeric data
 * - PURPLE/MAGENTA accents for special indicators (TOTAL, USED, etc.)
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('[COLOR-FIX] Applying color-only fix to terminal UI');
  
  // Define colors
  const COLORS = {
    RED: '#FF0000',
    RED_GLOW: 'rgba(255, 0, 0, 0.7)',
    GREEN: '#00FF00',
    GREEN_GLOW: 'rgba(0, 255, 0, 0.5)',
    CYAN: '#00FFFF',
    CYAN_GLOW: 'rgba(0, 255, 255, 0.5)',
    PURPLE: '#FF00FF',
    PURPLE_GLOW: 'rgba(255, 0, 255, 0.7)'
  };
  
  // Panel titles to look for (RED)
  const PANEL_TITLES = [
    'SYS_STATUS', 'MODULE_STATISTICS', 'LIVE_SYSTEM_LOG', 'COMMANDS'
  ];
  
  // Labels to look for (GREEN)
  const LABELS = [
    'UPTIME:', 'DB_CONN:', 'CPU:', 'MEMORY:', 'API:', 'FORMULATIONS:',
    'INGREDIENTS:', 'MODULES:', 'F1:', 'F2:', 'F3:', 'F10:'
  ];
  
  // Accents to look for (PURPLE)
  const ACCENTS = [
    'TOTAL:', 'USED:'
  ];
  
  // Function to apply colors without changing any layout
  function applyColors() {
    // Find all text elements
    const textElements = document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, p');
    
    textElements.forEach(el => {
      const text = el.textContent?.trim();
      if (!text) return;
      
      // RED headers
      if (PANEL_TITLES.includes(text)) {
        el.style.color = COLORS.RED;
        el.style.textShadow = `0 0 10px ${COLORS.RED_GLOW}`;
        el.style.fontWeight = 'bold';
      }
      
      // GREEN labels
      else if (LABELS.some(label => text === label)) {
        el.style.color = COLORS.GREEN;
        el.style.textShadow = `0 0 8px ${COLORS.GREEN_GLOW}`;
        el.style.fontWeight = 'bold';
      }
      
      // PURPLE accents
      else if (ACCENTS.some(accent => text === accent)) {
        el.style.color = COLORS.PURPLE;
        el.style.textShadow = `0 0 8px ${COLORS.PURPLE_GLOW}`;
        el.style.fontWeight = 'bold';
      }
      
      // CYAN values that follow labels
      const prevSibling = el.previousElementSibling;
      if (prevSibling && LABELS.some(label => prevSibling.textContent?.trim() === label)) {
        el.style.color = COLORS.CYAN;
        el.style.textShadow = `0 0 8px ${COLORS.CYAN_GLOW}`;
      }
    });
    
    // Direct selector targeting for footer panels
    document.querySelectorAll('[data-panel="sys-status"] .terminal-heading, ' +
                             '[data-panel="module-statistics"] .terminal-heading, ' +
                             '[data-panel="live-system-log"] .terminal-heading, ' +
                             '[data-panel="commands"] .terminal-heading')
            .forEach(el => {
              el.style.color = COLORS.RED;
              el.style.textShadow = `0 0 10px ${COLORS.RED_GLOW}`;
              el.style.fontWeight = 'bold';
            });
  }
  
  // Apply simple CSS to reinforce styling
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* RED panel titles */
      [data-panel="sys-status"] .terminal-heading,
      [data-panel="module-statistics"] .terminal-heading,
      [data-panel="live-system-log"] .terminal-heading,
      [data-panel="commands"] .terminal-heading {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 10px ${COLORS.RED_GLOW} !important;
        font-weight: bold !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply colors
  applyColors();
  injectCSS();
  
  // Monitor DOM changes and reapply colors
  const observer = new MutationObserver(() => {
    applyColors();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log('[COLOR-FIX] Color fix applied without changing layout');
});