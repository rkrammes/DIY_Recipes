/**
 * System Actions
 * 
 * Defines global system-level actions for the terminal interface.
 * These actions are available regardless of current selection.
 */

import TerminalActionRegistry, { TerminalActionCreators } from './terminal-action-registry.js';
import DevMemory from './dev-memory.js';

/**
 * Register all system actions with the registry
 */
function registerSystemActions() {
  console.log('[SYSTEM-ACTIONS] Registering system actions');
  
  // Open Control Matrix action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'open-control-matrix',
      'OPEN CONTROL MATRIX',
      executeOpenControlMatrix,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Open system settings and configuration panel',
        icon: '⚙'
      }
    )
  );
  
  // Data Management action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'data-management',
      'DATA MANAGEMENT',
      executeDataManagement,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Backup, restore, or reset system data',
        icon: '⛁'
      }
    )
  );
  
  // Search Database action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'search-database',
      'SEARCH DATABASE',
      executeSearchDatabase,
      {
        category: TerminalActionRegistry.categories.PRIMARY,
        description: 'Search across formulas and elements',
        icon: '⌕'
      }
    )
  );
  
  // Generate Report action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'generate-report',
      'GENERATE REPORT',
      executeGenerateReport,
      {
        category: TerminalActionRegistry.categories.SECONDARY,
        description: 'Generate system reports and statistics',
        icon: '⊞'
      }
    )
  );
  
  // Export Database action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'export-database',
      'EXPORT DATABASE',
      executeExportDatabase,
      {
        category: TerminalActionRegistry.categories.SECONDARY,
        description: 'Export complete database in various formats',
        icon: '↑'
      }
    )
  );
  
  // Import Database action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'import-database',
      'IMPORT DATABASE',
      executeImportDatabase,
      {
        category: TerminalActionRegistry.categories.SECONDARY,
        description: 'Import database from file',
        icon: '↓'
      }
    )
  );
  
  // Toggle Theme action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'toggle-theme',
      'TOGGLE TERMINAL MODE',
      executeToggleTheme,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'Switch between green, amber, and blue terminal modes',
        icon: '◉'
      }
    )
  );
  
  // System Diagnostics action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'system-diagnostics',
      'SYSTEM DIAGNOSTICS',
      executeSystemDiagnostics,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'Run system diagnostics and health check',
        icon: '⚕'
      }
    )
  );
  
  // User Manual action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'user-manual',
      'USER MANUAL',
      executeOpenUserManual,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'View system documentation and help',
        icon: '✚'
      }
    )
  );
  
  // Log Out action
  TerminalActionRegistry.register(
    TerminalActionCreators.createGlobalAction(
      'log-out',
      'LOG OUT',
      executeLogOut,
      {
        category: TerminalActionRegistry.categories.UTILITY,
        description: 'Log out of the current session',
        icon: '✖'
      }
    )
  );
  
  console.log('[SYSTEM-ACTIONS] System actions registered');
  
  // Record registration in DevMemory
  DevMemory.recordTask({
    task_id: 'TASK-SYSTEM-ACTIONS',
    title: 'Register System Actions',
    description: 'Registered all global system actions with the Terminal Action Registry',
    status: 'completed',
    priority: 'high',
    tags: ['system', 'actions', 'terminal-ui'],
    notes: ['Created primary, secondary, and utility actions for system operations']
  });
}

/**
 * Open the Control Matrix (settings)
 */
async function executeOpenControlMatrix() {
  console.log('[SYSTEM-ACTIONS] Opening Control Matrix');
  
  DevMemory.recordTask({
    task_id: `TASK-OPEN-CONTROL-MATRIX-${Date.now()}`,
    title: 'Open Control Matrix',
    description: 'User opened the system Control Matrix',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'settings']
  });
  
  // In a real implementation, this would show the settings panel
  alert('Control Matrix (settings) would open here');
}

/**
 * Open data management interface
 */
async function executeDataManagement() {
  console.log('[SYSTEM-ACTIONS] Opening data management');
  
  DevMemory.recordTask({
    task_id: `TASK-DATA-MANAGEMENT-${Date.now()}`,
    title: 'Data management',
    description: 'User accessed data management features',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'data']
  });
  
  // In a real implementation, this would show data management options
  alert('Data management interface would open here');
}

/**
 * Search across the database
 */
