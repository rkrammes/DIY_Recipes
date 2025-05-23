/**
 * Development Memory Utility
 * 
 * This module provides a local alternative to the Memory MCP for development tracking.
 * It's designed to be replaced with Memory MCP integration when available.
 */

// Store development history in memory for the current session
const devMemory = {
  tasks: [],
  decisions: [],
  integrationStatus: [],
  sessionLog: []
};

// Simple utility to generate IDs
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Record a development task
 * @param {Object} task - Task data
 * @returns {Object} The recorded task with additional metadata
 */
function recordTask(task) {
  // Validate task data
  if (!task.title) {
    throw new Error('Task must include a title');
  }
  
  // Generate ID if not provided
  if (!task.task_id) {
    task.task_id = generateId('TASK');
  }
  
  // Add timestamps if not provided
  if (!task.start_date) {
    task.start_date = new Date().toISOString();
  }
  
  if (task.status === 'completed' && !task.completion_date) {
    task.completion_date = new Date().toISOString();
  }
  
  // Set defaults
  task.status = task.status || 'pending';
  task.priority = task.priority || 'medium';
  task.dependencies = task.dependencies || [];
  task.tags = task.tags || [];
  task.notes = task.notes || [];
  
  // Add to memory store
  devMemory.tasks.push(task);
  
  // Log action
  logAction('TASK_RECORDED', task.task_id, task.title);
  
  console.log(`[DEV-MEMORY] Recorded task: ${task.title} (${task.task_id})`);
  return task;
}

/**
 * Record a development decision
 * @param {Object} decision - Decision data
 * @returns {Object} The recorded decision with additional metadata
 */
function recordDecision(decision) {
  // Validate decision data
  if (!decision.title || !decision.decision) {
    throw new Error('Decision must include title and decision');
  }
  
  // Generate ID if not provided
  if (!decision.decision_id) {
    decision.decision_id = generateId('DEC');
  }
  
  // Add timestamp if not provided
  if (!decision.date) {
    decision.date = new Date().toISOString();
  }
  
  // Set defaults
  decision.participants = decision.participants || [];
  decision.related_tasks = decision.related_tasks || [];
  decision.options_considered = decision.options_considered || [];
  
  // Add to memory store
  devMemory.decisions.push(decision);
  
  // Log action
  logAction('DECISION_RECORDED', decision.decision_id, decision.title);
  
  console.log(`[DEV-MEMORY] Recorded decision: ${decision.title} (${decision.decision_id})`);
  return decision;
}

/**
 * Record integration status
 * @param {Object} integration - Integration status data
 * @returns {Object} The recorded integration status with additional metadata
 */
function recordIntegrationStatus(integration) {
  // Validate integration data
  if (!integration.service_id || !integration.service_name || !integration.status) {
    throw new Error('Integration must include service_id, service_name, and status');
  }
  
  // Add timestamp if not provided
  if (!integration.last_check) {
    integration.last_check = new Date().toISOString();
  }
  
  // Set defaults
  integration.endpoints = integration.endpoints || [];
  integration.notes = integration.notes || [];
  
  // Check if service already exists
  const existingIndex = devMemory.integrationStatus.findIndex(s => s.service_id === integration.service_id);
  
  if (existingIndex >= 0) {
    // Update existing entry
    devMemory.integrationStatus[existingIndex] = integration;
  } else {
    // Add new entry
    devMemory.integrationStatus.push(integration);
  }
  
  // Log action
  logAction('INTEGRATION_STATUS_RECORDED', integration.service_id, integration.service_name);
  
  console.log(`[DEV-MEMORY] Recorded integration status: ${integration.service_name} (${integration.service_id})`);
  return integration;
}

/**
 * Get tasks matching optional filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} Matching tasks
 */
function getTasks(filters = {}) {
  let filteredTasks = [...devMemory.tasks];
  
  // Apply filters
  if (filters.status) {
    filteredTasks = filteredTasks.filter(task => task.status === filters.status);
  }
  
  if (filters.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
  }
  
  if (filters.assigned_to) {
    filteredTasks = filteredTasks.filter(task => task.assigned_to === filters.assigned_to);
  }
  
  return filteredTasks;
}

/**
 * Get decisions matching optional filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} Matching decisions
 */
