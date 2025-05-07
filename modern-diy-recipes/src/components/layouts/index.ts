/**
 * Layout Components Export
 * 
 * This file exports all layout components to provide a consistent interface
 * for importing and using layouts across the application.
 */

// Export base layout components
export { default as ColumnLayout, Column, ColumnHeader, ColumnContent, ColumnFooter } from './ColumnLayout';

// Export module-specific layouts
export { default as ModuleLayout } from './ModuleLayout';
export { default as ModularLayout } from './ModularLayout';
export { default as EnhancedModularLayout } from './EnhancedModularLayout';

// Export types for layouts
export type { 
  ColumnProps, 
  ColumnContentProps, 
  ColumnFooterProps, 
  ColumnHeaderProps,
  ModuleLayoutProps,
  ModularLayoutProps,
  EnhancedModularLayoutProps
} from './types';