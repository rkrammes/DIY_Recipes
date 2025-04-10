import React, { ReactNode } from 'react';
import useAuth from '../../hooks/useAuth';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

/**
 * Wraps protected content. Redirects unauthenticated users.
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  useProtectedRoute();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;