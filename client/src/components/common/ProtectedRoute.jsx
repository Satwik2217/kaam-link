import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loader from './Loader';

/**
 * Wraps routes that require authentication.
 * Optionally restricts to specific roles.
 *
 * Usage:
 *   <ProtectedRoute>              (just requires login)
 *   <ProtectedRoute role="worker"> (requires login + worker role)
 *   <ProtectedRoute role="employer"> (requires login + employer role)
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner during initial auth check
  if (isLoading) {
    return <Loader fullScreen message="Verifying your session..." />;
  }

  // Not logged in: redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role mismatch: redirect to their correct dashboard
  if (role && user?.role !== role) {
    const dashboardPath =
      user?.role === 'worker' ? '/worker/dashboard' : '/employer/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

