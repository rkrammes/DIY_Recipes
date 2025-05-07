// Export everything from themeContext
export * from './themeContext';

// Export everything from themeUtils
export * from './themeUtils';

// Export the ThemeProvider
export { default as ThemeProvider } from './UnifiedThemeProvider';

// Re-export for backward compatibility
export { ThemeProvider as UnifiedThemeProvider } from './compatibilityExports';
export { ThemeProvider as SimpleThemeProvider } from './compatibilityExports';
export { ThemeProvider as FixedThemeProvider } from './compatibilityExports';