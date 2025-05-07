'use client';

import React, { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFamilyAuth } from '@/lib/auth/familyAuth';
import FamilyLoginScreen from './FamilyLoginScreen';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'parent' | 'child' | 'guest';
  requiredModuleAccess?: string;
  fallback?: ReactNode;
}

/**
 * AuthGuard - Component to protect routes based on authentication state
 * 
 * This component ensures that users are authenticated and have the required
 * permissions before accessing protected content.
 */
export default function AuthGuard({
  children,
  requiredRole,
  requiredModuleAccess,
  fallback
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentMember, hasAccessToModule } = useFamilyAuth();
  
  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <FamilyLoginScreen />;
  }
  
  // If role check is required and user doesn't have the required role
  if (requiredRole && currentMember?.role !== requiredRole) {
    // Parent can access everything
    if (currentMember?.role === 'parent') {
      return <>{children}</>;
    }
    
    // If a fallback is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise, show access denied message
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Access Restricted</h2>
        <p className="mb-4">
          This section requires {requiredRole} access.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  // If module access check is required and user doesn't have access
  if (requiredModuleAccess && !hasAccessToModule(requiredModuleAccess)) {
    // If a fallback is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise, show access denied message
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Module Access Restricted</h2>
        <p className="mb-4">
          You don't have access to this module.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  // All checks passed, render the children
  return <>{children}</>;
}