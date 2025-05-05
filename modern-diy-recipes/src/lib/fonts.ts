import { Geist, Geist_Mono } from 'next/font/google';
import { Inter, JetBrains_Mono, Space_Mono, Roboto_Mono, IBM_Plex_Mono } from 'next/font/google';
import LocalFont from 'next/font/local';
import type { Theme } from '../providers/ThemeProvider';

// Primary modern sans-serif font
export const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

// Primary modern monospace font
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

// Alternate modern sans-serif
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Alternate programmer-friendly monospace
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

// Secondary monospace fonts
export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
});

export const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

// Load local fonts
export const vgaFont = LocalFont({
  src: '../../public/fonts/Px437_IBM_VGA_8x16.woff',
  display: 'swap',
  variable: '--font-vga',
});

export const shareTechMono = LocalFont({
  src: '../../public/fonts/Share_Tech_Mono.woff',
  display: 'swap',
  variable: '--font-share-tech-mono',
});

// Define type for font variables
export interface FontVariables {
  body: string;
  heading: string;
  mono: string;
  display: string;
  terminal: string;
}

// Define font variable mapping by theme
export const themeFontVariables: Record<Theme, FontVariables> = {
  hackers: {
    body: 'var(--font-geist-sans, -apple-system, system-ui, sans-serif)',
    heading: 'var(--font-geist-sans, -apple-system, system-ui, sans-serif)',
    mono: 'var(--font-geist-mono, ui-monospace, monospace)',
    display: 'var(--font-space-mono, monospace)',
    terminal: 'var(--font-space-mono, monospace)',
  },
  dystopia: {
    body: 'var(--font-vga, monospace)',
    heading: 'var(--font-vga, monospace)',
    mono: 'var(--font-vga, monospace)',
    display: 'var(--font-share-tech-mono, monospace)',
    terminal: 'var(--font-vga, monospace)',
  },
  neotopia: {
    body: 'var(--font-inter, -apple-system, system-ui, sans-serif)',
    heading: 'var(--font-inter, -apple-system, system-ui, sans-serif)',
    mono: 'var(--font-ibm-plex-mono, ui-monospace, monospace)',
    display: 'var(--font-inter, -apple-system, system-ui, sans-serif)',
    terminal: 'var(--font-ibm-plex-mono, monospace)',
  },
};

// Support for legacy theme names
export const getLegacyThemeFonts = (theme: string): Record<string, string> => {
  if (theme === 'synthwave-noir') return themeFontVariables.hackers;
  if (theme === 'terminal-mono') return themeFontVariables.dystopia;
  if (theme === 'paper-ledger') return themeFontVariables.neotopia;
  return themeFontVariables.hackers; // default
};

// CSS variable mapping helper
export const generateFontCSSVars = (theme: Theme): Record<string, string> => {
  try {
    const fontVars = themeFontVariables[theme] || themeFontVariables.hackers;
    
    // Ensure we have valid values with fallbacks
    const body = fontVars.body || '-apple-system, system-ui, sans-serif';
    const heading = fontVars.heading || '-apple-system, system-ui, sans-serif';
    const mono = fontVars.mono || 'ui-monospace, monospace';
    const display = fontVars.display || '-apple-system, system-ui, sans-serif';
    const terminal = fontVars.terminal || 'ui-monospace, monospace';
    
    return {
      '--font-body': body,
      '--font-heading': heading,
      '--font-mono': mono,
      '--font-display': display,
      '--font-terminal': terminal,
    };
  } catch (error) {
    console.error('Error generating font CSS variables:', error);
    // Return safe fallback values in case of error
    return {
      '--font-body': '-apple-system, system-ui, sans-serif',
      '--font-heading': '-apple-system, system-ui, sans-serif',
      '--font-mono': 'ui-monospace, monospace',
      '--font-display': '-apple-system, system-ui, sans-serif',
      '--font-terminal': 'ui-monospace, monospace',
    };
  }
};

// Get all font variables for use in layout
export const getAllFontVariables = (): string => {
  return [
    geistSans.variable,
    geistMono.variable,
    inter.variable,
    jetbrainsMono.variable,
    spaceMono.variable,
    ibmPlexMono.variable,
    robotoMono.variable,
    vgaFont.variable,
    shareTechMono.variable,
  ].join(' ');
};