// Terminal Layout Fix Script
// This script injects styles and layout fixes directly into the DOM

document.addEventListener('DOMContentLoaded', function() {
  // Function to inject styles
  function injectStyles() {
    // Create a style element
    const style = document.createElement('style');
    
    // Define the styles
    style.textContent = `
      /* Main layout for original terminal style */
      body {
        background-color: #000000 !important;
        color: #00FF00 !important;
        margin: 0;
        padding: 0;
        font-family: 'Courier New', monospace !important;
      }
      
      /* Header with system title and status */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #004400;
        background-color: #000000;
      }
      
      /* Three column layout */
      .main-content {
        display: grid;
        grid-template-columns: 200px 1fr 250px;
        height: calc(100vh - 80px);
      }
      
      /* Footer panels with stat info */
      .footer {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        padding: 10px;
        background-color: #000000;
        border-top: 1px solid #004400;
      }
      
      /* Each panel in the footer */
      .footer-panel {
        border: 1px solid #006600;
        background-color: #001100;
        padding: 8px;
      }
      
      /* RED headers for panels */
      .footer-panel-title {
        color: #FF0000 !important;
        border-bottom: 1px dashed #006600;
        padding-bottom: 3px;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      /* Specific layout for stats */
      .stat-pair {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      /* GREEN labels */
      .panel-label {
        color: #00FF00 !important;
      }
      
      /* CYAN values */
      .panel-value {
        color: #00FFFF !important;
      }
      
      /* PURPLE/MAGENTA accents */
      .panel-accent {
        color: #FF00FF !important;
      }
      
      /* Force the layout */
      [data-terminal="footer"] {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 10px !important;
        padding: 10px !important;
        background-color: #000000 !important;
        border-top: 1px solid #004400 !important;
      }
      
      /* Force RED for all footer panel titles */
      [data-panel="sys-status"] .terminal-heading,
      [data-panel="module-statistics"] .terminal-heading,
      [data-panel="live-system-log"] .terminal-heading,
      [data-panel="commands"] .terminal-heading {
        color: #FF0000 !important;
        text-shadow: 0 0 5px rgba(255, 0, 0, 0.5) !important;
      }
      
      /* No theme changes */
      .hackers [data-panel="sys-status"] .terminal-heading,
      .hackers [data-panel="module-statistics"] .terminal-heading,
      .hackers [data-panel="live-system-log"] .terminal-heading,
      .hackers [data-panel="commands"] .terminal-heading {
        color: #FF0000 !important;
      }
      
      /* Force the explicit color scheme */
      .SYS_STATUS, 
      .MODULE_STATISTICS,
      .LIVE_SYSTEM_LOG,
      .COMMANDS {
        color: #FF0000 !important;
      }
    `;
    
    // Add the styles to the document
    document.head.appendChild(style);
  }
  
  // Run the injection
  injectStyles();
  
  // Apply direct color fix to panel headers
  function fixPanelColors() {
    // Find all heading elements that might contain the panel titles
    document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6').forEach(el => {
      const text = el.textContent?.trim();
      
      // Check for exact matches
      if (text === 'SYS_STATUS' || text === 'MODULE_STATISTICS' || 
          text === 'LIVE_SYSTEM_LOG' || text === 'COMMANDS') {
        el.style.color = '#FF0000';
        el.style.textShadow = '0 0 5px rgba(255, 0, 0, 0.5)';
        el.style.fontWeight = 'bold';
      }
      
      // Check for exact label matches
      if (text === 'UPTIME:' || text === 'DB_CONN:' || text === 'CPU:' || 
          text === 'MEMORY:' || text === 'FORMULATIONS:' || text === 'INGREDIENTS:' || 
          text === 'MODULES:' || text === 'F1:' || text === 'F2:' || 
          text === 'F3:' || text === 'F10:') {
        el.style.color = '#00FF00';
      }
      
      // Check for accent matches
      if (text === 'TOTAL:' || text === 'USED:') {
        el.style.color = '#FF00FF';
      }
    });
  }
  
  // Fix colors initially
  fixPanelColors();
  
  // Create a mutation observer to fix colors when DOM changes
  const observer = new MutationObserver(fixPanelColors);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
});