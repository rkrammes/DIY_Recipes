/**
 * Terminal Action Registry
 * 
 * Enhanced action system for the retro terminal UI design.
 * Provides context-awareness for displaying relevant actions,
 * with hooks for MCP integration.
 */

import DevMemory from './dev-memory.js';

/**
 * Terminal Action Registry
 * Manages available actions and determines contextual relevance
 */
const TerminalActionRegistry = {
  // Storage for registered actions
  actions: [],
  
  // Action categories
  categories: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary', 
    UTILITY: 'utility'
  },
  
  // Selection types
  selectionTypes: {
    NONE: 'none',
    RECIPE: 'recipe',
    INGREDIENT: 'ingredient',
    CATEGORY: 'category'
  },
  
  /**
   * Initialize the registry
   * @returns {Object} The action registry
   */
  init() {
    console.log('[TERMINAL-ACTION-REGISTRY] Initializing');
    // Record initialization in DevMemory (MCP fallback)
    DevMemory.recordIntegrationStatus({
      service_id: 'terminal-action-registry',
      service_name: 'Terminal Action Registry',
      status: 'operational',
      endpoints: [
        {
          name: 'register',
          method: 'function',
          status: 'operational'
        },
        {
          name: 'getActionsForSelection',
          method: 'function',
          status: 'operational'
        }
      ],
      notes: ['Initialized with MCP integration hooks']
    });
    
    return this;
  },
  
  /**
   * Register an action with the registry
   * @param {Object} action - The action to register
   * @returns {Object} The registered action
   */
  register(action) {
    // Validate action object
    if (!action || !action.id || !action.name || typeof action.applicableTo !== 'function') {
      console.error('[TERMINAL-ACTION-REGISTRY] Invalid action:', action);
      return null;
    }
    
    // Set default category if not provided
    if (!action.category) {
      action.category = this.categories.UTILITY;
    }
    
    // Add action to registry
    this.actions.push(action);
    
    // Log registration
    console.log(`[TERMINAL-ACTION-REGISTRY] Registered action: ${action.name} (${action.id})`);
    
    // Track in DevMemory (MCP fallback)
    DevMemory.recordTask({
      task_id: `ACTION-${action.id}`,
      title: `Register terminal action: ${action.name}`,
      description: `Added the ${action.name} action to the terminal registry`,
      status: 'completed',
      priority: 'medium',
      tags: ['action', 'registry', 'terminal-ui']
    });
    
    return action;
  },
  
  /**
   * Get all registered actions
   * @returns {Array} All registered actions
   */
  getAllActions() {
    return [...this.actions];
  },
  
  /**
   * Get actions applicable to the current selection
   * @param {Object} selection - The selected item
   * @param {string} selectionType - The type of selection (recipe, ingredient, none)
   * @returns {Array} Actions applicable to the selection
   */
  getActionsForSelection(selection, selectionType) {
    // If no selection, return global actions
    if (!selection || !selectionType) {
      return this.getGlobalActions();
    }
    
    // Filter actions by applicability
    const applicableActions = this.actions.filter(action => {
      try {
        return action.applicableTo(selection, selectionType);
      } catch (error) {
        console.error(`[TERMINAL-ACTION-REGISTRY] Error checking applicability for ${action.id}:`, error);
        return false;
      }
    });
    
    // Log action retrieval for debugging
    console.log(`[TERMINAL-ACTION-REGISTRY] Found ${applicableActions.length} actions for ${selectionType}`);
    
    return applicableActions;
  },
  
  /**
   * Get actions for when nothing is selected
   * @returns {Array} Global actions
   */
  getGlobalActions() {
    return this.actions.filter(action => {
      try {
        return action.applicableTo(null, this.selectionTypes.NONE);
      } catch {
        return false;
      }
    });
  },
  
  /**
   * Group actions by category
   * @param {Array} actions - Actions to group
   * @returns {Object} Actions grouped by category
   */
  groupActionsByCategory(actions) {
    const groups = {
      [this.categories.PRIMARY]: [],
      [this.categories.SECONDARY]: [],
      [this.categories.UTILITY]: []
    };
    
    // Group actions by their category
    actions.forEach(action => {
      if (groups[action.category]) {
        groups[action.category].push(action);
      } else {
        groups[this.categories.UTILITY].push(action);
      }
    });
    
    return groups;
  },
  
  /**
   * Clear all registered actions
   */
  clear() {
    this.actions = [];
    console.log('[TERMINAL-ACTION-REGISTRY] Cleared all actions');
  },
  
  /**
   * MCP integration hook - will be implemented when MCP is available
   * @param {string} mcpType - Type of MCP to integrate with (e.g., 'github', 'memory')
   * @returns {Promise<boolean>} Success status
   */
  async connectToMCP(mcpType) {
    // This is a placeholder for MCP integration
    console.log(`[TERMINAL-ACTION-REGISTRY] MCP integration attempted for: ${mcpType}`);
    
    // Record the attempt in DevMemory
    DevMemory.recordIntegrationStatus({
      service_id: `${mcpType}-mcp-connection`,
      service_name: `${mcpType.toUpperCase()} MCP Connection`,
      status: 'degraded',
      notes: ['MCP integration attempted but not fully implemented']
    });
    
    // In a real implementation, this would connect to the specified MCP
    return false;
  }
};

