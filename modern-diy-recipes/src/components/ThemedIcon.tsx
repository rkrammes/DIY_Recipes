'use client';

import React from 'react';
// Use standard img tag instead of next/image to avoid optimization errors
// import Image from 'next/image';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemedIconProps {
  iconType: 'file' | 'globe' | 'window' | 'recipe' | 'ingredient' | 'tool';
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * Component that displays an icon that matches the current theme
 */
export default function ThemedIcon({ 
  iconType, 
  width = 24, 
  height = 24, 
  className = '',
  alt = 'Icon'
}: ThemedIconProps) {
  const { theme } = useTheme();
  
  // Select proper icon path based on theme
  const getIconPath = () => {
    let normalizedTheme = theme;
    
    // Handle other theme names by mapping to our main themes
    if (!['hackers', 'dystopia', 'neotopia'].includes(theme)) {
      // Default to hackers theme for unknown themes
      normalizedTheme = 'hackers';
    }
    
    return `/icons/${iconType}-${normalizedTheme}.svg`;
  };
  
  return (
    <div 
      className={`inline-block themed-icon ${iconType}-icon ${className}`}
      style={{ width, height, position: 'relative' }}
    >
      <img
        src={getIconPath()}
        alt={alt}
        width={width}
        height={height}
        style={{ 
          objectFit: 'contain',
          filter: theme === 'dystopia' ? 'drop-shadow(0 0 2px rgba(233, 69, 96, 0.7))' : 'none'
        }}
      />
    </div>
  );
}