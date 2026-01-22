/**
 * Admin Route Wrapper
 * 
 * Protects admin-only routes from unauthorized access
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/api/useAdmin';
import { LoadingSpinner } from '@/components/shared';
import { ShieldAlert } from 'lucide-react';

export function AdminRoute() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
