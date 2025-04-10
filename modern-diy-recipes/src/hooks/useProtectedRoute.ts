import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from './useAuth';

/**
 * React hook to protect client-side routes.
 * Redirects to /signin if user is not authenticated.
 */
export const useProtectedRoute = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);
};

export default useProtectedRoute;