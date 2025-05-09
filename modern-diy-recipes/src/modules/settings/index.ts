import { registerModule } from '@/lib/modules/registry';
import SettingsPanel from '@/Settings';

// Register the Settings module with the module registry system
registerModule({
  id: 'settings',
  name: 'Settings',
  icon: '⚙️',
  description: 'Application settings and user preferences',
  routes: [
    {
      path: '/settings',
      component: SettingsPanel,
      exact: true
    }
  ],
  // Define required components
  components: {
    list: SettingsPanel,
    detail: () => null, // Settings doesn't use detail view
    create: () => null,  // Settings doesn't use create view
  },
  // Navigation items for the module
  navigationItems: [
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      path: '/settings'
    }
  ],
  isEnabled: true, // Always enabled
  settings: {
    requiresAuth: false, // Settings are available to all users
    priority: 100, // Display at the end of navigation
  }
});