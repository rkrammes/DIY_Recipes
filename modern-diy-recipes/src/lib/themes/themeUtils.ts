import { Theme } from '@/types/theme';

// Array of available themes
export const AVAILABLE_THEMES: Theme[] = ['hackers', 'dystopia', 'neotopia'];

// Dark themes in the application
export const DARK_THEMES: Theme[] = ['hackers', 'dystopia'];

// Theme color definitions for each theme
export const THEME_COLORS: Record<Theme, Record<string, string>> = {
  hackers: {
    background: '#121212',
    text: '#33ff33',
    accent: '#00cc00',
    secondary: '#006600',
    surface: '#1a1a1a',
    border: '#333333',
    warning: '#ffcc00',
    error: '#ff3333',
    success: '#00cc00',
  },
  dystopia: {
    background: '#0a0a0f',
    text: '#eceadf',
    accent: '#e6625e',
    secondary: '#3a506b',
    surface: '#1f2833',
    border: '#2d3748',
    warning: '#f9a826',
    error: '#e63946',
    success: '#52b788',
  },
  neotopia: {
    background: '#ffffff',
    text: '#333333',
    accent: '#0066cc',
    secondary: '#4a6fa5',
    surface: '#f5f5f5',
    border: '#e2e8f0',
    warning: '#ffa000',
    error: '#d32f2f',
    success: '#388e3c',
  },
};

/**
 * Map from legacy theme names to normalized names
 */
export const LEGACY_THEME_MAP: Record<string, Theme> = {
  // Legacy theme names
  hackers: 'hackers',
  dystopia: 'dystopia',
  neotopia: 'neotopia',
  
  // Common theme aliases
  terminal: 'hackers',
  dark: 'dystopia',
  light: 'neotopia',
  
  // Default is hackers
  default: 'hackers',
};

/**
 * Checks if a theme is valid
 */
export function isValidTheme(theme: string): theme is Theme {
  return AVAILABLE_THEMES.includes(theme as Theme);
}

/**
 * Get a normalized theme name (with fallback to default)
 */
export function getNormalizedTheme(theme: string | null | undefined): Theme {
  if (!theme) return 'hackers';
  
  // Handle legacy theme names
  const normalizedTheme = LEGACY_THEME_MAP[theme] || theme;
  
  // Check if it's a valid theme
  if (isValidTheme(normalizedTheme)) {
    return normalizedTheme;
  }
  
  // Fallback to default theme
  return 'hackers';
}

/**
 * Get system preferred theme based on prefers-color-scheme media query
 */
export function getSystemPreferredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'hackers'; // Default for SSR
  }
  
  // Check if user prefers dark mode
  const prefersDark = window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return prefersDark ? 'dystopia' : 'neotopia';
}

/**
 * Checks if a theme is a dark theme
 */
export function isDarkTheme(theme: Theme): boolean {
  return DARK_THEMES.includes(theme);
}

/**
 * Gets all colors for a specific theme
 */
export function getThemeColors(theme: Theme): Record<string, string> {
  return THEME_COLORS[theme] || THEME_COLORS['hackers'];
}

/**
 * Cycles to the next theme in the list
 */
export function getNextTheme(currentTheme: Theme): Theme {
  const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
  
  if (currentIndex === -1) {
    return AVAILABLE_THEMES[0];
  }
  
  const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
  return AVAILABLE_THEMES[nextIndex];
}