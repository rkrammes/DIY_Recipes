import { ReactNode } from 'react';

/**
 * Type definitions for layout components
 */

export interface ColumnProps {
  children: ReactNode;
  width?: string | number;
  className?: string;
}

export interface ColumnHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface ColumnFooterProps {
  children: ReactNode;
  className?: string;
}

export interface ColumnContentProps {
  children: ReactNode;
  className?: string;
}

export interface ModuleLayoutProps {
  moduleId: string;
  listContent?: ReactNode;
  detailContent?: ReactNode;
  extraContent?: ReactNode;
  selectedId?: string | null;
  onSelectItem?: (id: string | null) => void;
}

export interface ModularLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface EnhancedModularLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  navVariant?: 'sidebar' | 'terminal' | 'minimal';
  className?: string;
}