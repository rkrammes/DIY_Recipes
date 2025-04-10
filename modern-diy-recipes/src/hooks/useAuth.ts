import { useAuthContext } from '../providers/AuthProvider';

/**
 * React hook to access authentication context.
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;