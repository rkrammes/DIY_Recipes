'use client';

import React from 'react';
import { DevAuthProvider } from './DevAuthProvider';

export default function McpAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <DevAuthProvider>
      {children}
    </DevAuthProvider>
  );
}