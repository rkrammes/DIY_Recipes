/**
 * Terminal UI Components for DIY Recipes
 * 
 * This file provides JavaScript utilities and component creation
 * functions to support the retro terminal UI aesthetic.
 */

const TerminalUI = {
  /**
   * Initialize terminal UI effects and behaviors
   */
  init() {
    // Apply terminal theme
    document.documentElement.setAttribute('data-theme', 'terminal-mono');
    
    // Initialize terminal effects
    this.initTerminalEffects();
    
    // Initialize typewriter text effect
    this.initTypewriterEffects();
    
    // Initialize terminal cursor effect
    this.initCursorEffect();
    
    console.log('[TERMINAL UI] Initialized');
  },
  
  /**
   * Initialize global terminal visual effects
   */
  initTerminalEffects() {
    // Add terminal background with scanlines to main content area
    const mainContent = document.querySelector('.content-grid');
    if (mainContent) {
      // Create terminal background element
      const terminalBg = document.createElement('div');
      terminalBg.className = 'terminal-background';
      terminalBg.innerHTML = '<div class="terminal-scanlines"></div>';
      
      // Insert at top of main content
      mainContent.prepend(terminalBg);
    }
    
    // Add flicker effect to terminal headers
    const terminalHeaders = document.querySelectorAll('.terminal-header');
    terminalHeaders.forEach(header => {
      header.classList.add('terminal-flicker');
    });
  },
  
  /**
   * Initialize typewriter text effects for terminal outputs
   */
  initTypewriterEffects() {
    const typewriterElements = document.querySelectorAll('.terminal-typewriter');
    
    typewriterElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      element.classList.add('terminal-cursor');
      
      let i = 0;
      const typeSpeed = element.getAttribute('data-type-speed') || 50;
      
      // Type text character by character
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typeInterval);
          element.classList.remove('terminal-cursor');
        }
      }, typeSpeed);
    });
  },
  
  /**
   * Initialize cursor blinking effect
   */
  initCursorEffect() {
    const cursorElements = document.querySelectorAll('.terminal-cursor');
    cursorElements.forEach(element => {
      // Already handled by CSS, just ensure the class is applied
      if (!element.classList.contains('terminal-cursor')) {
        element.classList.add('terminal-cursor');
      }
    });
  },
  
  /**
   * Create a terminal button element
   * 
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler function
   * @param {Object} options - Additional button options
   * @returns {HTMLElement} - The button element
   */
  createButton(text, onClick, options = {}) {
    const button = document.createElement('button');
    button.className = 'terminal-button';
    button.textContent = text;
    
    if (options.type) {
      button.classList.add(`terminal-button-${options.type}`);
    }
    
    if (options.size) {
      button.classList.add(`terminal-button-${options.size}`);
    }
    
    if (options.icon) {
      const icon = document.createElement('span');
      icon.className = 'terminal-button-icon';
      icon.textContent = options.icon;
      button.prepend(icon);
    }
    
    button.addEventListener('click', onClick);
    
    return button;
  },
  
  /**
   * Create a terminal panel/card element
   * 
   * @param {string} title - Panel title
   * @param {HTMLElement|string} content - Panel content
   * @param {Object} options - Additional panel options
   * @returns {HTMLElement} - The panel element
   */
  createPanel(title, content, options = {}) {
    const panel = document.createElement('div');
    panel.className = 'terminal-panel';
    
    if (options.type) {
      panel.classList.add(`terminal-panel-${options.type}`);
    }
    
    // Add panel title
    const titleElement = document.createElement('div');
    titleElement.className = 'terminal-panel-title';
    titleElement.textContent = title;
    panel.appendChild(titleElement);
    
    // Add panel content
    const contentElement = document.createElement('div');
    contentElement.className = 'terminal-panel-content';
    
    if (typeof content === 'string') {
      contentElement.innerHTML = content;
    } else {
      contentElement.appendChild(content);
    }
    
    panel.appendChild(contentElement);
    
    return panel;
  },
  
  /**
   * Create a terminal table for data display
   * 
   * @param {Array<string>} headers - Table header cells
   * @param {Array<Array<string>>} rows - Table row data
   * @param {Object} options - Additional table options
   * @returns {HTMLElement} - The table element
   */
  createTable(headers, rows, options = {}) {
    const table = document.createElement('table');
    table.className = 'terminal-table';
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body with rows
    const tbody = document.createElement('tbody');
    
    rows.forEach(row => {
      const tr = document.createElement('tr');
      
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // Add selectable rows functionality if specified
    if (options.selectable) {
      const tableRows = tbody.querySelectorAll('tr');
      tableRows.forEach(tr => {
        tr.addEventListener('click', () => {
          // Remove active class from all rows
          tableRows.forEach(row => row.classList.remove('active'));
          
          // Add active class to clicked row
          tr.classList.add('active');
          
          // Call selection callback if provided
          if (typeof options.onSelect === 'function') {
            const rowData = Array.from(tr.querySelectorAll('td')).map(td => td.textContent);
            options.onSelect(rowData, tr);
          }
        });
      });
    }
    
    return table;
  },
  
  /**
   * Create a status light indicator
   * 
   * @param {string} status - Status type (active, standby, error)
   * @param {string} label - Optional label text
   * @returns {HTMLElement} - The status light element
   */
  createStatusLight(status, label) {
    const container = document.createElement('div');
    container.className = 'terminal-status-container';
    
    const light = document.createElement('span');
    light.className = `terminal-status-light terminal-status-${status}`;
    container.appendChild(light);
    
    if (label) {
      const labelElement = document.createElement('span');
      labelElement.className = 'terminal-status-label';
      labelElement.textContent = label;
      container.appendChild(labelElement);
    }
    
    return container;
  },
  
  /**
   * Create a terminal progress bar
   * 
   * @param {number} value - Current progress value (0-100)
   * @param {Object} options - Additional progress bar options
   * @returns {HTMLElement} - The progress bar element
   */
  createProgressBar(value, options = {}) {
    const container = document.createElement('div');
    container.className = 'terminal-progress';
    
    const bar = document.createElement('div');
    bar.className = 'terminal-progress-bar';
    bar.style.width = `${value}%`;
    container.appendChild(bar);
    
    if (options.label) {
      const labelElement = document.createElement('div');
      labelElement.className = 'terminal-progress-label';
      labelElement.textContent = options.label;
      container.appendChild(labelElement);
    }
    
    // Method to update progress value
    container.updateProgress = (newValue) => {
      bar.style.width = `${newValue}%`;
    };
    
    return container;
  },
  
  /**
   * Create a terminal form input with label
   * 
   * @param {string} label - Input label
   * @param {string} type - Input type (text, number, etc.)
   * @param {Object} attributes - Additional input attributes
   * @returns {HTMLElement} - The input container element
   */
  createInput(label, type = 'text', attributes = {}) {
    const container = document.createElement('div');
    container.className = 'terminal-input-container';
    
    // Create label
    const labelElement = document.createElement('label');
    labelElement.className = 'terminal-label';
    labelElement.textContent = label;
    container.appendChild(labelElement);
    
    // Create input
    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.type = type;
    
    // Add all provided attributes
    Object.entries(attributes).forEach(([key, value]) => {
      input.setAttribute(key, value);
    });
    
    container.appendChild(input);
    
    return container;
  },
  
  /**
   * Create a terminal badge/tag
   * 
   * @param {string} text - Badge text
   * @param {string} type - Badge type (success, warning, error)
   * @returns {HTMLElement} - The badge element
   */
  createBadge(text, type) {
    const badge = document.createElement('span');
    badge.className = 'terminal-badge';
    
    if (type) {
      badge.classList.add(`terminal-badge-${type}`);
    }
    
    badge.textContent = text;
    
    return badge;
  },
  
  /**
   * Create a typewriter text effect element
   * 
   * @param {string} text - The text to type
   * @param {number} speed - Typing speed in milliseconds
   * @returns {HTMLElement} - The typewriter element
   */
  createTypewriter(text, speed = 50) {
    const element = document.createElement('div');
    element.className = 'terminal-typewriter';
    element.textContent = text;
    element.setAttribute('data-type-speed', speed);
    
    // The actual typewriter effect will be applied when initTypewriterEffects is called
    
    return element;
  }
};

// Initialize terminal UI when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  TerminalUI.init();
});

export default TerminalUI;