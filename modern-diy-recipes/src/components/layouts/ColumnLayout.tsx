"use client";

import React, { ReactNode } from 'react';

interface ColumnProps {
  children: ReactNode;
  width?: string | number;
  className?: string;
}

/**
 * Column component for the ColumnLayout
 */
export function Column({ children, width, className = '' }: ColumnProps) {
  const widthClass = typeof width === 'string' 
    ? width 
    : width 
      ? `w-[${width}px]` 
      : '';
  
  return (
    <div className={`h-full overflow-auto border-r border-border-subtle ${widthClass} ${className}`}>
      {children}
    </div>
  );
}

interface ColumnLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * ColumnLayout - Flexible column-based layout
 * 
 * This component creates a horizontal layout with one or more columns.
 * Each column can have a fixed width or a flexible width.
 * 
 * Usage:
 * ```jsx
 * <ColumnLayout>
 *   <Column width={200}>Sidebar content</Column>
 *   <Column>Main content</Column>
 *   <Column width={300}>Details panel</Column>
 * </ColumnLayout>
 * ```
 */
export default function ColumnLayout({ children, className = '' }: ColumnLayoutProps) {
  return (
    <div className={`flex h-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface ColumnHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * ColumnHeader - Header component for a column
 */
export function ColumnHeader({ children, className = '' }: ColumnHeaderProps) {
  return (
    <div className={`p-2 border-b border-border-subtle bg-surface-1 ${className}`}>
      {children}
    </div>
  );
}

interface ColumnFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * ColumnFooter - Footer component for a column
 */
export function ColumnFooter({ children, className = '' }: ColumnFooterProps) {
  return (
    <div className={`p-2 border-t border-border-subtle bg-surface-1 ${className}`}>
      {children}
    </div>
  );
}

interface ColumnContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * ColumnContent - Content area for a column
 */
export function ColumnContent({ children, className = '' }: ColumnContentProps) {
  return (
    <div className={`flex-1 overflow-auto ${className}`}>
      {children}
    </div>
  );
}