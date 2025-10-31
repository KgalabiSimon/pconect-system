/**
 * Protected Route Component
 * Wraps components that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/api/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSecurity?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSecurity = false,
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      // Redirect to appropriate login page
      const loginPath = requireAdmin ? '/admin/login' : 
                      requireSecurity ? '/security/login' : 
                      '/login';
      router.push(loginPath);
      return;
    }

    // Check role requirements
    if (requireAdmin && user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    if (requireSecurity && user?.role !== 'security') {
      router.push('/unauthorized');
      return;
    }

    // If redirectTo is specified and user is authenticated, redirect there
    if (redirectTo && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, requireSecurity, redirectTo, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || 
      (requireAdmin && user?.role !== 'admin') ||
      (requireSecurity && user?.role !== 'security')) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
}

export function SecurityRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireSecurity={true}>
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

// Default export for backward compatibility
export default ProtectedRoute;
