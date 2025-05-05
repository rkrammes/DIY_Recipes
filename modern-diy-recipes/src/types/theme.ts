/**
 * Shared theme types file
 * This breaks circular dependencies by providing a central location for theme types
 */

// Support both legacy string-based themes and the newer theme object
export type Theme = string;

// Legacy theme names
export type LegacyThemeName = 'hackers' | 'dystopia' | 'neotopia';

// Display names for themes in the UI
export const themeDisplayNames: Record<string, string> = {
  hackers: 'Hackers Terminal',
  dystopia: 'Dystopian Noir',
  neotopia: 'Neotopia Light',
  synthwave: 'Synthwave Remix',
  'synthwave-noir': 'Synthwave Noir',
  modern: 'Modern Clean'
};

// Modern theme names
export type ModernThemeName = 
  | 'light' 
  | 'dark'
  | 'terminal'
  | 'vintage'
  | 'hacker'
  | 'papercraft'
  | 'minimal'
  | 'modern'
  | 'system';

// Theme colors for immediate use
export const themeColors: Record<string, { bg: string; text: string; accent: string }> = {
  hackers: {
    bg: '#0a0e12',
    text: '#33ff33',
    accent: '#ff00ff'
  },
  dystopia: {
    bg: '#1a1a2e',
    text: '#e94560',
    accent: '#16213e'
  },
  neotopia: {
    bg: '#f5f5f5',
    text: '#121212',
    accent: '#3a86ff'
  }
};

// Bidirectional mappings for legacy support
export const legacyThemeMapping: Record<LegacyThemeName, ModernThemeName> = {
  hackers: 'terminal',
  dystopia: 'dark',
  neotopia: 'light'
};

export const reverseLegacyMapping: Record<ModernThemeName, LegacyThemeName> = {
  terminal: 'hackers',
  dark: 'dystopia',
  light: 'neotopia',
  vintage: 'dystopia',
  hacker: 'hackers',
  papercraft: 'neotopia',
  minimal: 'neotopia',
  modern: 'dystopia',
  system: 'hackers' // Default fallback
};

// Type check helpers
export function isValidTheme(theme?: string | null): theme is Theme {
  if (!theme) return false;
  return Object.keys(themeColors).includes(theme);
}

export function getNormalizedTheme(theme?: string | null): Theme {
  if (!theme || !isValidTheme(theme)) {
    return 'hackers'; // Default fallback
  }
  return theme;
}

export function getSystemPreferredTheme(): Theme {
  try {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'hackers' : 'neotopia';
    }
  } catch (err) {
    console.warn('Error detecting system theme preference', err);
  }
  return 'hackers'; // Default fallback
}

// Context types
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | string) => void;
  toggleTheme: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  themeReady: boolean;
}

export interface AnimationContextType {
  isReducedMotion: boolean;
  getThemeVariants: (variant: string) => any;
  theme: Theme;
}

export interface AudioContextType {
  isEnabled: boolean;
  toggleAudio: () => void;
  playSound: (type: string) => void;
  setVolume: (volume: number) => void;
}

// For typescript compatibility, also declare the ThemeScript execution flag
declare global {
  interface Window {
    __themeScriptExecuted?: boolean;
  }
}