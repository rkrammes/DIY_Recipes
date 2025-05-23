/**
 * Terminal Style Fix Script
 *
 * This script ensures the terminal UI has the correct color scheme:
 * - RED headers for panel titles (SYS_STATUS, MODULE_STATISTICS, etc.)
 * - GREEN labels for data fields (UPTIME, FORMULATIONS, etc.)
 * - CYAN/BLUE values for metrics and numeric data
 * - PURPLE/MAGENTA accents for special indicators (TOTAL, USED, etc.)
 *
 * It uses both direct DOM styling and CSS class/attribute selection
 * for comprehensive coverage.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Color constants for consistency
  const COLORS = {
    RED: '#FF0000',
    RED_GLOW: 'rgba(255, 0, 0, 0.7)',
    GREEN: '#00FF00',
    GREEN_GLOW: 'rgba(0, 255, 0, 0.5)',
    CYAN: '#00FFFF',
    CYAN_GLOW: 'rgba(0, 255, 255, 0.5)',
    PURPLE: '#FF00FF',
    PURPLE_GLOW: 'rgba(255, 0, 255, 0.7)',
    WARNING: '#FFAA00',
    WARNING_GLOW: 'rgba(255, 170, 0, 0.5)'
  };

  // Text matchers for color categories
  const TEXT_MATCHERS = {
    // Headers - RED
    headers: [
      'SYS_STATUS', 'MODULE_STATISTICS', 'LIVE_SYSTEM_LOG', 'COMMANDS',
      'DASHBOARD', 'FORMULA LIST', 'SYSTEM COMMANDS', 'SYSTEM STATUS',
      'SYSTEM RESOURCES', 'RECENT ACTIVITY', 'ELEMENTS'
    ],

    // Labels - GREEN
    labels: [
      'UPTIME:', 'DB_CONN:', 'API:', 'CPU:', 'MEMORY:', 'CACHE:', 'NET:',
      'FORMULATIONS:', 'INGREDIENTS:', 'MODULES:', 'FORMULA COUNT', 'ELEMENTS',
      'CATEGORIES', 'ACTIVE:', 'F1:', 'F2:', 'F3:', 'F10:', 'DATE', 'ACTIVITY',
      'FORMULA', 'STATUS', 'VERSION:', 'SESS_ID:'
    ],

    // Accents - PURPLE/MAGENTA
    accents: [
      'TOTAL:', 'USED:', 'ALLOC:', 'TOTAL', 'USED', 'ALLOC'
    ],

    // Values - CYAN (auto-detected based on context)
  };

  // CSS to inject into the document head
  function injectCSS() {
    const style = document.createElement('style');
    style.id = 'terminal-color-fix-styles';
    style.textContent = `
      /* RED HEADERS */
      .terminal-panel-title,
      .section-title,
      h1.text-accent, h2.text-accent, h3.text-accent,
      [data-text="SYS_STATUS"],
      [data-text="MODULE_STATISTICS"],
      [data-text="LIVE_SYSTEM_LOG"],
      [data-text="COMMANDS"],
      [data-text="RECENT_ACTIVITY"],
      [data-text="SYSTEM_STATUS"],
      [data-text="SYSTEM_RESOURCES"],
      .kraftTerminalPanel .terminal-heading,
      .section-header,
      .panel-title {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 10px ${COLORS.RED_GLOW} !important;
        font-weight: bold !important;
        letter-spacing: 0.1em !important;
      }

      /* GREEN LABELS */
      .stat-label,
      .stats-label,
      .resource-label,
      .text-text-secondary,
      th,
      [data-label],
      .kraftTerminalPanel span:first-child,
      .log-active,
      .log-success,
      .value-positive,
      .terminal-badge-success,
      .status-active {
        color: ${COLORS.GREEN} !important;
        text-shadow: 0 0 8px ${COLORS.GREEN_GLOW} !important;
      }

      /* CYAN/BLUE VALUES */
      .stat-value,
      .stats-value,
      .resource-value,
      .value-text,
      [data-value],
      .activity-type,
      .log-highlight,
      .terminal-vga,
      .terminal-metrics-grid div,
      .table-value,
      .terminal-time span {
        color: ${COLORS.CYAN} !important;
        text-shadow: 0 0 8px ${COLORS.CYAN_GLOW} !important;
      }

      /* PURPLE/MAGENTA ACCENTS */
      .resource-accent,
      .accent-text,
      .total-value,
      .used-value,
      [data-value="total"],
      [data-value="used"],
      [data-value="alloc"],
      .log-network {
        color: ${COLORS.PURPLE} !important;
        text-shadow: 0 0 8px ${COLORS.PURPLE_GLOW} !important;
        font-weight: bold !important;
      }

      /* WARNINGS */
      .log-warning,
      .warning-text,
      .terminal-badge-warning,
      .status-warning {
        color: ${COLORS.WARNING} !important;
        text-shadow: 0 0 8px ${COLORS.WARNING_GLOW} !important;
      }

      /* ERRORS */
      .log-error,
      .error-text,
      .terminal-badge-error,
      .status-error,
      .error {
        color: ${COLORS.RED} !important;
        text-shadow: 0 0 8px ${COLORS.RED_GLOW} !important;
      }
    `;
    document.head.appendChild(style);
    console.log('[TERMINAL-STYLE-FIX] Injected CSS color overrides');
  }

  // Add data attributes to key elements for better CSS targeting
  function addDataAttributes() {
    // Add data attributes to header elements
    document.querySelectorAll('h1, h2, h3, .terminal-panel-title, .section-title').forEach(el => {
      const text = el.textContent?.trim();
      if (text && !el.hasAttribute('data-text')) {
        el.setAttribute('data-text', text.replace(/\s+/g, '_'));
      }
    });

    // Add data attributes to label elements
    document.querySelectorAll('.text-text-secondary, th').forEach(el => {
      const text = el.textContent?.trim();
      if (text && !el.hasAttribute('data-label')) {
        const label = text.replace(':', '').trim().toLowerCase();
        el.setAttribute('data-label', label);
      }
    });

    // Find value elements that follow labels
    document.querySelectorAll('[data-label]').forEach(label => {
      const nextEl = label.nextElementSibling;
      if (nextEl && !nextEl.hasAttribute('data-value')) {
        nextEl.setAttribute('data-value', label.getAttribute('data-label'));
      }
    });

    console.log('[TERMINAL-STYLE-FIX] Added data attributes to elements');
  }

  // Apply direct styling to elements based on text content
  function applyTerminalColors() {
    // All text-containing elements in the document
    const allElements = document.querySelectorAll('*');

    allElements.forEach(el => {
      const text = el.textContent?.trim();
      if (!text) return;

      // HEADERS - RED
      if (TEXT_MATCHERS.headers.some(header => text.includes(header))) {
        el.style.color = COLORS.RED;
        el.style.textShadow = `0 0 10px ${COLORS.RED_GLOW}`;
        el.style.fontWeight = 'bold';
      }

      // LABELS - GREEN
      else if (TEXT_MATCHERS.labels.some(label => text.includes(label))) {
        el.style.color = COLORS.GREEN;
        el.style.textShadow = `0 0 8px ${COLORS.GREEN_GLOW}`;
      }

      // ACCENTS - PURPLE/MAGENTA
      else if (TEXT_MATCHERS.accents.some(accent => text.includes(accent))) {
        el.style.color = COLORS.PURPLE;
        el.style.textShadow = `0 0 8px ${COLORS.PURPLE_GLOW}`;
      }

      // VALUES - Detect values that follow labels
      if (el.previousElementSibling) {
        const prevText = el.previousElementSibling.textContent?.trim();
        if (prevText && TEXT_MATCHERS.labels.some(label => prevText.includes(label))) {
          el.style.color = COLORS.CYAN;
          el.style.textShadow = `0 0 8px ${COLORS.CYAN_GLOW}`;
        }
      }

      // Activity status values
      if (text === 'COMPLETE') {
        el.style.color = COLORS.GREEN;
        el.style.textShadow = `0 0 8px ${COLORS.GREEN_GLOW}`;
      } else if (text === 'IN_PROGRESS') {
        el.style.color = COLORS.WARNING;
        el.style.textShadow = `0 0 8px ${COLORS.WARNING_GLOW}`;
      }
    });

    // Special case for resource bars
    document.querySelectorAll('.resource-bar .resource-fill').forEach(el => {
      el.style.backgroundColor = COLORS.CYAN;
      el.style.boxShadow = `0 0 5px ${COLORS.CYAN_GLOW}`;
    });

    console.log('[TERMINAL-STYLE-FIX] Applied direct element coloring');
  }

  // Target panel headers specifically for RED color
  function fixPanelHeaders() {
    // Panel headers in terminal UI
    document.querySelectorAll('.terminal-panel-title, .section-title, h1, h2, h3').forEach(el => {
      const classes = el.classList;
      // Skip elements with specific coloring classes
      if (classes.contains('error') || classes.contains('warning') ||
          classes.contains('value-text') || classes.contains('stats-value')) {
        return;
      }

      // Apply RED coloring to panel headers
      el.style.color = COLORS.RED;
      el.style.textShadow = `0 0 10px ${COLORS.RED_GLOW}`;
      el.style.fontWeight = 'bold';
      el.style.letterSpacing = '0.1em';
    });

    console.log('[TERMINAL-STYLE-FIX] Fixed panel headers coloring');
  }

  // Fix terminal tables to match the color scheme
  function fixTerminalTables() {
    // Table headers - GREEN
    document.querySelectorAll('th').forEach(el => {
      el.style.color = COLORS.GREEN;
      el.style.textShadow = `0 0 8px ${COLORS.GREEN_GLOW}`;
      el.style.fontWeight = 'bold';
    });

    // Table data - text cells remain GREEN, numeric values CYAN
    document.querySelectorAll('td').forEach(el => {
      const text = el.textContent?.trim();
      // If cell contains mostly numbers or special values, make it CYAN
      if (text && /^\d+(\.\d+)?(\s*\w+)?$/.test(text) ||
          text === 'COMPLETE' || text === 'IN_PROGRESS' ||
          text === 'VERIFIED' || text === 'TESTING') {
        el.style.color = COLORS.CYAN;
        el.style.textShadow = `0 0 8px ${COLORS.CYAN_GLOW}`;
      }
    });

    console.log('[TERMINAL-STYLE-FIX] Fixed terminal tables');
  }

  // Initialize all fixes
  function init() {
    console.log('[TERMINAL-STYLE-FIX] Initializing terminal color fixes');

    // Apply all fixes
    injectCSS();
    addDataAttributes();
    applyTerminalColors();
    fixPanelHeaders();
    fixTerminalTables();

    // Set up a mutation observer to catch dynamic content
    const observer = new MutationObserver(function(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-apply only necessary adjustments for new nodes
          addDataAttributes();
          applyTerminalColors();
          fixPanelHeaders();
          fixTerminalTables();
        }
      }
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[TERMINAL-STYLE-FIX] Terminal color fixes initialized and observer started');
  }

  // Start initialization
  init();
});