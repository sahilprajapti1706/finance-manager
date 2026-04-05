import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

/**
 * Guard component for routes that require authentication.
 * Optional role-based restriction (RBAC) at the route level.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Not logged in? Redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role restriction? Check if user role is allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If analyst/admin, maybe show dashboard, if viewer, maybe show records?
    // For simplicity, redirect to dashboard or base authorized route
    return <Navigate to="/" replace />;
  }

  // 3. Authorized -> Render the child components or nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
