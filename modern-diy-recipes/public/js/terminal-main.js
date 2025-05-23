/**
 * Terminal UI Main Script
 * 
 * Initializes and configures the retro terminal UI for the DIY Recipes application.
 * This script serves as the entry point for the terminal interface.
 */

import TerminalActionRegistry from './terminal-action-registry.js';
import TerminalActionRenderer from './terminal-action-renderer.js';
import { registerFormulaActions, initFormulaActions } from './formula-actions.js';
import { registerElementActions } from './element-actions.js';
import { registerSystemActions } from './system-actions.js';
import DevMemory from './dev-memory.js';
import { initFormulaDatabaseUI, loadAndRenderFormulas } from './formula-database-ui.js';

/**
 * Terminal UI Manager
 * 
 * Manages the terminal UI components and initialization
 */
const TerminalUI = {
  // Store reference to key UI elements
  elements: {
    commandTerminal: null,
    navigationMatrix: null,
    primaryWorkspace: null,
    actionPanel: null
  },
  
  // Current selection state
  currentSelection: {
    item: null,
    type: null
  },
  
  /**
   * Initialize the terminal UI system
   * @returns {Object} The terminal UI manager
   */
  init() {
    console.log('[TERMINAL-UI] Initializing terminal UI system');
    
    // Load necessary DOM elements
    this._loadElements();
    
    // Register action handlers
    this._registerActions();
    
    // Initialize action renderer
    if (this.elements.actionPanel) {
      TerminalActionRenderer.init(this.elements.actionPanel);
    } else {
      console.error('[TERMINAL-UI] Action panel element not found');
    }
    
    // Initialize Formula Database UI if elements exist
    if (document.getElementById('formulaList') && document.getElementById('formulaWorkspace')) {
      console.log('[TERMINAL-UI] Initializing Formula Database UI');
      // Make functions available globally for HTML access
      window.initFormulaDatabaseUI = initFormulaDatabaseUI;
      window.loadAndRenderFormulas = loadAndRenderFormulas;
      
      // Initialize Formula actions
      initFormulaActions();
      
      // Initialize the database UI
      initFormulaDatabaseUI();
      
      // Load and render formula data
      loadAndRenderFormulas();
    }
    
    // Set up navigation event handlers
    this._setupNavigation();
    
    // Initialize terminal effects
    this._initTerminalEffects();
    
    // Record initialization in DevMemory (MCP fallback)
    DevMemory.recordIntegrationStatus({
      service_id: 'terminal-ui',
      service_name: 'Terminal UI System',
      status: 'operational',
      endpoints: [
        {
          name: 'navigation',
          method: 'function',
          status: 'operational'
        },
        {
          name: 'workspace',
          method: 'function',
          status: 'operational'
        },
        {
          name: 'actions',
          method: 'function',
          status: 'operational'
        }
      ],
      notes: ['Terminal UI system initialized successfully']
    });
    
    // Show default actions (global actions)
    this._updateActionPanel();
    
    // Try to connect to MCP services if available
    this._tryConnectMCP();
    
    // Set up system timer
    this._startSystemTimer();
    
    console.log('[TERMINAL-UI] Initialization complete');
    return this;
  },
  
  /**
   * Load DOM elements
   * @private
   */
  _loadElements() {
    this.elements.commandTerminal = document.querySelector('.command-terminal');
    this.elements.navigationMatrix = document.querySelector('.navigation-matrix');
    this.elements.primaryWorkspace = document.querySelector('.primary-workspace');
    this.elements.actionPanel = document.querySelector('.action-panel');
    
    // Check if all elements were found
    const missingElements = [];
    if (!this.elements.commandTerminal) missingElements.push('command-terminal');
    if (!this.elements.navigationMatrix) missingElements.push('navigation-matrix');
    if (!this.elements.primaryWorkspace) missingElements.push('primary-workspace');
    if (!this.elements.actionPanel) missingElements.push('action-panel');
    
    if (missingElements.length > 0) {
      console.error(`[TERMINAL-UI] Missing elements: ${missingElements.join(', ')}`);
    } else {
      console.log('[TERMINAL-UI] All UI elements loaded');
    }
  },
  
  /**
   * Register action handlers for the terminal UI
   * @private
   */
  _registerActions() {
    console.log('[TERMINAL-UI] Registering action handlers');
    
    // Register formula actions
    registerFormulaActions();
    
    // Register element actions
    registerElementActions();
    
    // Register system actions
    registerSystemActions();
  },
  
  /**
   * Set up navigation event handlers
   * @private
   */
  _setupNavigation() {
    if (!this.elements.navigationMatrix) return;
    
    // Get all navigation items
    const navItems = this.elements.navigationMatrix.querySelectorAll('.terminal-nav-item');
    
    // Add click handlers to each item
    navItems.forEach(item => {
      item.addEventListener('click', (event) => {
        // Remove active class from all items
        navItems.forEach(navItem => navItem.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Get selection data
        const itemText = item.textContent.trim();
        
        // Determine selection type based on content
        let selectionType = TerminalActionRegistry.selectionTypes.NONE;
        let selection = null;
        
        // Check for recipe-related navigation
        if (itemText.includes('FORMULA') || itemText.includes('RECENT') || itemText.includes('FAVORITES')) {
          // This would normally be determined by actual data
          selectionType = TerminalActionRegistry.selectionTypes.RECIPE;
          
          // Mock selection object for demonstration
          if (itemText === 'ALL_FORMULAS') {
            selection = {
              title: 'Sample Formula',
              id: 'formula-123',
              type: 'formula'
            };
          }
        }
        
        // Check for ingredient-related navigation
        else if (itemText.includes('ELEMENT') || itemText.includes('COMPATIBILITY') || itemText.includes('PROPERTIES')) {
          selectionType = TerminalActionRegistry.selectionTypes.INGREDIENT;
          
          // Mock selection object for demonstration
          if (itemText === 'ALL_ELEMENTS') {
            selection = {
              name: 'Sample Element',
              id: 'element-123',
              type: 'element'
            };
          }
        }
        
        // Update selection and action panel
        this._setSelection(selection, selectionType);
        
        // Also update workspace content based on selection
        this._updateWorkspace(selection, selectionType, itemText);
      });
    });
    
    console.log('[TERMINAL-UI] Navigation handlers set up');
  },
  
  /**
   * Initialize terminal visual effects
   * @private
   */
  _initTerminalEffects() {
    // Add scanline effect to workspace
    if (this.elements.primaryWorkspace) {
      this.elements.primaryWorkspace.classList.add('terminal-scanlines');
    }
    
    // Set initial terminal color theme
    document.documentElement.setAttribute('data-terminal', 'green');
    
    // Add flicker effect to terminal headers
    const headers = document.querySelectorAll('.terminal-panel-title');
    headers.forEach(header => {
      header.classList.add('terminal-flicker');
    });
  },
  
  /**
   * Set the current selection and update UI
   * @param {Object} item - The selected item
   * @param {string} type - The type of selection
   * @private
   */
  _setSelection(item, type) {
    this.currentSelection.item = item;
    this.currentSelection.type = type;
    
    // Update action panel with new selection
    this._updateActionPanel();
    
    // Record selection in DevMemory
    if (item) {
      DevMemory.recordTask({
        task_id: `SELECT-${type}-${Date.now()}`,
        title: `Select ${type}`,
        description: `User selected ${type}: ${item.name || item.title || 'Unknown'}`,
        status: 'completed',
        priority: 'low',
        tags: ['ui', 'selection', type]
      });
    }
  },
  
  /**
   * Update the action panel for the current selection
   * @private
   */
  _updateActionPanel() {
    if (!TerminalActionRenderer) {
      console.error('[TERMINAL-UI] Action renderer not initialized');
      return;
    }
    
    // Render actions for current selection
    TerminalActionRenderer.renderActionsForSelection(
      this.currentSelection.item,
      this.currentSelection.type
    );
    
    console.log(`[TERMINAL-UI] Action panel updated for ${this.currentSelection.type || 'none'}`);
  },
  
  /**
   * Update the workspace content based on selection
   * @param {Object} selection - The selected item
   * @param {string} selectionType - The type of selection
   * @param {string} navText - The navigation text
   * @private
   */
  _updateWorkspace(selection, selectionType, navText) {
    if (!this.elements.primaryWorkspace) return;
    
    // Clear current workspace content
    this.elements.primaryWorkspace.innerHTML = '';
    
    // Create panel for the content
    const panel = document.createElement('div');
    panel.className = 'terminal-panel';
    
    // Add panel title
    const panelTitle = document.createElement('div');
    panelTitle.className = 'terminal-panel-title';
    panelTitle.textContent = navText || 'DASHBOARD';
    panel.appendChild(panelTitle);
    
    // Add content based on selection type
    const content = document.createElement('div');
    content.className = 'terminal-panel-content';
    
    if (selectionType === TerminalActionRegistry.selectionTypes.RECIPE) {
      if (selection) {
        // Display formula details
        content.innerHTML = `
          <div class="terminal-text-reveal">
            Formula details for: ${selection.title}
          </div>
          
          <div class="terminal-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
            <div class="terminal-panel">
              <div class="terminal-panel-title">YIELD</div>
              <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">500g</div>
            </div>
            
            <div class="terminal-panel">
              <div class="terminal-panel-title">ELEMENTS</div>
              <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">8</div>
            </div>
            
            <div class="terminal-panel">
              <div class="terminal-panel-title">VERSION</div>
              <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">2.1</div>
            </div>
          </div>
          
          <div class="terminal-panel" style="margin-top: 2rem;">
            <div class="terminal-panel-title">ELEMENTS</div>
            <table class="terminal-table">
              <thead>
                <tr>
                  <th>ELEMENT</th>
                  <th>AMOUNT</th>
                  <th>UNIT</th>
                  <th>PROPERTIES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Water</td>
                  <td>300</td>
                  <td>g</td>
                  <td><span class="terminal-badge">solvent</span></td>
                </tr>
                <tr>
                  <td>Sodium Hydroxide</td>
                  <td>40</td>
                  <td>g</td>
                  <td><span class="terminal-badge terminal-badge-warning">caustic</span></td>
                </tr>
                <tr>
                  <td>Olive Oil</td>
                  <td>100</td>
                  <td>g</td>
                  <td><span class="terminal-badge terminal-badge-success">moisturizing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      } else {
        // Display formula list
        content.innerHTML = `
          <div class="terminal-text-reveal">
            Formula database access authorized. Showing all formulas.
          </div>
          
          <div class="terminal-panel" style="margin-top: 2rem;">
            <div class="terminal-panel-title">FORMULA LIST</div>
            <table class="terminal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>VERSION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>F-001</td>
                  <td>Basic Soap</td>
                  <td>Cleansing</td>
                  <td>2.1</td>
                  <td><span class="terminal-badge terminal-badge-success">VERIFIED</span></td>
                </tr>
                <tr>
                  <td>F-002</td>
                  <td>Moisturizing Lotion</td>
                  <td>Moisturizing</td>
                  <td>1.4</td>
                  <td><span class="terminal-badge terminal-badge-success">VERIFIED</span></td>
                </tr>
                <tr>
                  <td>F-003</td>
                  <td>Exfoliating Scrub</td>
                  <td>Exfoliating</td>
                  <td>3.2</td>
                  <td><span class="terminal-badge terminal-badge-warning">TESTING</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }
    } else if (selectionType === TerminalActionRegistry.selectionTypes.INGREDIENT) {
      if (selection) {
        // Display element details
        content.innerHTML = `
          <div class="terminal-text-reveal">
            Element details for: ${selection.name}
          </div>
          
          <div class="terminal-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
            <div class="terminal-panel">
              <div class="terminal-panel-title">pH VALUE</div>
              <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">7.2</div>
            </div>
            
            <div class="terminal-panel">
              <div class="terminal-panel-title">DENSITY</div>
              <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">0.92</div>
            </div>
            
            <div class="terminal-panel">
              <div class="terminal-panel-title">COST/UNIT</div>
              <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">$2.50</div>
            </div>
          </div>
          
          <div class="terminal-panel" style="margin-top: 2rem;">
            <div class="terminal-panel-title">PROPERTIES</div>
            <table class="terminal-table">
              <thead>
                <tr>
                  <th>PROPERTY</th>
                  <th>VALUE</th>
                  <th>UNIT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Solubility in Water</td>
                  <td>Insoluble</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Melting Point</td>
                  <td>35</td>
                  <td>°C</td>
                </tr>
                <tr>
                  <td>Shelf Life</td>
                  <td>24</td>
                  <td>months</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      } else {
        // Display element list
        content.innerHTML = `
          <div class="terminal-text-reveal">
            Element library access authorized. Showing all elements.
          </div>
          
          <div class="terminal-panel" style="margin-top: 2rem;">
            <div class="terminal-panel-title">ELEMENT LIST</div>
            <table class="terminal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>pH</th>
                  <th>PROPERTIES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>E-001</td>
                  <td>Olive Oil</td>
                  <td>Oil</td>
                  <td>-</td>
                  <td><span class="terminal-badge terminal-badge-success">moisturizing</span></td>
                </tr>
                <tr>
                  <td>E-002</td>
                  <td>Sodium Hydroxide</td>
                  <td>Alkali</td>
                  <td>14.0</td>
                  <td><span class="terminal-badge terminal-badge-warning">caustic</span></td>
                </tr>
                <tr>
                  <td>E-003</td>
                  <td>Lavender Essential Oil</td>
                  <td>Essential Oil</td>
                  <td>-</td>
                  <td><span class="terminal-badge terminal-badge-success">fragrant</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }
    } else {
      // Display dashboard content
      content.innerHTML = `
        <div class="terminal-text-reveal">
          System initialized. Welcome to DIY Recipes Formula Database.
        </div>
        
        <div class="terminal-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
          <div class="terminal-panel">
            <div class="terminal-panel-title">FORMULA COUNT</div>
            <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">42</div>
          </div>
          
          <div class="terminal-panel">
            <div class="terminal-panel-title">ELEMENTS</div>
            <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">124</div>
          </div>
          
          <div class="terminal-panel">
            <div class="terminal-panel-title">CATEGORIES</div>
            <div class="terminal-vga" style="font-size: 2rem; text-align: center; margin: 1rem 0;">8</div>
          </div>
        </div>
        
        <div class="terminal-panel" style="margin-top: 2rem;">
          <div class="terminal-panel-title">RECENT ACTIVITY</div>
          <table class="terminal-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>ACTIVITY</th>
                <th>FORMULA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-05-04</td>
                <td>MODIFIED</td>
                <td>BASIC_LOTION</td>
                <td><span class="terminal-badge terminal-badge-success">COMPLETE</span></td>
              </tr>
              <tr>
                <td>2025-05-03</td>
                <td>CREATED</td>
                <td>CITRUS_SCRUB</td>
                <td><span class="terminal-badge terminal-badge-success">COMPLETE</span></td>
              </tr>
              <tr>
                <td>2025-05-01</td>
                <td>ITERATION</td>
                <td>CLAY_MASK</td>
                <td><span class="terminal-badge terminal-badge-warning">IN_PROGRESS</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
    
    panel.appendChild(content);
    this.elements.primaryWorkspace.appendChild(panel);
    
    console.log(`[TERMINAL-UI] Workspace updated for ${selectionType || 'dashboard'}`);
  },
  
  /**
   * Try to connect to available MCP services
   * @private
   */
  _tryConnectMCP() {
    console.log('[TERMINAL-UI] Attempting to connect to MCP services');
    
    // Try to connect to MCP services
    Promise.all([
      TerminalActionRegistry.connectToMCP('github').catch(() => false),
      TerminalActionRegistry.connectToMCP('memory').catch(() => false),
      TerminalActionRegistry.connectToMCP('context7').catch(() => false)
    ]).then(results => {
      const connectedServices = results.filter(Boolean);
      
      if (connectedServices.length > 0) {
        console.log(`[TERMINAL-UI] Connected to ${connectedServices.length} MCP services`);
      } else {
        console.warn('[TERMINAL-UI] No MCP services available, using fallback systems');
      }
    });
  },
  
  /**
   * Start the system timer for the command terminal
   * @private
   */
  _startSystemTimer() {
    // Find the time display element
    const timeElement = this.elements.commandTerminal?.querySelector('.terminal-time span');
    if (!timeElement) return;
    
    // Update time every second
    setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize terminal UI
  TerminalUI.init();
});

export default TerminalUI;