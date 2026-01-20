import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for requiring authentication for actions.
 * Returns a wrapper function that redirects to auth if not logged in.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  /**
   * Check if authenticated, redirect to /auth if not
   * @returns true if authenticated, false if redirected
   */
  const requireAuth = useCallback((): boolean => {
    if (!user) {
      navigate('/auth');
      return false;
    }
    return true;
  }, [user, navigate]);

  /**
   * Wrap an action to require authentication
   */
  const withAuth = useCallback(
    <T extends (...args: any[]) => any>(action: T): T => {
      return ((...args: Parameters<T>) => {
        if (!user) {
          navigate('/auth');
          return;
        }
        return action(...args);
      }) as T;
    },
    [user, navigate]
  );

  /**
   * Wrap an async action to require authentication
   */
  const withAuthAsync = useCallback(
    <T extends (...args: any[]) => Promise<any>>(action: T): T => {
      return (async (...args: Parameters<T>) => {
        if (!user) {
          navigate('/auth');
          return;
        }
        return action(...args);
      }) as T;
    },
    [user, navigate]
  );

  return {
    /** Current user (null if not authenticated) */
    user,
    /** Whether auth state is loading */
    loading,
    /** Whether user is authenticated */
    isAuthenticated: !!user,
    /** Check auth and redirect if needed */
    requireAuth,
    /** Wrap a sync action to require auth */
    withAuth,
    /** Wrap an async action to require auth */
    withAuthAsync,
  };
}
