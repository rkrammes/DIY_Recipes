# Edge-Safe SSR Implementation Guide

This document outlines the implementation approach for edge-safe server-side rendering (SSR) to prevent Flash of Unstyled Content (FOUC) when the app loads. This is particularly important for the theming system to ensure a smooth user experience.

## 1. The FOUC Problem

When using themes in a Next.js application with SSR, a common issue is the "Flash of Unstyled Content" (FOUC) where the page initially renders with the default theme before switching to the user's preferred theme. This happens because:

1. The server renders the HTML with the default theme
2. The client loads and hydrates the React components
3. JavaScript reads the user's theme preference from localStorage
4. The theme is updated, causing a visible switch

This creates a jarring user experience, especially with high-contrast theme differences.

## 2. Edge-Safe Solution Overview

The solution involves:

1. **ThemeScript Component**: An inline script that runs before React hydration
2. **Critical CSS Inlining**: Including essential theme CSS in the initial HTML
3. **Suspense Boundary**: Wrapping the root layout to control rendering
4. **Cookie Fallback**: Using cookies as a fallback for theme detection

## 3. Implementation Architecture

### 3.1 ThemeScript Component

```tsx
// components/ThemeScript.tsx

'use client';

import { useEffect } from 'react';

// This component injects a script into the document head to prevent FOUC
export default function ThemeScript() {
  useEffect(() => {
    // This effect runs only on the client after hydration
    const theme = localStorage.getItem('theme') || 'synthwave-noir';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // This script runs before React hydration
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Try to get theme from localStorage
              let theme = localStorage.getItem('theme');
              
              // If no theme in localStorage, check cookies
              if (!theme) {
                const cookies = document.cookie.split('; ');
                for (let i = 0; i < cookies.length; i++) {
                  const cookie = cookies[i].split('=');
                  if (cookie[0] === 'theme') {
                    theme = cookie[1];
                    break;
                  }
                }
              }
              
              // If still no theme, check system preference
              if (!theme) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                theme = prefersDark ? 'synthwave-noir' : 'paper-ledger';
              }
              
              // Apply theme to document
              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {
              // Fallback to default theme
              document.documentElement.setAttribute('data-theme', 'synthwave-noir');
              console.error('Theme script error:', e);
            }
          })();
        `,
      }}
    />
  );
}
```

### 3.2 Root Layout with Suspense

```tsx
// app/layout.tsx

import React, { Suspense } from 'react';
import ThemeScript from '@/components/ThemeScript';
import { SettingsProvider } from '@/providers/SettingsProvider';
import '@/styles/globals.css';
import '@/styles/tokens.css';

// Critical CSS for themes
const criticalThemeCSS = `
  :root[data-theme="synthwave-noir"] {
    --surface-0: 60 25 300;
    --text-primary: 95 1 315;
    --accent: 70 30 330;
  }
  
  :root[data-theme="terminal-mono"] {
    --surface-0: 10 2 280;
    --text-primary: 85 1 100;
    --accent: 65 18 90;
  }
  
  :root[data-theme="paper-ledger"] {
    --surface-0: 94 2 90;
    --text-primary: 25 1 70;
    --accent: 60 16 40;
  }
  
  body {
    background-color: rgb(var(--surface-0));
    color: rgb(var(--text-primary));
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inline critical theme CSS */}
        <style dangerouslySetInnerHTML={{ __html: criticalThemeCSS }} />
        
        {/* Theme script runs before React hydration */}
        <ThemeScript />
      </head>
      <body>
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </Suspense>
      </body>
    </html>
  );
}
```

### 3.3 Enhanced SettingsProvider

```tsx
// providers/SettingsProvider.tsx (partial)

// ...existing imports

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ...existing state
  
  // Initialize theme from multiple sources
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Priority order:
    // 1. localStorage
    // 2. cookie
    // 3. system preference
    // 4. default theme
    
    let detectedTheme: Theme | null = null;
    
    // Check localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'synthwave-noir' || storedTheme === 'terminal-mono' || storedTheme === 'paper-ledger') {
      detectedTheme = storedTheme;
    }
    
    // Check cookies if no localStorage value
    if (!detectedTheme) {
      const cookies = document.cookie.split('; ');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split('=');
        if (cookie[0] === 'theme') {
          const cookieTheme = cookie[1];
          if (cookieTheme === 'synthwave-noir' || cookieTheme === 'terminal-mono' || cookieTheme === 'paper-ledger') {
            detectedTheme = cookieTheme;
          }
          break;
        }
      }
    }
    
    // Check system preference if still no theme
    if (!detectedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      detectedTheme = prefersDark ? 'synthwave-noir' : 'paper-ledger';
    }
    
    // Set the detected theme
    if (detectedTheme && detectedTheme !== theme) {
      setThemeState(detectedTheme);
    }
  }, []);
  
  // Sync theme to both localStorage and cookie for SSR
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Save to cookie for SSR
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // ...rest of component
};
```

### 3.4 Server Component Theme Detection

```tsx
// lib/theme-utils.ts

import { cookies, headers } from 'next/headers';
import type { Theme } from '@/providers/SettingsProvider';

// Get theme on the server for SSR
export function getServerTheme(): Theme {
  // Try to get theme from cookies
  const cookieStore = cookies();
  const themeCookie = cookieStore.get('theme');
  
  if (themeCookie?.value === 'synthwave-noir' || 
      themeCookie?.value === 'terminal-mono' || 
      themeCookie?.value === 'paper-ledger') {
    return themeCookie.value;
  }
  
  // Fallback to checking prefers-color-scheme header
  const headersList = headers();
  const prefersDark = headersList.get('sec-ch-prefers-color-scheme') === 'dark';
  
  return prefersDark ? 'synthwave-noir' : 'paper-ledger';
}
```

