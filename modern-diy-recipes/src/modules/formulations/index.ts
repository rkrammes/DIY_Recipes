import React from 'react';
import { createModule, registerModule } from '@/lib/modules';
import { 
  ModuleFormulationList, 
  ModuleFormulationDetails, 
  ModuleFormulationForm 
} from './components';

// Import enhanced document component or use a placeholder if it doesn't exist
let DocumentCentricFormulation: React.ComponentType<any>;
try {
  DocumentCentricFormulation = require('./components/ModuleDocumentCentricFormulation').default;
} catch (e) {
  // Use a placeholder if the component doesn't exist yet
  DocumentCentricFormulation = () => React.createElement('div', null, 'Document view is under development');
}

/**
 * Formulations Module Definition
 * 
 * This module handles all functionality related to DIY formulations
 * (previously called recipes). It provides components for viewing,
 * creating, and editing formulations using the repository pattern.
 */

// Define the formulations module with enhanced components
const formulationsModule = createModule({
  id: 'formulations',
  name: 'DIY Formulations',
  icon: '🧪',
  description: 'Create and manage DIY product formulations with version control',
  isEnabled: true,
  
  // Define the module routes with enhanced components
  routes: [
    {
      path: '/formulations',
      component: ModuleFormulationList,
    },
    {
      path: '/formulations/:id',
      component: ModuleFormulationDetails,
    },
    {
      path: '/formulations/new',
      component: ModuleFormulationForm,
    },
    {
      path: '/enhanced-formulations',
      component: ModuleFormulationList,
    },
    {
      path: '/module-formulations',
      component: ModuleFormulationList,
    },
    {
      path: '/formulations/:id/document',
      component: DocumentCentricFormulation,
    }
  ],
  
  // Define the module's main components
  components: {
    list: ModuleFormulationList,
    detail: ModuleFormulationDetails,
    create: ModuleFormulationForm,
    documentView: DocumentCentricFormulation,
  },
  
  // Define the navigation items for this module
  navigationItems: [
    {
      id: 'all_formulations',
      name: 'All Formulations',
      icon: '📋',
      path: '/formulations',
      children: [
        {
          id: 'recent_formulations',
          name: 'Recent',
          icon: '🕒',
          path: '/formulations?filter=recent',
        },
        {
          id: 'my_formulations',
          name: 'My Formulations',
          icon: '👤',
          path: '/formulations?filter=mine',
        }
      ]
    },
    {
      id: 'ingredients',
      name: 'Ingredients',
      icon: '🧪',
      path: '/ingredients',
    },
    {
      id: 'create_formulation',
      name: 'Create New',
      icon: '➕',
      path: '/formulations/new',
    },
    {
      id: 'formulation_stats',
      name: 'Analytics',
      icon: '📊',
      path: '/formulations/analytics',
    }
  ],
  
  // Define module-specific settings
  settings: {
    defaultView: 'list',
    enableVersioning: true,
    enableDocumentView: true,
    enableAnalytics: true,
    useRepository: true,
    defaultSorting: 'created_at:desc',
    itemsPerPage: 20,
  }
});

// Automatically register this module with the registry
registerModule(formulationsModule);

// Export the module
export default formulationsModule;

// Export module components for convenience
export { 
  ModuleFormulationList,
  ModuleFormulationDetails,
  ModuleFormulationForm,
  DocumentCentricFormulation,
};

// Re-export legacy components for backward compatibility
export { 
  default as FormulationList 
} from '@/components/FormulationList';

export { 
  default as FormulationDetails 
} from '@/components/FormulationDetails';

export { 
  default as FormulationForm 
} from '@/components/FormulationForm';