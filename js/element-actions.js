/**
 * Element Actions (Ingredient Actions)
 * 
 * Defines the actions available for element (ingredient) selection
 * in the terminal interface. These actions implement the 
 * functionality for the Element Library.
 */

import TerminalActionRegistry, { TerminalActionCreators } from './terminal-action-registry.js';
import DevMemory from './dev-memory.js';

/**
 * Register all element (ingredient) actions with the registry
 */
function registerElementActions() {
  console.log('[ELEMENT-ACTIONS] Registering element actions');
  
  // Create Element action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'create-element',
      'CREATE NEW ELEMENT',
      executeCreateElement,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Create a new element (ingredient) definition',
        icon: '+'
      }
    )
  );
  
  // Import Elements action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'import-elements',
      'IMPORT ELEMENTS',
      executeImportElements,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Import elements from external source',
        icon: '↓'
      }
    )
  );
  
  // Edit Element action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'edit-element',
      'MODIFY ELEMENT',
      executeEditElement,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Edit element properties and specifications',
        icon: '⚙'
      }
    )
  );
  
  // Edit Element Properties action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'edit-element-properties',
      'EDIT PROPERTIES',
      executeEditElementProperties,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Modify element scientific properties',
        icon: '⟐'
      }
    )
  );
  
  // Find Substitutes action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'find-substitutes',
      'FIND SUBSTITUTES',
      executeFindSubstitutes,
      {
        category: TerminalActionRegistry.categories.SECONDARY,
        description: 'Find alternative elements with similar properties',
        icon: '⟷'
      }
    )
  );
  
  // View Formulas Using Element action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'view-formulas-using-element',
      'VIEW USAGE',
      executeViewFormulasUsingElement,
      {
        category: TerminalActionRegistry.categories.SECONDARY,
        description: 'Show formulas using this element',
        icon: '⋗'
      }
    )
  );
  
  // Element Compatibility action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'element-compatibility',
      'CHECK COMPATIBILITY',
      executeElementCompatibility,
      {
        category: TerminalActionRegistry.categories.SECONDARY,
        description: 'Check element compatibility with other elements',
        icon: '⊕'
      }
    )
  );
  
  // Element Cost Analysis action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'element-cost-analysis',
      'COST ANALYSIS',
      executeElementCostAnalysis,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'Analyze element cost per unit',
        icon: '₮'
      }
    )
  );
  
  // Export Element action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'export-element',
      'EXPORT ELEMENT',
      executeExportElement,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'Export element data to various formats',
        icon: '↑'
      }
    )
  );
  
  // Delete Element action
  TerminalActionRegistry.register(
    TerminalActionCreators.createIngredientAction(
      'delete-element',
      'DELETE ELEMENT',
      executeDeleteElement,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'Permanently delete this element',
        icon: '✗'
      }
    )
  );
  
  console.log('[ELEMENT-ACTIONS] Element actions registered');
  
  // Record registration in DevMemory
  DevMemory.recordTask({
    task_id: 'TASK-ELEMENT-ACTIONS',
    title: 'Register Element Actions',
    description: 'Registered all element (ingredient) actions with the Terminal Action Registry',
    status: 'completed',
    priority: 'high',
    tags: ['element', 'actions', 'terminal-ui'],
    notes: ['Created primary, secondary, and utility actions for elements']
  });
}

/**
 * Create a new element (ingredient)
 * @param {Object} selection - Current selection (null for global action)
 */
async function executeCreateElement(selection) {
  console.log('[ELEMENT-ACTIONS] Creating new element');
  
  // This would integrate with the existing ingredient creation functionality
  // For now, we'll just log the action and record it in DevMemory
  
  DevMemory.recordTask({
    task_id: `TASK-CREATE-ELEMENT-${Date.now()}`,
    title: 'Create new element',
    description: 'User initiated element creation process',
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'create']
  });
  
  // In a real implementation, this would show the element creation UI
  alert('Element creation interface would appear here');
}

/**
 * Import elements from external source
 * @param {Object} selection - Current selection (null for global action)
 */
async function executeImportElements(selection) {
  console.log('[ELEMENT-ACTIONS] Importing elements');
  
  DevMemory.recordTask({
    task_id: `TASK-IMPORT-ELEMENTS-${Date.now()}`,
    title: 'Import elements',
    description: 'User initiated element import process',
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'import']
  });
  
  // In a real implementation, this would show the import UI
  alert('Element import interface would appear here');
}