## 4. Critical CSS Optimization

### 4.1 Identifying Critical CSS

Critical CSS includes the minimal styles needed to render the initial view correctly. For the theming system, this includes:

1. Theme variables for all themes
2. Base styles for body and common elements
3. Layout styles for the initial view

### 4.2 Extracting Critical CSS

```typescript
// scripts/extract-critical-css.js

const fs = require('fs');
const path = require('path');
const criticalCss = require('critical');

async function extractCriticalCSS() {
  const result = await criticalCss.generate({
    base: 'out/',
    src: 'index.html',
    target: {
      css: 'styles/critical.css',
      html: 'index-critical.html',
      uncritical: 'styles/non-critical.css',
    },
    width: 1300,
    height: 900,
    ignore: {
      atrule: ['@font-face'],
    },
  });
  
  console.log('Critical CSS extracted!');
  return result;
}

extractCriticalCSS().catch(console.error);
```

### 4.3 Inline Critical CSS in Document Head

```tsx
// app/layout.tsx (partial)

import fs from 'fs';
import path from 'path';

// Read critical CSS at build time
const criticalCSS = process.env.NODE_ENV === 'production'
  ? fs.readFileSync(path.join(process.cwd(), 'styles/critical.css'), 'utf-8')
  : ''; // Empty in development

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inline critical CSS in production */}
        {process.env.NODE_ENV === 'production' && (
          <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        )}
        
        {/* Theme script */}
        <ThemeScript />
      </head>
      <body>
        {/* ... */}
      </body>
    </html>
  );
}
```

## 5. Performance Optimization

### 5.1 Minimizing Layout Shifts

To minimize Cumulative Layout Shift (CLS), we need to ensure that the initial render closely matches the final themed render:

```tsx
// components/ThemeAwareSkeleton.tsx

import { getServerTheme } from '@/lib/theme-utils';

export default function ThemeAwareSkeleton() {
  // Get theme on the server
  const theme = getServerTheme();
  
  // Apply theme-specific skeleton styles
  return (
    <div className={`skeleton-container ${theme}`}>
      <div className="skeleton-header" />
      <div className="skeleton-content">
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
      </div>
    </div>
  );
}
```

### 5.2 Deferred Non-Critical CSS

```tsx
// components/DeferredStyles.tsx

'use client';

import { useEffect, useState } from 'react';

export default function DeferredStyles() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Load non-critical CSS after hydration
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/non-critical.css';
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return null;
}
```

### 5.3 Preloading Theme Assets

```tsx
// app/layout.tsx (partial)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server theme for preloading assets
  const serverTheme = getServerTheme();
  
  return (
    <html lang="en">
      <head>
        {/* Preload theme-specific assets */}
        {serverTheme === 'synthwave-noir' && (
          <>
            <link rel="preload" href="/fonts/OCRAExtended.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
            <link rel="preload" href="/images/synthwave-bg.svg" as="image" />
          </>
        )}
        
        {serverTheme === 'terminal-mono' && (
          <>
            <link rel="preload" href="/fonts/ShareTechMono.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
            <link rel="preload" href="/images/terminal-bg.svg" as="image" />
          </>
        )}
        
        {serverTheme === 'paper-ledger' && (
          <>
            <link rel="preload" href="/fonts/Rajdhani.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
            <link rel="preload" href="/images/paper-texture.svg" as="image" />
          </>
        )}
        
        {/* Rest of head */}
      </head>
      <body>
        {/* ... */}
      </body>
    </html>
  );
}
```

## 6. Implementation Steps

1. **Create ThemeScript Component**
   - Implement script to detect and apply theme before hydration
   - Add fallbacks for different theme sources
   - Test with different scenarios (localStorage, cookies, system preference)

2. **Update Root Layout**
   - Add Suspense boundary around app content
   - Include ThemeScript in document head
   - Implement critical CSS inlining

3. **Enhance SettingsProvider**
   - Add multi-source theme detection
   - Implement theme synchronization to both localStorage and cookies
   - Ensure theme changes are reflected in the document

4. **Optimize Critical CSS**
   - Identify and extract critical CSS
   - Implement inline critical CSS in document head
   - Defer loading of non-critical CSS

5. **Implement Server Components**
   - Create server-side theme detection utilities
   - Implement theme-aware skeletons and loading states
   - Preload theme-specific assets

6. **Test and Optimize**
   - Test on different devices and browsers
   - Measure and optimize CLS and FCP metrics
   - Ensure smooth theme transitions

## 7. Testing Scenarios

| Scenario | Expected Behavior |
|----------|------------------|
| First visit, no preferences | Default theme applied, no FOUC |
| Return visit with localStorage | Stored theme applied immediately, no FOUC |
| Return visit, cleared localStorage but has cookie | Cookie theme applied, no FOUC |
| System dark mode, no stored preference | Dark theme applied, no FOUC |
| JavaScript disabled | Server-rendered theme applied consistently |
| Slow connection | Critical CSS ensures themed rendering while rest loads |

## 8. Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [CSS-Tricks: Flash of Unstyled Content](https://css-tricks.com/flash-of-unstyled-content/)
- [Web.dev: Optimize CLS](https://web.dev/optimize-cls/)
- [Critical CSS Extraction](https://github.com/addyosmani/critical)