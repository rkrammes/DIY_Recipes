/**
 * Terminal Action Renderer
 * 
 * Renders actions in the context-aware action panel with terminal styling
 */

import TerminalActionRegistry from './terminal-action-registry.js';
import DevMemory from './dev-memory.js';

/**
 * Terminal Action Renderer
 * Responsible for rendering actions in the action panel
 * with terminal styling
 */
const TerminalActionRenderer = {
  /**
   * Initialize the action renderer
   * @param {HTMLElement} container - The container element for the action panel
   * @returns {Object} The action renderer
   */
  init(container) {
    if (!container) {
      console.error('[TERMINAL-ACTION-RENDERER] No container provided for initialization');
      return this;
    }
    
    this.container = container;
    console.log('[TERMINAL-ACTION-RENDERER] Initialized with container');
    
    // Record initialization in DevMemory (MCP fallback)
    DevMemory.recordIntegrationStatus({
      service_id: 'terminal-action-renderer',
      service_name: 'Terminal Action Renderer',
      status: 'operational',
      endpoints: [
        {
          name: 'renderActionsForSelection',
          method: 'function',
          status: 'operational'
        }
      ],
      notes: ['Initialized with container element']
    });
    
    return this;
  },
  
  /**
   * Render actions for the current selection
   * @param {Object} selection - The currently selected item
   * @param {string} selectionType - Type of selection (recipe, ingredient, none)
   * @returns {HTMLElement} The populated container
   */
  renderActionsForSelection(selection, selectionType) {
    // Check if container exists
    if (!this.container) {
      console.error('[TERMINAL-ACTION-RENDERER] No container set for action rendering');
      return null;
    }
    
    // Clear current content
    this.container.innerHTML = '';
    
    // Get applicable actions
    const actions = TerminalActionRegistry.getActionsForSelection(
      selection, 
      selectionType
    );
    
    // Group actions by category
    const groupedActions = TerminalActionRegistry.groupActionsByCategory(actions);
    
    // Create header based on selection type
    const header = document.createElement('div');
    header.className = 'terminal-panel-title';
    
    switch (selectionType) {
      case TerminalActionRegistry.selectionTypes.RECIPE:
        header.textContent = 'FORMULA OPERATIONS';
        break;
      case TerminalActionRegistry.selectionTypes.INGREDIENT:
        header.textContent = 'ELEMENT OPERATIONS';
        break;
      case TerminalActionRegistry.selectionTypes.CATEGORY:
        header.textContent = 'CLASSIFICATION OPERATIONS';
        break;
      default:
        header.textContent = 'SYSTEM OPERATIONS';
    }
    
    // Create a panel for the actions
    const panel = document.createElement('div');
    panel.className = 'terminal-panel';
    panel.appendChild(header);
    
    // Render each action group
    this._renderActionGroup(panel, 'PRIMARY OPERATIONS', groupedActions[TerminalActionRegistry.categories.PRIMARY], selection);
    this._renderActionGroup(panel, 'SECONDARY OPERATIONS', groupedActions[TerminalActionRegistry.categories.SECONDARY], selection);
    this._renderActionGroup(panel, 'UTILITY OPERATIONS', groupedActions[TerminalActionRegistry.categories.UTILITY], selection);
    
    // Add panel to container
    this.container.appendChild(panel);
    
    // Add system status panel
    this._renderSystemStatus();
    
    return this.container;
  },
  
  /**
   * Render a group of actions
   * @param {HTMLElement} container - Container element
   * @param {string} title - Group title
   * @param {Array} actions - Actions in this group
   * @param {Object} selection - The selected item
   * @private
   */
  _renderActionGroup(container, title, actions, selection) {
    // Skip empty groups
    if (!actions || actions.length === 0) {
      return;
    }
    
    // Create group container
    const groupContainer = document.createElement('div');
    groupContainer.className = 'terminal-action-group';
    
    // Add group header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'terminal-action-group-header';
    groupHeader.textContent = title;
    groupContainer.appendChild(groupHeader);
    
    // Add actions
    actions.forEach(action => {
      const actionButton = this._createActionButton(action, selection);
      groupContainer.appendChild(actionButton);
    });
    
    // Add group to container
    container.appendChild(groupContainer);
  },
  
  /**
   * Create a button for an action
   * @param {Object} action - The action object
   * @param {Object} selection - The selected item
   * @returns {HTMLElement} Action button element
   * @private
   */
  _createActionButton(action, selection) {
    const button = document.createElement('button');
    button.className = 'terminal-button';
    button.setAttribute('data-action-id', action.id);
    button.textContent = action.name;
    
    // Add icon if available
    if (action.icon) {
      const icon = document.createElement('span');
      icon.className = 'terminal-button-icon';
      icon.textContent = action.icon;
      button.prepend(icon);
    }
    
    // Add tooltip if there's a description
    if (action.description) {
      button.setAttribute('title', action.description);
    }
    
    // Add keyboard shortcut indicator if available
    if (action.keyboard_shortcut) {
      const shortcut = document.createElement('span');
      shortcut.className = 'terminal-button-shortcut';
      shortcut.textContent = action.keyboard_shortcut;
      button.appendChild(shortcut);
    }
    
    // Add click handler
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      
      // Visual feedback
      button.classList.add('terminal-button-executing');
      
      try {
        // Execute the action
        await action.execute(selection);
        
        // Success feedback
        button.classList.remove('terminal-button-executing');
        button.classList.add('terminal-button-success');
        
        // Reset after animation
        setTimeout(() => {
          button.classList.remove('terminal-button-success');
        }, 1000);
        
      } catch (error) {
        console.error(`[TERMINAL-ACTION-RENDERER] Error executing action ${action.id}:`, error);
        
        // Error feedback
        button.classList.remove('terminal-button-executing');
        button.classList.add('terminal-button-error');
        
        // Reset after animation
        setTimeout(() => {
          button.classList.remove('terminal-button-error');
        }, 1000);
      }
    });
    
    return button;
  },
  
  /**
   * Render system status panel
   * @private
   */
  _renderSystemStatus() {
    // Get system status
    const statusSummary = DevMemory.getStatusSummary();
    
    // Create status panel
    const statusPanel = document.createElement('div');
    statusPanel.className = 'terminal-panel';
    statusPanel.style.marginTop = '1rem';
    
    // Add panel title
    const panelTitle = document.createElement('div');
    panelTitle.className = 'terminal-panel-title';
    panelTitle.textContent = 'SYSTEM STATUS';
    statusPanel.appendChild(panelTitle);
    
    // Add system statuses
    const statusItems = [
      { name: 'FORMULA DATABASE', status: 'active' },
      { name: 'MCP CONNECTION', status: statusSummary.integrations.total > 0 ? 'active' : 'standby' },
      { name: 'ACTION REGISTRY', status: 'active' }
    ];
    
    statusItems.forEach(item => {
      const statusContainer = document.createElement('div');
      statusContainer.className = 'terminal-status-container';
      statusContainer.style.marginBottom = '0.5rem';
      
      const light = document.createElement('span');
      light.className = `terminal-status-light terminal-status-${item.status}`;
      statusContainer.appendChild(light);
      
      const label = document.createElement('span');
      label.textContent = item.name;
      statusContainer.appendChild(label);
      
      statusPanel.appendChild(statusContainer);
    });
    
    // Add resources bar
    const resourcesContainer = document.createElement('div');
    resourcesContainer.style.marginTop = '1rem';
    
    const resourcesLabel = document.createElement('div');
    resourcesLabel.className = 'terminal-label';
    resourcesLabel.textContent = 'SYSTEM RESOURCES';
    resourcesContainer.appendChild(resourcesLabel);
    
    const resourcesBar = document.createElement('div');
    resourcesBar.className = 'terminal-progress';
    
    const resourcesValue = document.createElement('div');
    resourcesValue.className = 'terminal-progress-bar';
    resourcesValue.style.width = '42%';
    resourcesBar.appendChild(resourcesValue);
    
    resourcesContainer.appendChild(resourcesBar);
    statusPanel.appendChild(resourcesContainer);
    
    // Add to container
    this.container.appendChild(statusPanel);
  },
  
  /**
   * Clear the action panel
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
};

export default TerminalActionRenderer;