/**
 * ThemeIconsCSS Component
 *
 * This component provides theme-specific SVG icons for the application 
 * using CSS variables for coloring, ensuring that the icons always reflect
 * the current theme without requiring React state management.
 */

import React from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Library icon component that adapts to the current theme via CSS
 */
export const LibraryIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" // Uses the CSS currentColor value
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`} // Uses a class for theme-based coloring
    >
      <rect x="4" y="4" width="16" height="16" rx="0"></rect>
      <line x1="4" y1="8" x2="20" y2="8"></line>
      <line x1="8" y1="4" x2="8" y2="20"></line>
      <rect x="10" y="10" width="8" height="4"></rect>
      <rect x="10" y="15" width="8" height="2"></rect>
    </svg>
  );
};

/**
 * Settings icon component that adapts to the current theme via CSS
 */
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" // Uses the CSS currentColor value
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`} // Uses a class for theme-based coloring
    >
      <path d="M4 8V4h4"></path>
      <path d="M20 8V4h-4"></path>
      <path d="M4 16v4h4"></path>
      <path d="M20 16v4h-4"></path>
      <rect x="10" y="4" width="4" height="4"></rect>
      <rect x="4" y="10" width="4" height="4"></rect>
      <rect x="16" y="10" width="4" height="4"></rect>
      <rect x="10" y="16" width="4" height="4"></rect>
    </svg>
  );
};

/**
 * Recipe icon component that adapts to the current theme via CSS
 */
export const RecipeIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" // Uses the CSS currentColor value
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`} // Uses a class for theme-based coloring
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
      <path d="M8 15h6" />
    </svg>
  );
};

/**
 * Ingredient icon component that adapts to the current theme via CSS
 */
export const IngredientIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" // Uses the CSS currentColor value
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`} // Uses a class for theme-based coloring
    >
      <path d="M10 2v8a2 2 0 0 1-2 2H2" />
      <path d="M2 6h6" />
      <path d="M14 2v8a2 2 0 0 0 2 2h6" />
      <path d="M22 6h-6" />
      <path d="M8 22v-7.5a2.5 2.5 0 0 1 5 0V22" />
      <path d="M16 22v-7.5a2.5 2.5 0 0 0-5 0" />
    </svg>
  );
};

/**
 * Tool icon component that adapts to the current theme via CSS
 */
export const ToolIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" // Uses the CSS currentColor value
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`} // Uses a class for theme-based coloring
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
};

/**
 * FileIcon component that adapts to the current theme via CSS
 */
export const FileIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" // Uses the CSS currentColor value
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`} // Uses a class for theme-based coloring
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="10" y1="9" x2="14" y2="9" />
    </svg>
  );
};

/**
 * Renders a theme-appropriate icon based on the icon type
 * This component uses CSS for theming rather than JS state
 */
export const ThemeIconCSS: React.FC<{ type: string; size?: number; className?: string }> = ({
  type,
  size = 24,
  className = ''
}) => {
  // Create icon components based on type
  if (['formulations', 'recipes', 'recipe'].includes(type)) {
    return <RecipeIcon size={size} className={className} />;
  } else if (['ingredients', 'ingredient'].includes(type)) {
    return <IngredientIcon size={size} className={className} />;
  } else if (['tools', 'tool'].includes(type)) {
    return <ToolIcon size={size} className={className} />;
  } else if (type === 'library') {
    return <LibraryIcon size={size} className={className} />;
  } else if (type === 'settings') {
    return <SettingsIcon size={size} className={className} />;
  } else if (type === 'file') {
    return <FileIcon size={size} className={className} />;
  }
  
  // Fallback - square with question mark using CSS theme coloring
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={`theme-icon ${className}`}
    >
      <rect x="4" y="4" width="16" height="16" />
      <text x="12" y="16" textAnchor="middle" fontSize="14" fill="currentColor">?</text>
    </svg>
  );
};

export default ThemeIconCSS;