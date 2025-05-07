/**
 * TypeScript interface for feature flags used with modules
 */

// Import existing feature flags
import baseFeatureFlags from '@/lib/feature-flags';

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

// Helper function to check if a module-specific feature is enabled
export function isModuleFeatureEnabled(moduleId: string, featureKey?: string): boolean {
  // Basic module enablement check
  const moduleKey = `module_${moduleId}`;
  const isModuleEnabled = baseFeatureFlags[moduleKey] ?? true;
  
  // If no specific feature is requested, just check if the module is enabled
  if (!featureKey) return isModuleEnabled;
  
  // For specific features, check both module enablement and feature enablement
  const featureFlagKey = `${moduleId}_${featureKey}`;
  return isModuleEnabled && (baseFeatureFlags[featureFlagKey] ?? false);
}

// Helper function to get all feature flags with module-specific flags
export function getAllFeatureFlags(): FeatureFlags {
  // Start with base feature flags
  const allFlags = { ...baseFeatureFlags };
  
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