function getDecisions(filters = {}) {
  let filteredDecisions = [...devMemory.decisions];
  
  // Apply filters
  if (filters.related_task) {
    filteredDecisions = filteredDecisions.filter(dec => 
      dec.related_tasks.includes(filters.related_task));
  }
  
  if (filters.participant) {
    filteredDecisions = filteredDecisions.filter(dec => 
      dec.participants.includes(filters.participant));
  }
  
  return filteredDecisions;
}

/**
 * Get integration statuses matching optional filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} Matching integration statuses
 */
function getIntegrationStatuses(filters = {}) {
  let filteredStatuses = [...devMemory.integrationStatus];
  
  // Apply filters
  if (filters.status) {
    filteredStatuses = filteredStatuses.filter(integration => 
      integration.status === filters.status);
  }
  
  if (filters.service_name) {
    filteredStatuses = filteredStatuses.filter(integration => 
      integration.service_name === filters.service_name);
  }
  
  return filteredStatuses;
}

/**
 * Get a summary of the current development status
 * @returns {Object} Development status summary
 */
function getStatusSummary() {
  const summary = {
    tasks: {
      total: devMemory.tasks.length,
      by_status: {},
      by_priority: {}
    },
    decisions: {
      total: devMemory.decisions.length,
      recent: []
    },
    integrations: {
      total: devMemory.integrationStatus.length,
      by_status: {}
    },
    last_updated: new Date().toISOString()
  };
  
  // Count tasks by status
  devMemory.tasks.forEach(task => {
    // Count by status
    if (!summary.tasks.by_status[task.status]) {
      summary.tasks.by_status[task.status] = 0;
    }
    summary.tasks.by_status[task.status]++;
    
    // Count by priority
    if (task.priority) {
      if (!summary.tasks.by_priority[task.priority]) {
        summary.tasks.by_priority[task.priority] = 0;
      }
      summary.tasks.by_priority[task.priority]++;
    }
  });
  
  // Get 5 most recent decisions
  const recentDecisions = [...devMemory.decisions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  summary.decisions.recent = recentDecisions.map(d => ({
    decision_id: d.decision_id,
    title: d.title,
    date: d.date
  }));
  
  // Count integrations by status
  devMemory.integrationStatus.forEach(integration => {
    if (!summary.integrations.by_status[integration.status]) {
      summary.integrations.by_status[integration.status] = 0;
    }
    summary.integrations.by_status[integration.status]++;
  });
  
  return summary;
}

/**
 * Log an action to the session history
 * @param {string} action - Action type
 * @param {string} itemId - ID of the affected item
 * @param {string} description - Brief description of the action
 */
function logAction(action, itemId, description) {
  devMemory.sessionLog.push({
    timestamp: new Date().toISOString(),
    action,
    itemId,
    description
  });
}

/**
 * Export development memory to JSON file
 * (This would require Node.js fs module, so it's here as a placeholder)
 */
function exportToJson() {
  console.log('[DEV-MEMORY] Export to JSON not implemented in browser environment');
  console.log(JSON.stringify(devMemory, null, 2));
  return JSON.stringify(devMemory, null, 2);
}

/**
 * Import development memory from JSON
 * (This would require Node.js fs module, so it's here as a placeholder)
 * @param {string} json - JSON string to import
 */
function importFromJson(json) {
  try {
    const data = JSON.parse(json);
    
    // Validate data structure
    if (data.tasks && data.decisions && data.integrationStatus) {
      // Import data
      devMemory.tasks = data.tasks;
      devMemory.decisions = data.decisions;
      devMemory.integrationStatus = data.integrationStatus;
      
      // Log action
      logAction('IMPORT', 'MEMORY', 'Imported development memory from JSON');
      console.log('[DEV-MEMORY] Successfully imported data');
      return true;
    } else {
      console.error('[DEV-MEMORY] Invalid data structure in import file');
      return false;
    }
  } catch (error) {
    console.error('[DEV-MEMORY] Failed to import data:', error);
    return false;
  }
}

// Export public API
const DevMemory = {
  recordTask,
  recordDecision,
  recordIntegrationStatus,
  getTasks,
  getDecisions,
  getIntegrationStatuses,
  getStatusSummary,
  exportToJson,
  importFromJson
};

export default DevMemory;