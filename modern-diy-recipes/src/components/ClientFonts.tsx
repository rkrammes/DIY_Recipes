'use client';

import { useEffect, useState } from 'react';
import { getAllFontVariables } from '../lib/fonts';

/**
 * Component that safely applies font variables only on the client side
 * This prevents font loading during server-side rendering
 */
export function ClientFonts() {
  const [fontVariables, setFontVariables] = useState<string>('');
  
  useEffect(() => {
    try {
      // Get font variables safely on client only
      const variables = getAllFontVariables();
      setFontVariables(variables);
    } catch (error) {
      console.error('Error loading font variables:', error);
    }
  }, []);
  
  // Only render after we have font variables
  if (!fontVariables) {
    return null;
  }
  
  // This component doesn't render anything visible
  // It just adds the font variables class to body
  return (
    <div
      aria-hidden="true" 
      className={fontVariables}
      style={{ display: 'none' }}
      data-font-variables="loaded"
    />
  );
}