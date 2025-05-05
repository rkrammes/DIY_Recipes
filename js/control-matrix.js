/**
 * Control Matrix Component
 * 
 * This file implements a retro-terminal styled settings panel that
 * consolidates all menus and settings into a cohesive "Control Matrix"
 */

import DevMemory from './dev-memory.js';

// Check for MCP availability
let mcpMemory;
try {
  if (window.MemoryMCP) {
    mcpMemory = window.MemoryMCP;
  }
} catch (err) {
  console.warn('Memory MCP not available for Control Matrix, using local fallback');
}

/**
 * Control Matrix manages all settings and configuration
 */
class ControlMatrix {
  constructor() {
    this.isOpen = false;
    this.container = null;
    this.settings = {
      terminal: {
        colorScheme: 'green',
        scanlines: true,
        flicker: true,
        soundEffects: true,
        typingSpeed: 10
      },
      display: {
        fontSize: 16,
        fontFamily: 'IBM Plex Mono',
        gridBg: true,
        showStatusBar: true
      },
      system: {
        dataRefreshRate: 30,
        useMCP: true,
        useLocalStorage: true,
        debug: false
      }
    };
    
    // Try to load settings from localStorage
    this._loadSettings();
  }
  
  /**
   * Initialize the Control Matrix
   * @returns {ControlMatrix} The ControlMatrix instance
   */
  init() {
    console.log('[CONTROL-MATRIX] Initializing control matrix');
    
    // Create Control Matrix container if it doesn't exist
    if (!document.getElementById('controlMatrix')) {
      this._createControlMatrixUI();
    }
    
    // Setup event handlers
    this._setupEvents();
    
    // Apply initial settings
    this.applySettings();
    
    // Record to memory system
    if (mcpMemory) {
      mcpMemory.store('controlMatrixInitialized', true);
    } else {
      DevMemory.recordIntegrationStatus({
        service_id: 'control-matrix',
        service_name: 'Control Matrix',
        status: 'operational',
        endpoints: [
          {
            name: 'settings',
            method: 'function',
            status: 'operational'
          }
        ],
        notes: ['Control Matrix initialized using local storage']
      });
    }
    
    console.log('[CONTROL-MATRIX] Initialization complete');
    return this;
  }
  
  /**
   * Toggle the Control Matrix visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Open the Control Matrix
   */
  open() {
    if (!this.container) return;
    
    // Show the container with fade-in effect
    this.container.style.display = 'flex';
    setTimeout(() => {
      this.container.classList.add('active');
    }, 10);
    
    this.isOpen = true;
    
    // Play terminal sound if available
    if (window.terminalAudio && window.terminalAudio.playToggleSound) {
      window.terminalAudio.playToggleSound();
    }
    
    // Log to memory
    if (mcpMemory) {
      mcpMemory.store('controlMatrixState', 'open');
    }
  }
  
  /**
   * Close the Control Matrix
   */
  close() {
    if (!this.container) return;
    
    // Hide with fade-out effect
    this.container.classList.remove('active');
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 300);
    
    this.isOpen = false;
    
    // Play terminal sound if available
    if (window.terminalAudio && window.terminalAudio.playToggleSound) {
      window.terminalAudio.playToggleSound();
    }
    
    // Save settings when closing
    this._saveSettings();
    