async function executeSearchDatabase() {
  console.log('[SYSTEM-ACTIONS] Performing database search');
  
  DevMemory.recordTask({
    task_id: `TASK-SEARCH-DATABASE-${Date.now()}`,
    title: 'Search database',
    description: 'User initiated database search',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'search']
  });
  
  // In a real implementation, this would show search interface
  const searchTerm = prompt('Enter search term:');
  
  if (searchTerm) {
    alert(`Search results would appear here for: ${searchTerm}`);
  }
}

/**
 * Generate system reports
 */
async function executeGenerateReport() {
  console.log('[SYSTEM-ACTIONS] Generating system report');
  
  DevMemory.recordTask({
    task_id: `TASK-GENERATE-REPORT-${Date.now()}`,
    title: 'Generate report',
    description: 'User generated system report',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'report']
  });
  
  // In a real implementation, this would show report options
  alert('Report generation options would appear here');
}

/**
 * Export the entire database
 */
async function executeExportDatabase() {
  console.log('[SYSTEM-ACTIONS] Exporting database');
  
  DevMemory.recordTask({
    task_id: `TASK-EXPORT-DATABASE-${Date.now()}`,
    title: 'Export database',
    description: 'User exported the database',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'export']
  });
  
  // In a real implementation, this would show export options
  alert('Database export options would appear here');
}

/**
 * Import database from file
 */
async function executeImportDatabase() {
  console.log('[SYSTEM-ACTIONS] Importing database');
  
  DevMemory.recordTask({
    task_id: `TASK-IMPORT-DATABASE-${Date.now()}`,
    title: 'Import database',
    description: 'User imported database from file',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'import']
  });
  
  // In a real implementation, this would show import interface
  alert('Database import interface would appear here');
}

/**
 * Toggle between terminal themes (green, amber, blue)
 */
async function executeToggleTheme() {
  console.log('[SYSTEM-ACTIONS] Toggling terminal theme');
  
  // Get current theme
  const rootElement = document.documentElement;
  const currentTerminal = rootElement.getAttribute('data-terminal') || 'green';
  
  // Determine next theme
  let nextTerminal;
  switch (currentTerminal) {
    case 'green':
      nextTerminal = 'amber';
      break;
    case 'amber':
      nextTerminal = 'blue';
      break;
    default:
      nextTerminal = 'green';
  }
  
  // Apply new theme
  rootElement.setAttribute('data-terminal', nextTerminal);
  
  DevMemory.recordTask({
    task_id: `TASK-TOGGLE-THEME-${Date.now()}`,
    title: 'Toggle terminal mode',
    description: `User switched terminal mode to: ${nextTerminal}`,
    status: 'completed',
    priority: 'low',
    tags: ['system', 'theme']
  });
  
  console.log(`[SYSTEM-ACTIONS] Terminal theme changed to ${nextTerminal}`);
}

/**
 * Run system diagnostics
 */
async function executeSystemDiagnostics() {
  console.log('[SYSTEM-ACTIONS] Running system diagnostics');
  
  DevMemory.recordTask({
    task_id: `TASK-SYSTEM-DIAGNOSTICS-${Date.now()}`,
    title: 'System diagnostics',
    description: 'User ran system diagnostics',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'diagnostics']
  });
  
  // In a real implementation, this would run diagnostics
  alert('System diagnostics interface would appear here');
}

/**
 * Open user manual
 */
async function executeOpenUserManual() {
  console.log('[SYSTEM-ACTIONS] Opening user manual');
  
  DevMemory.recordTask({
    task_id: `TASK-USER-MANUAL-${Date.now()}`,
    title: 'Open user manual',
    description: 'User accessed the documentation',
    status: 'in_progress',
    priority: 'low',
    tags: ['system', 'documentation']
  });
  
  // In a real implementation, this would open the manual
  alert('User manual would open here');
}

/**
 * Log out of the system
 */
async function executeLogOut() {
  console.log('[SYSTEM-ACTIONS] Logging out');
  
  DevMemory.recordTask({
    task_id: `TASK-LOG-OUT-${Date.now()}`,
    title: 'Log out',
    description: 'User logged out of the system',
    status: 'in_progress',
    priority: 'medium',
    tags: ['system', 'authentication']
  });
  
  // Confirm before logging out
  const confirmLogOut = confirm('Are you sure you want to log out?');
  
  if (confirmLogOut) {
    // In a real implementation, this would handle logout
    alert('User would be logged out');
  }
}

// Export functions
export {
  registerSystemActions
};

// Auto-register on import (if needed)
// registerSystemActions();