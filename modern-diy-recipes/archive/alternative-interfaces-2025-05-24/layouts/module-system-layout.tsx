"use client";

import React, { ReactNode, useEffect } from 'react';
import { ModuleProvider } from '@/lib/modules';
import { initializeModules } from '@/modules';

interface ModuleSystemLayoutProps {
  children: ReactNode;
}

/**
 * ModuleSystemLayout - Wraps the application with the ModuleProvider
 * 
 * This layout component initializes the module registry and provides
 * module context to the entire application.
 */
export default function ModuleSystemLayout({ children }: ModuleSystemLayoutProps) {
  // Initialize all modules when the layout mounts
  useEffect(() => {
    console.log('Initializing modules...');
    initializeModules();
  }, []);

  return (
    <ModuleProvider>
      {children}
    </ModuleProvider>
  );
}