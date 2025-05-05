'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Fonts component with SSR disabled
const Fonts = dynamic(() => import('./Fonts'), {
  ssr: false,
});

// Dynamically import the FontPreloader component with SSR disabled
const FontPreloader = dynamic(() => import('./FontPreloader'), {
  ssr: false,
});

export default function ClientFontsWrapper() {
  return (
    <>
      <FontPreloader />
      <Fonts />
    </>
  );
}