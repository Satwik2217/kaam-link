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

  // Feature A: Enforce KYC for Workers for specific routes (like accepting a job)
  // For now, we simply won't block /worker/dashboard (so they can see the banner)
  // But we CAN block /worker/my-bookings or similar routes if you want strict enforcement.
  // The prompt asked to take them to /worker/kyc before letting them access booking actions.
  if (
    user?.role === 'worker' &&
    location.pathname !== '/worker/dashboard' &&
    location.pathname !== '/worker/kyc' &&
    location.pathname !== '/worker/profile-setup'
  ) {
    // If they haven't submitted KYC or it was rejected
    if (user.kycStatus === 'not_submitted' || user.kycStatus === 'rejected') {
      return <Navigate to="/worker/kyc" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

