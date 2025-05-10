/**
 * TypeScript interface for feature flags used with modules
 * 
 * This file integrates with the environment validation system to provide
 * comprehensive feature flag management for the module system.
 */

// Import existing feature flags
import baseFeatureFlags from '@/lib/feature-flags';
import { isFeatureEnabled as checkEnvironmentFeature } from '@/lib/environmentValidator';

// Type definition for module-specific feature flags
export interface ModuleFeatureFlags {
  // Automatically include module activation flags based on module IDs
  [key: `module_${string}`]: boolean;
  
  // Other module-specific feature flags can be added here
  // For example:
  // formulation_printing: boolean;
  // formulation_sharing: boolean;
}

// Union of base feature flags and module feature flags for complete typing
export type FeatureFlags = typeof baseFeatureFlags & ModuleFeatureFlags;

/**
 * Enhanced version of isModuleFeatureEnabled that integrates with the environment validator
 * @param moduleId The ID of the module
 * @param featureKey Optional specific feature within the module
 * @returns boolean indicating if the module/feature is enabled
 */
export function isModuleFeatureEnabled(moduleId: string, featureKey?: string): boolean {
  // Check if modules are enabled globally first via environment validator
  const modulesEnabled = checkEnvironmentFeature('modules');
  if (!modulesEnabled) return false;
  
  // If modules are enabled, then check for specific module enablement
  
  // Basic module enablement check
  const moduleKey = `module_${moduleId}`;
  const isModuleEnabled = baseFeatureFlags[moduleKey] ?? true;
  
  // If no specific feature is requested, just check if the module is enabled
  if (!featureKey) return isModuleEnabled;
  
  // For specific features, check both module enablement and feature enablement
  const featureFlagKey = `${moduleId}_${featureKey}`;
  
  // Check module-specific feature flags
  return isModuleEnabled && (baseFeatureFlags[featureFlagKey] ?? false);
}

/**
 * Get all feature flags including module-specific flags
 * @returns FeatureFlags object with all feature flags
 */
export function getAllFeatureFlags(): FeatureFlags {
  // Start with base feature flags
  const allFlags = { ...baseFeatureFlags };
  
  // Add environment-based flags
  const environmentFeatures = [
    'modules',
    'recipe-versioning',
    'audio',
    'dev-login',
    'fallback-data',
    'context7',
    'terminal-ui',
    'document-mode'
  ];
  
  // Override flags from environment
  environmentFeatures.forEach(feature => {
    const camelCaseFeature = feature.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    allFlags[camelCaseFeature] = checkEnvironmentFeature(feature);
  });
  
  // Add module flags from localStorage if available 
  if (typeof window !== 'undefined') {
    try {
      const storedFlags = localStorage.getItem('featureFlags');
      if (storedFlags) {
        const moduleFlags = JSON.parse(storedFlags);
        Object.assign(allFlags, moduleFlags);
      }
    } catch (e) {
      console.warn('Error loading module feature flags:', e);
    }
  }
  
  return allFlags as FeatureFlags;
}