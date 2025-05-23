/**
 * Terminal Layout Fix Script
 *
 * This script ensures the terminal UI has the correct color scheme:
 * - RED headers for panel titles (SYS_STATUS, MODULE_STATISTICS, etc.)
 * - GREEN labels for data fields (UPTIME, FORMULATIONS, etc.)
 * - CYAN/BLUE values for metrics and numeric data
 * - PURPLE/MAGENTA accents for special indicators (TOTAL, USED, etc.)
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('[TERMINAL-LAYOUT-FIX] Script loaded - applying color scheme');

  // Define color constants for consistency
  const COLORS = {
    // Core color scheme
    RED: '#FF0000',
    RED_GLOW: 'rgba(255, 0, 0, 0.7)',
    GREEN: '#00FF00',
    GREEN_GLOW: 'rgba(0, 255, 0, 0.5)',
    CYAN: '#00FFFF',
    CYAN_GLOW: 'rgba(0, 255, 255, 0.5)',
    PURPLE: '#FF00FF',
    PURPLE_GLOW: 'rgba(255, 0, 255, 0.7)',

    // Terminal background
    BG: '#000000',
    BORDER: '#004400'
  };

  // Function to inject terminal styles
  function injectTerminalStyles() {
    // Create a style element
    const style = document.createElement('style');

    // Define the styles
    style.textContent = `
      /* RED headers for panel titles */
      .terminal-panel-title,
      .section-title,
      .terminal-heading,
      .terminal-header h1,
      .terminal-header h2,
      .terminal-header h3,
      [data-panel="sys-status"] [data-text="SYS_STATUS"],
      [data-panel="module-statistics"] [data-text="MODULE_STATISTICS"],
      [data-panel="live-system-log"] [data-text="LIVE_SYSTEM_LOG"],
      [data-panel="commands"] [data-text="COMMANDS"] {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 10px ${COLORS.RED_GLOW} !important;
        font-weight: bold !important;
        letter-spacing: 0.1em !important;
      }

      /* GREEN labels for data fields */
      .stat-label,
      .stats-label,
      .resource-label,
      .panel-label,
      .text-text-secondary,
      [data-panel="sys-status"] [data-label="uptime"],
      [data-panel="sys-status"] [data-label="db_conn"],
      [data-panel="sys-status"] [data-label="api"],
      [data-panel="module-statistics"] [data-label="formulations"],
      [data-panel="module-statistics"] [data-label="ingredients"],
      [data-panel="module-statistics"] [data-label="modules"] {
        color: ${COLORS.GREEN} !important;
        text-shadow: 0 0 8px ${COLORS.GREEN_GLOW} !important;
        font-weight: bold !important;
      }

      /* CYAN/BLUE values for metrics and data */
      .stat-value,
      .stats-value,
      .resource-value,
      .panel-value,
      .value-text,
      [data-panel="sys-status"] [data-value="uptime"],
      [data-panel="sys-status"] [data-value="modules"],
      [data-panel="module-statistics"] [data-value="formulations"],
      [data-panel="module-statistics"] [data-value="ingredients"],
      [data-panel="module-statistics"] [data-value="modules"] {
        color: ${COLORS.CYAN} !important;
        text-shadow: 0 0 8px ${COLORS.CYAN_GLOW} !important;
      }

      /* PURPLE/MAGENTA accents for special indicators */
      .resource-accent,
      .panel-accent,
      .accent-text,
      [data-panel="module-statistics"] [data-value="total"],
      [data-panel="module-statistics"] [data-value="used"] {
        color: ${COLORS.PURPLE} !important;
        text-shadow: 0 0 8px ${COLORS.PURPLE_GLOW} !important;
        font-weight: bold !important;
      }

      /* Resource bars */
      .resource-bar {
        width: 100%;
        height: 4px;
        background-color: rgba(0, 68, 0, 0.5);
        margin-bottom: 10px;
        border: 1px solid ${COLORS.BORDER};
      }

      .resource-fill {
        height: 100%;
        background-color: ${COLORS.CYAN};
        box-shadow: 0 0 5px ${COLORS.CYAN_GLOW};
      }

      /* Panel styling */
      .kraftTerminalPanel {
        background-color: ${COLORS.BG};
        border: 1px solid ${COLORS.BORDER};
        background-image:
          linear-gradient(rgba(0, 68, 0, 0.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 68, 0, 0.8) 1px, transparent 1px);
        background-size: 20px 20px;
      }

      /* Fix for log window */
      .log-standard {
        color: ${COLORS.GREEN} !important;
      }

      .log-success, .log-highlight {
        color: ${COLORS.CYAN} !important;
        text-shadow: 0 0 5px ${COLORS.CYAN_GLOW} !important;
      }

      .log-network {
        color: ${COLORS.PURPLE} !important;
        text-shadow: 0 0 5px ${COLORS.PURPLE_GLOW} !important;
      }

      .log-error {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 5px ${COLORS.RED_GLOW} !important;
      }

      /* Force all panel titles to be RED regardless of theme */
      .hackers .terminal-heading,
      .dystopia .terminal-heading,
      .neotopia .terminal-heading {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 10px ${COLORS.RED_GLOW} !important;
      }

      /* Terminal footer layout fixes */
      [data-terminal="footer"] {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 10px !important;
        padding: 10px !important;
        background-color: ${COLORS.BG} !important;
        border-top: 1px solid ${COLORS.BORDER} !important;
      }

      /* Monospace font for better terminal look */
      .kraftTerminalPanel,
      .terminal-monospace,
      [data-terminal],
      [data-panel] {
        font-family: 'IBM Plex Mono', 'JetBrains Mono', 'Courier New', monospace !important;
      }
    `;

    // Add the styles to the document
    document.head.appendChild(style);
    console.log('[TERMINAL-LAYOUT-FIX] Terminal styles injected');
  }

  // Apply direct color fix to panel headers and add data attributes
  function applyTerminalColors() {
    // List of panel title matches
    const panelTitles = ['SYS_STATUS', 'MODULE_STATISTICS', 'LIVE_SYSTEM_LOG', 'COMMANDS',
                         'SYSTEM STATUS', 'SYSTEM COMMANDS', 'SYSTEM RESOURCES', 'RECENT ACTIVITY'];

    // List of label matches
    const labelTexts = ['UPTIME:', 'DB_CONN:', 'CPU:', 'MEMORY:', 'FORMULATIONS:', 'INGREDIENTS:',
                        'MODULES:', 'F1:', 'F2:', 'F3:', 'F10:', 'CATEGORY:', 'API:', 'VERSION:',
                        'NET:', 'CACHE:', 'TIME:', 'ACTIVE:', 'DATE', 'ACTIVITY', 'FORMULA', 'STATUS'];

    // List of accent matches
    const accentTexts = ['TOTAL:', 'USED:', 'ALLOC:', 'TOTAL', 'USED', 'ALLOC'];

    // Find all text elements that might need styling
    document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, td, th').forEach(el => {
      const text = el.textContent?.trim();
      if (!text) return;

      // Apply RED to panel titles
      if (panelTitles.some(title => text.includes(title))) {
        el.style.color = COLORS.RED;
        el.style.textShadow = `0 0 10px ${COLORS.RED_GLOW}`;
        el.style.fontWeight = 'bold';
        el.style.letterSpacing = '0.1em';

        // Add data attributes
        if (!el.hasAttribute('data-text')) {
          el.setAttribute('data-text', text.replace(/\s+/g, '_'));
        }

        // Add data-panel to parent if needed
        const parent = el.parentElement;
        if (parent && !parent.hasAttribute('data-panel')) {
          parent.setAttribute('data-panel', text.toLowerCase().replace(/\s+/g, '-'));
        }
      }

      // Apply GREEN to labels
      else if (labelTexts.some(label => text.includes(label))) {
        el.style.color = COLORS.GREEN;
        el.style.textShadow = `0 0 8px ${COLORS.GREEN_GLOW}`;
        el.style.fontWeight = 'bold';

        // Add data attribute
        if (!el.hasAttribute('data-label')) {
          const labelText = text.replace(':', '').trim().toLowerCase();
          el.setAttribute('data-label', labelText);
        }
      }

      // Apply PURPLE to accents
      else if (accentTexts.some(accent => text.includes(accent))) {
        el.style.color = COLORS.PURPLE;
        el.style.textShadow = `0 0 8px ${COLORS.PURPLE_GLOW}`;
        el.style.fontWeight = 'bold';

        // Add data attribute
        if (!el.hasAttribute('data-value')) {
          const accentText = text.replace(':', '').trim().toLowerCase();
          el.setAttribute('data-value', accentText);
        }
      }

      // Apply CYAN to values that follow labels
      const prevEl = el.previousElementSibling;
      if (prevEl && labelTexts.some(label => prevEl.textContent?.includes(label))) {
        el.style.color = COLORS.CYAN;
        el.style.textShadow = `0 0 8px ${COLORS.CYAN_GLOW}`;

        // Get label text from previous element and add as data-value
        if (!el.hasAttribute('data-value') && prevEl.hasAttribute('data-label')) {
          el.setAttribute('data-value', prevEl.getAttribute('data-label'));
        }
      }
    });

    // Fix resource bars
    document.querySelectorAll('.resource-bar .resource-fill').forEach(el => {
      el.style.backgroundColor = COLORS.CYAN;
      el.style.boxShadow = `0 0 5px ${COLORS.CYAN_GLOW}`;
    });

    console.log('[TERMINAL-LAYOUT-FIX] Applied direct terminal colors');
  }

  // Inject terminal styles
  injectTerminalStyles();

  // Apply direct colors and attributes
  applyTerminalColors();

  // Create a mutation observer to fix colors when DOM changes
  const observer = new MutationObserver(() => {
    applyTerminalColors();
  });

  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Add terminal-style-fix.js script if not already present
  if (!document.querySelector('script[src="/terminal-style-fix.js"]')) {
    const script = document.createElement('script');
    script.src = '/terminal-style-fix.js';
    script.async = true;
    document.head.appendChild(script);
    console.log('[TERMINAL-LAYOUT-FIX] Added terminal-style-fix.js script');
  }

  console.log('[TERMINAL-LAYOUT-FIX] Terminal color scheme applied');
});