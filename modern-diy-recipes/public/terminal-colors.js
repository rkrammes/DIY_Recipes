/**
 * Terminal Colors - Minimal Color-Only Fix
 * 
 * This script ONLY fixes the color scheme of the terminal UI without changing any layout:
 * - RED headers for panel titles (SYS_STATUS, MODULE_STATISTICS, etc.)
 * - GREEN labels for data fields (UPTIME, FORMULATIONS, etc.) 
 * - CYAN/BLUE values for metrics and numeric data
 * - PURPLE/MAGENTA accents for special indicators (TOTAL, USED, etc.)
 */

document.addEventListener('DOMContentLoaded', function() {
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
    'SYS_STATUS', 'MODULE_STATISTICS', 'LIVE_SYSTEM_LOG', 'COMMANDS',
    'SYSTEM STATUS', 'SYSTEM COMMANDS', 'SYSTEM RESOURCES', 'RECENT ACTIVITY'
  ];
  
  // Labels to look for (GREEN)
  const LABELS = [
    'UPTIME:', 'DB_CONN:', 'CPU:', 'MEMORY:', 'API:', 'FORMULATIONS:',
    'INGREDIENTS:', 'MODULES:', 'F1:', 'F2:', 'F3:', 'F10:', 'CACHE:'
  ];
  
  // Accents to look for (PURPLE)
  const ACCENTS = [
    'TOTAL', 'USED', 'ALLOC', 'TOTAL:', 'USED:', 'ALLOC:'
  ];
  
  // Apply CSS using a style element for better compatibility
  function injectColorCSS() {
    const style = document.createElement('style');
    style.innerHTML = `
      /* RED headers for panel titles */
      .section-title,
      .terminal-heading,
      .panel-title,
      .terminal-panel-title,
      [data-text="SYS_STATUS"],
      [data-text="MODULE_STATISTICS"],
      [data-text="LIVE_SYSTEM_LOG"],
      [data-text="COMMANDS"],
      .footer-panel-title,
      .SYS_STATUS,
      .MODULE_STATISTICS,
      .LIVE_SYSTEM_LOG,
      .COMMANDS {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 10px ${COLORS.RED_GLOW} !important;
        font-weight: bold !important;
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
      [data-label="api"] {
        color: ${COLORS.GREEN} !important;
        text-shadow: 0 0 8px ${COLORS.GREEN_GLOW} !important;
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
      .activity-type {
        color: ${COLORS.CYAN} !important;
        text-shadow: 0 0 8px ${COLORS.CYAN_GLOW} !important;
      }

      /* PURPLE/MAGENTA accents for special indicators */
      .resource-accent,
      .accent-text,
      [data-value="total"],
      [data-value="used"],
      [data-value="alloc"],
      .panel-accent {
        color: ${COLORS.PURPLE} !important;
        text-shadow: 0 0 8px ${COLORS.PURPLE_GLOW} !important;
        font-weight: bold !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply colors directly to elements based on content
  function applyContentBasedColors() {
    document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, p, th, td').forEach(el => {
      const text = el.textContent?.trim();
      if (!text) return;
      
      // RED panel titles
      if (PANEL_TITLES.some(title => text === title)) {
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
    });
  }
  
  // Monitor the DOM for changes and reapply color styling
  function observeDOM() {
    const observer = new MutationObserver(() => {
      applyContentBasedColors();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Apply our styling
  injectColorCSS();
  applyContentBasedColors();
  observeDOM();
});