    // Log to memory
    if (mcpMemory) {
      mcpMemory.store('controlMatrixState', 'closed');
    }
  }
  
  /**
   * Apply the current settings to the UI
   */
  applySettings() {
    // Terminal settings
    document.documentElement.setAttribute('data-terminal', this.settings.terminal.colorScheme);
    
    // Toggle scanlines
    const workspace = document.querySelector('.primary-workspace');
    if (workspace) {
      if (this.settings.terminal.scanlines) {
        workspace.classList.add('terminal-scanlines');
      } else {
        workspace.classList.remove('terminal-scanlines');
      }
    }
    
    // Toggle flicker effects
    const flickerElements = document.querySelectorAll('.terminal-flicker');
    flickerElements.forEach(el => {
      if (this.settings.terminal.flicker) {
        el.classList.add('flicker-active');
      } else {
        el.classList.remove('flicker-active');
      }
    });
    
    // Font size
    document.documentElement.style.setProperty('--terminal-font-size', `${this.settings.display.fontSize}px`);
    
    // Grid background
    if (workspace) {
      if (this.settings.display.gridBg) {
        workspace.classList.add('terminal-grid-bg');
      } else {
        workspace.classList.remove('terminal-grid-bg');
      }
    }
    
    // Status bar
    const statusBar = document.querySelector('.terminal-status-container');
    if (statusBar) {
      statusBar.style.display = this.settings.display.showStatusBar ? 'flex' : 'none';
    }
    
    // Log applied settings
    console.log('[CONTROL-MATRIX] Applied settings:', this.settings);
    
    // Update UI to reflect current settings
    this._updateControlMatrixUI();
  }
  
  /**
   * Update a specific setting
   * @param {string} category - The settings category
   * @param {string} key - The setting key
   * @param {any} value - The new value
   */
  updateSetting(category, key, value) {
    if (this.settings[category] && key in this.settings[category]) {
      this.settings[category][key] = value;
      
      // Apply the settings immediately
      this.applySettings();
      
      // Save settings to localStorage
      this._saveSettings();
      
      // Log the change
      console.log(`[CONTROL-MATRIX] Updated setting: ${category}.${key} = ${value}`);
      
      // Record to memory system
      if (mcpMemory) {
        mcpMemory.store(`setting_${category}_${key}`, value);
      }
      
      return true;
    }
    
    console.warn(`[CONTROL-MATRIX] Unknown setting: ${category}.${key}`);
    return false;
  }
  
  /**
   * Create the Control Matrix UI
   * @private
   */
  _createControlMatrixUI() {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'controlMatrix';
    this.container.className = 'terminal-control-matrix';
    this.container.style.display = 'none';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'terminal-control-content';
    
    // Header section
    const header = document.createElement('div');
    header.className = 'terminal-control-header';
    header.innerHTML = `
      <h2>CONTROL MATRIX</h2>
      <button class="terminal-close-btn">&times;</button>
    `;
    
    // Close button functionality
    header.querySelector('.terminal-close-btn').onclick = () => this.close();
    
    // Settings section
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'terminal-settings-container';
    
    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'terminal-tabs';
    
    ['TERMINAL', 'DISPLAY', 'SYSTEM'].forEach(tab => {
      const tabButton = document.createElement('button');
      tabButton.className = 'terminal-tab-button';
      tabButton.textContent = tab;
      tabButton.dataset.tab = tab.toLowerCase();
      
      tabButton.addEventListener('click', () => {
        // Deactivate all tabs
        tabs.querySelectorAll('.terminal-tab-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Activate clicked tab
        tabButton.classList.add('active');
        
        // Show corresponding panel
        settingsContainer.querySelectorAll('.terminal-settings-panel').forEach(panel => {
          panel.style.display = 'none';
        });
        
        const panel = settingsContainer.querySelector(`.terminal-settings-panel[data-panel="${tabButton.dataset.tab}"]`);
        if (panel) panel.style.display = 'block';
      });
      
      tabs.appendChild(tabButton);
    });
    
    // Create settings panels
    const panels = document.createElement('div');
    panels.className = 'terminal-settings-panels';
    
    // Terminal settings panel
    const terminalPanel = this._createSettingsPanel('terminal', [
      { type: 'select', key: 'colorScheme', label: 'COLOR SCHEME', options: [
        { value: 'green', label: 'GREEN (DEFAULT)' },
        { value: 'amber', label: 'AMBER' },
        { value: 'blue', label: 'BLUE' },
        { value: 'white', label: 'WHITE' }
      ]},
      { type: 'toggle', key: 'scanlines', label: 'SCANLINES EFFECT' },
      { type: 'toggle', key: 'flicker', label: 'FLICKER EFFECT' },
      { type: 'toggle', key: 'soundEffects', label: 'SOUND EFFECTS' },
      { type: 'range', key: 'typingSpeed', label: 'TYPING SPEED', min: 1, max: 20, step: 1 }
    ]);
    
    // Display settings panel
    const displayPanel = this._createSettingsPanel('display', [
      { type: 'range', key: 'fontSize', label: 'FONT SIZE', min: 12, max: 24, step: 1 },
      { type: 'select', key: 'fontFamily', label: 'FONT FAMILY', options: [
        { value: 'IBM Plex Mono', label: 'IBM PLEX MONO' },
        { value: 'VGA', label: 'VGA TERMINAL' },
        { value: 'monospace', label: 'MONOSPACE' }
      ]},
      { type: 'toggle', key: 'gridBg', label: 'GRID BACKGROUND' },
      { type: 'toggle', key: 'showStatusBar', label: 'SHOW STATUS BAR' }
    ]);
    
    // System settings panel
    const systemPanel = this._createSettingsPanel('system', [
      { type: 'range', key: 'dataRefreshRate', label: 'DATA REFRESH RATE (s)', min: 5, max: 60, step: 5 },
      { type: 'toggle', key: 'useMCP', label: 'USE MCP SERVICES' },
      { type: 'toggle', key: 'useLocalStorage', label: 'USE LOCAL STORAGE' },
      { type: 'toggle', key: 'debug', label: 'DEBUG MODE' }
    ]);
    
    panels.appendChild(terminalPanel);
    panels.appendChild(displayPanel);
    panels.appendChild(systemPanel);
    
    // Set first tab as active
    const firstTab = tabs.querySelector('.terminal-tab-button');
    if (firstTab) firstTab.classList.add('active');
    
    // Show first panel
    const firstPanel = panels.querySelector('.terminal-settings-panel');
    if (firstPanel) firstPanel.style.display = 'block';
    
    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'terminal-control-actions';
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'terminal-button';
    resetBtn.textContent = 'RESET DEFAULTS';
    resetBtn.onclick = () => this._resetToDefaults();
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'terminal-button terminal-button-primary';
    saveBtn.textContent = 'SAVE SETTINGS';
    saveBtn.onclick = () => {
      this._saveSettings();
      this.close();
    };
    
    actions.appendChild(resetBtn);
    actions.appendChild(saveBtn);
    
    // Assemble everything
    settingsContainer.appendChild(tabs);
    settingsContainer.appendChild(panels);
    
    content.appendChild(header);
    content.appendChild(settingsContainer);
    content.appendChild(actions);
    
    this.container.appendChild(content);
    
    // Add to document
    document.body.appendChild(this.container);
  }
  
  /**
   * Create a settings panel
   * @param {string} category - The settings category
   * @param {Array} settings - Array of setting objects
   * @private
   */
  _createSettingsPanel(category, settings) {
    const panel = document.createElement('div');
    panel.className = 'terminal-settings-panel';
    panel.dataset.panel = category;
    
    // Create each setting control
    settings.forEach(setting => {
      const controlContainer = document.createElement('div');
      controlContainer.className = 'terminal-control-item';
      
      const label = document.createElement('label');
      label.textContent = setting.label;
      controlContainer.appendChild(label);
      
      let control;
      
      switch (setting.type) {
        case 'toggle':
          control = document.createElement('div');
          control.className = 'terminal-toggle-switch';
          
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = this.settings[category][setting.key];
          input.id = `${category}-${setting.key}`;
          input.className = 'terminal-checkbox';
          
          input.addEventListener('change', () => {
            this.updateSetting(category, setting.key, input.checked);
          });
          
          const slider = document.createElement('span');
          slider.className = 'terminal-slider';
          
          control.appendChild(input);
          control.appendChild(slider);
          
          const status = document.createElement('span');
          status.className = 'terminal-status-text';
          status.textContent = this.settings[category][setting.key] ? 'ON' : 'OFF';
          
          input.addEventListener('change', () => {
            status.textContent = input.checked ? 'ON' : 'OFF';
          });
          
          controlContainer.appendChild(control);
          controlContainer.appendChild(status);
          break;
          
        case 'select':
          control = document.createElement('select');
          control.className = 'terminal-select';
          
          setting.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            control.appendChild(opt);
          });
          
          control.value = this.settings[category][setting.key];
          
          control.addEventListener('change', () => {
            this.updateSetting(category, setting.key, control.value);
          });
          
          controlContainer.appendChild(control);
          break;
          
        case 'range':
          control = document.createElement('div');
          control.className = 'terminal-range-container';
          
          const range = document.createElement('input');
          range.type = 'range';
          range.className = 'terminal-range';
          range.min = setting.min;
          range.max = setting.max;
          range.step = setting.step;
          range.value = this.settings[category][setting.key];
          
          const valueDisplay = document.createElement('span');
          valueDisplay.className = 'terminal-range-value';
          valueDisplay.textContent = range.value;
          
          range.addEventListener('input', () => {
            valueDisplay.textContent = range.value;
            this.updateSetting(category, setting.key, Number(range.value));
          });
          
          control.appendChild(range);
          control.appendChild(valueDisplay);
          
          controlContainer.appendChild(control);
          break;
      }
      
      panel.appendChild(controlContainer);
    });
    
    return panel;
  }
  
  /**
   * Update the Control Matrix UI to reflect current settings
   * @private
   */
  _updateControlMatrixUI() {
    if (!this.container) return;
    
    // Update each input control to match current settings
    Object.keys(this.settings).forEach(category => {
      Object.keys(this.settings[category]).forEach(key => {
        const value = this.settings[category][key];
        
        // Find the control
        const inputId = `${category}-${key}`;
        const input = document.getElementById(inputId);
        
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = value;
            
            // Update status text
            const statusText = input.parentElement.nextElementSibling;
            if (statusText && statusText.className === 'terminal-status-text') {
              statusText.textContent = value ? 'ON' : 'OFF';
            }
          } else if (input.type === 'range') {
            input.value = value;
            
            // Update value display
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay && valueDisplay.className === 'terminal-range-value') {
              valueDisplay.textContent = value;
            }
          }
        }
        
        // Check for select elements
        const selects = this.container.querySelectorAll('select.terminal-select');
        selects.forEach(select => {
          const parts = select.id?.split('-');
          if (parts && parts.length === 2 && parts[0] === category && parts[1] === key) {
            select.value = value;
          }
        });
      });
    });
  }
  
  /**
   * Set up event handlers
   * @private
   */
  _setupEvents() {
    // Listen for keyboard shortcut to open Control Matrix
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+C to toggle Control Matrix
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Add global access to Control Matrix
    window.ControlMatrix = this;
    
    // Add Control Matrix toggle to command terminal
    const commandTerminal = document.querySelector('.command-terminal');
    if (commandTerminal) {
      const settingsButton = document.createElement('button');
      settingsButton.className = 'terminal-icon-button';
      settingsButton.innerHTML = '⚙️';
      settingsButton.title = 'Open Control Matrix (Ctrl+Shift+C)';
      settingsButton.addEventListener('click', () => this.toggle());
      
      commandTerminal.appendChild(settingsButton);
    }
  }
  
  /**
   * Reset settings to defaults
   * @private
   */
  _resetToDefaults() {
    this.settings = {
      terminal: {
        colorScheme: 'green',
        scanlines: true,
        flicker: true,
        soundEffects: true,
        typingSpeed: 10
      },
      display: {
        fontSize: 16,
        fontFamily: 'IBM Plex Mono',
        gridBg: true,
        showStatusBar: true
      },
      system: {
        dataRefreshRate: 30,
        useMCP: true,
        useLocalStorage: true,
        debug: false
      }
    };
    
    // Apply and save the default settings
    this.applySettings();
    this._saveSettings();
    
    console.log('[CONTROL-MATRIX] Reset to default settings');
    
    // Show a confirmation message
    const message = document.createElement('div');
    message.className = 'terminal-message';
    message.textContent = 'Settings reset to defaults';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.classList.add('active');
      
      setTimeout(() => {
        message.classList.remove('active');
        setTimeout(() => document.body.removeChild(message), 300);
      }, 2000);
    }, 10);
  }
  
  /**
   * Load settings from localStorage
   * @private
   */
  _loadSettings() {
    try {
      const storedSettings = localStorage.getItem('control-matrix-settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        
        // Merge with defaults to handle new settings
        this.settings = {
          terminal: { ...this.settings.terminal, ...parsedSettings.terminal },
          display: { ...this.settings.display, ...parsedSettings.display },
          system: { ...this.settings.system, ...parsedSettings.system }
        };
        
        console.log('[CONTROL-MATRIX] Loaded settings from localStorage');
      }
    } catch (error) {
      console.error('[CONTROL-MATRIX] Error loading settings:', error);
    }
  }
  
  /**
   * Save settings to localStorage
   * @private
   */
  _saveSettings() {
    try {
      localStorage.setItem('control-matrix-settings', JSON.stringify(this.settings));
      console.log('[CONTROL-MATRIX] Saved settings to localStorage');
      
      // Also save to Memory MCP if available
      if (mcpMemory) {
        mcpMemory.store('controlMatrixSettings', this.settings);
      }
    } catch (error) {
      console.error('[CONTROL-MATRIX] Error saving settings:', error);
    }
  }
}