/**
 * Edit an element's basic properties
 * @param {Object} selection - Selected element
 */
async function executeEditElement(selection) {
  console.log('[ELEMENT-ACTIONS] Editing element:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-EDIT-ELEMENT-${Date.now()}`,
    title: 'Modify element',
    description: `User is editing element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'edit']
  });
  
  // In a real implementation, this would show the element editing UI
  alert(`Element editing interface would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * Edit element scientific properties
 * @param {Object} selection - Selected element
 */
async function executeEditElementProperties(selection) {
  console.log('[ELEMENT-ACTIONS] Editing element properties:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-EDIT-ELEMENT-PROPERTIES-${Date.now()}`,
    title: 'Edit element properties',
    description: `User is editing scientific properties for element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'properties', 'edit']
  });
  
  // In a real implementation, this would show the properties editing UI
  alert(`Element properties editor would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * Find substitutes for an element
 * @param {Object} selection - Selected element
 */
async function executeFindSubstitutes(selection) {
  console.log('[ELEMENT-ACTIONS] Finding substitutes for element:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-FIND-SUBSTITUTES-${Date.now()}`,
    title: 'Find element substitutes',
    description: `User is finding substitutes for element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'substitutes']
  });
  
  // In a real implementation, this would show substitute options
  alert(`Element substitute finder would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * View formulas that use a specific element
 * @param {Object} selection - Selected element
 */
async function executeViewFormulasUsingElement(selection) {
  console.log('[ELEMENT-ACTIONS] Viewing formulas using element:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-VIEW-ELEMENT-USAGE-${Date.now()}`,
    title: 'View element usage',
    description: `User is viewing formulas using element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'usage', 'view']
  });
  
  // In a real implementation, this would show formulas using the element
  alert(`Formula usage list would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * Check element compatibility with other elements
 * @param {Object} selection - Selected element
 */
async function executeElementCompatibility(selection) {
  console.log('[ELEMENT-ACTIONS] Checking element compatibility:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-CHECK-COMPATIBILITY-${Date.now()}`,
    title: 'Check element compatibility',
    description: `User is checking compatibility for element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'compatibility']
  });
  
  // In a real implementation, this would show compatibility matrix
  alert(`Element compatibility matrix would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * Analyze element cost per unit
 * @param {Object} selection - Selected element
 */
async function executeElementCostAnalysis(selection) {
  console.log('[ELEMENT-ACTIONS] Analyzing element cost:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-ELEMENT-COST-ANALYSIS-${Date.now()}`,
    title: 'Element cost analysis',
    description: `User is analyzing cost for element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'cost', 'analysis']
  });
  
  // In a real implementation, this would show cost analysis UI
  alert(`Element cost analysis would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * Export element data
 * @param {Object} selection - Selected element
 */
async function executeExportElement(selection) {
  console.log('[ELEMENT-ACTIONS] Exporting element data:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-EXPORT-ELEMENT-${Date.now()}`,
    title: 'Export element',
    description: `User is exporting element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'export']
  });
  
  // In a real implementation, this would show export options
  alert(`Element export options would appear here for: ${selection?.name || 'Unknown'}`);
}

/**
 * Delete an element
 * @param {Object} selection - Selected element
 */
async function executeDeleteElement(selection) {
  console.log('[ELEMENT-ACTIONS] Deleting element:', selection);
  
  DevMemory.recordTask({
    task_id: `TASK-DELETE-ELEMENT-${Date.now()}`,
    title: 'Delete element',
    description: `User is deleting element: ${selection?.name || 'Unknown'}`,
    status: 'in_progress',
    priority: 'medium',
    tags: ['element', 'delete']
  });
  
  // In a real implementation, this would show a confirmation dialog
  const confirmDelete = confirm(`Are you sure you want to delete element: ${selection?.name || 'Unknown'}?`);
  
  if (confirmDelete) {
    // Handle deletion
    alert(`Element would be deleted: ${selection?.name || 'Unknown'}`);
  }
}

// Export functions
export {
  registerElementActions
};

// Auto-register on import (if needed)
// registerElementActions();