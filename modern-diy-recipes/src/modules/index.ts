/**
 * Module Registry Exports
 * 
 * This file exports all registered modules and provides a convenience function
 * to initialize all modules in the application.
 */

// Import all modules
import formulationsModule from './formulations';

// Export individual modules
export { formulationsModule };

// Export a list of all modules
export const allModules = [
  formulationsModule
];

/**
 * Initialize all modules
 * This function ensures all modules are properly loaded and registered
 */
export function initializeModules() {
  console.log('Initializing modules...');
  
  // Modules are automatically registered when imported,
  // but we can do additional setup here if needed
  
  console.log(`Initialized ${allModules.length} modules:`, 
    allModules.map(m => m.name).join(', ')
  );
  
  return allModules;
}