// Create a singleton instance
const controlMatrix = new ControlMatrix();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  controlMatrix.init();
});

// Add stylesheet
function addControlMatrixStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Control Matrix Styles */
    .terminal-control-matrix {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .terminal-control-matrix.active {
      opacity: 1;
      pointer-events: all;
    }
    
    .terminal-control-content {
      background-color: var(--surface-1, #121212);
      border: 1px solid var(--border-accent, #00ff00);
      width: 80%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }
    
    .terminal-control-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--border-subtle, #333);
    }
    
    .terminal-control-header h2 {
      margin: 0;
      color: var(--text-accent, #00ff00);
      font-size: 1.5rem;
      font-family: 'VGA', monospace;
    }
    
    .terminal-close-btn {
      background: none;
      border: none;
      color: var(--text-primary, #ddd);
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .terminal-close-btn:hover {
      color: var(--text-accent, #00ff00);
    }
    
    .terminal-settings-container {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      flex: 1;
    }
    
    .terminal-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-subtle, #333);
      margin-bottom: 1rem;
    }
    
    .terminal-tab-button {
      background: none;
      border: none;
      color: var(--text-secondary, #aaa);
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: color 0.2s;
      font-family: 'IBM Plex Mono', monospace;
    }
    
    .terminal-tab-button.active {
      color: var(--text-accent, #00ff00);
      border-bottom: 2px solid var(--text-accent, #00ff00);
    }
    
    .terminal-settings-panel {
      display: none;
      padding: 1rem 0;
    }
    
    .terminal-control-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px dotted var(--border-subtle, #333);
    }
    
    .terminal-control-item label {
      color: var(--text-primary, #ddd);
      flex: 1;
    }
    
    .terminal-toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    
    .terminal-checkbox {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .terminal-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #333;
      transition: .4s;
      border-radius: 24px;
    }
    
    .terminal-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    
    .terminal-checkbox:checked + .terminal-slider {
      background-color: var(--text-accent, #00ff00);
    }
    
    .terminal-checkbox:checked + .terminal-slider:before {
      transform: translateX(26px);
    }
    
    .terminal-status-text {
      margin-left: 1rem;
      color: var(--text-secondary, #aaa);
      min-width: 30px;
      text-align: right;
    }
    
    .terminal-select {
      background-color: var(--surface-2, #222);
      color: var(--text-primary, #ddd);
      border: 1px solid var(--border-subtle, #333);
      padding: 0.5rem;
      font-family: 'IBM Plex Mono', monospace;
      min-width: 200px;
    }
    
    .terminal-range-container {
      display: flex;
      align-items: center;
    }
    
    .terminal-range {
      -webkit-appearance: none;
      width: 150px;
      height: 5px;
      background: var(--surface-2, #222);
      outline: none;
    }
    
    .terminal-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 15px;
      height: 15px;
      background: var(--text-accent, #00ff00);
      cursor: pointer;
      border-radius: 50%;
    }
    
    .terminal-range-value {
      margin-left: 1rem;
      color: var(--text-secondary, #aaa);
      min-width: 30px;
      text-align: right;
    }
    
    .terminal-control-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid var(--border-subtle, #333);
    }
    
    .terminal-message {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100%);
      background-color: var(--surface-2, #222);
      color: var(--text-accent, #00ff00);
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--border-accent, #00ff00);
      border-radius: 4px;
      transition: transform 0.3s ease;
      z-index: 10000;
    }
    
    .terminal-message.active {
      transform: translateX(-50%) translateY(0);
    }
    
    .terminal-icon-button {
      background: none;
      border: none;
      color: var(--text-primary, #ddd);
      font-size: 1.25rem;
      cursor: pointer;
      transition: color 0.2s;
      padding: 0.25rem 0.5rem;
      margin-left: 0.5rem;
    }
    
    .terminal-icon-button:hover {
      color: var(--text-accent, #00ff00);
    }
  `;
  
  document.head.appendChild(style);
}

// Add styles when the file loads
addControlMatrixStyles();

export default controlMatrix;