/**
 * Define standard terminal action creators for common patterns
 */
export const TerminalActionCreators = {
  /**
   * Create a basic terminal action
   * @param {string} id - Unique action identifier
   * @param {string} name - Display name
   * @param {Function} execute - Function to execute
   * @param {Function} applicableTo - Function to determine applicability
   * @param {Object} options - Additional options
   * @returns {Object} Action object
   */
  createAction(id, name, execute, applicableTo, options = {}) {
    return {
      id,
      name,
      execute,
      applicableTo,
      category: options.category || TerminalActionRegistry.categories.UTILITY,
      icon: options.icon || null,
      description: options.description || null,
      keyboard_shortcut: options.keyboard_shortcut || null
    };
  },
  
  /**
   * Create a recipe-specific action
   * @param {string} id - Unique action identifier
   * @param {string} name - Display name
   * @param {Function} execute - Function to execute
   * @param {Object} options - Additional options
   * @returns {Object} Action object
   */
  createRecipeAction(id, name, execute, options = {}) {
    return this.createAction(
      id,
      name,
      execute,
      (item, type) => type === TerminalActionRegistry.selectionTypes.RECIPE,
      {
        category: options.category || TerminalActionRegistry.categories.PRIMARY,
        ...options
      }
    );
  },
  
  /**
   * Create an ingredient-specific action
   * @param {string} id - Unique action identifier
   * @param {string} name - Display name
   * @param {Function} execute - Function to execute
   * @param {Object} options - Additional options
   * @returns {Object} Action object
   */
  createIngredientAction(id, name, execute, options = {}) {
    return this.createAction(
      id,
      name,
      execute,
      (item, type) => type === TerminalActionRegistry.selectionTypes.INGREDIENT,
      {
        category: options.category || TerminalActionRegistry.categories.PRIMARY,
        ...options
      }
    );
  },
  
  /**
   * Create a global action (no selection required)
   * @param {string} id - Unique action identifier
   * @param {string} name - Display name
   * @param {Function} execute - Function to execute
   * @param {Object} options - Additional options
   * @returns {Object} Action object
   */
  createGlobalAction(id, name, execute, options = {}) {
    return this.createAction(
      id,
      name,
      execute,
      (item, type) => type === TerminalActionRegistry.selectionTypes.NONE,
      {
        category: options.category || TerminalActionRegistry.categories.PRIMARY,
        ...options
      }
    );
  }
};

// Initialize on export
TerminalActionRegistry.init();

export default TerminalActionRegistry;