/**
 * Typography System
 * 
 * This module defines standardized font sizes for consistency across the application.
 * It provides a type-safe way to apply font sizes based on semantic meaning rather than
 * arbitrary values.
 */

// Font size scale in rem units
export const fontSizes = {
  // Display sizes (for large headers and splash screens)
  display1: '3rem',    // 48px
  display2: '2.5rem',  // 40px
  display3: '2rem',    // 32px
  
  // Heading sizes
  h1: '1.75rem',       // 28px
  h2: '1.5rem',        // 24px
  h3: '1.25rem',       // 20px
  h4: '1.125rem',      // 18px
  
  // Body text sizes
  bodyLarge: '1rem',   // 16px
  bodyMedium: '0.875rem', // 14px
  bodySmall: '0.75rem',   // 12px
  
  // Terminal/monospace specific sizes
  terminalLarge: '1.125rem',  // 18px
  terminalMedium: '0.875rem', // 14px
  terminalSmall: '0.75rem',   // 12px
  terminalMicro: '0.625rem',  // 10px
  
  // Utility sizes
  micro: '0.625rem',    // 10px
  nano: '0.5rem',       // 8px
};

// Line height scale (unitless multipliers)
export const lineHeights = {
  tight: 1.1,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2
};

// Font weights
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

// Font families
export const fontFamilies = {
  mono: 'IBM Plex Mono, JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  terminal: 'VT323, Px437, "Share Tech Mono", monospace',
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif'
};

// Helper function to create CSS class for font size
export function getFontSizeClass(size: keyof typeof fontSizes): string {
  return `text-[${fontSizes[size]}]`;
}

// Helper function to get line height class
export function getLineHeightClass(height: keyof typeof lineHeights): string {
  return `leading-[${lineHeights[height]}]`;
}

// Helper function to get font weight class
export function getFontWeightClass(weight: keyof typeof fontWeights): string {
  return `font-${fontWeights[weight]}`;
}

// Helper function to get typescript-friendly class name
export function getTypographyClasses(
  size: keyof typeof fontSizes,
  lineHeight: keyof typeof lineHeights = 'normal',
  weight: keyof typeof fontWeights = 'regular',
  family: keyof typeof fontFamilies = 'mono'
): string {
  return `text-[${fontSizes[size]}] leading-[${lineHeights[lineHeight]}] font-[${fontWeights[weight]}] font-${family}`;
}

export default {
  fontSizes,
  lineHeights,
  fontWeights,
  fontFamilies,
  getFontSizeClass,
  getLineHeightClass,
  getFontWeightClass,
  getTypographyClasses
};