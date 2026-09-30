import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const {
    currentUser,
    loading
  } = useAuth();

  /*
   * Wait until Firebase determines the
   * authentication state.
   */
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking your account...</p>
      </div>
    );
  }

  /*
   * Unauthenticated users are redirected
   * to the login page.
   */
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  /*
   * Authenticated users can access the route.
   */
  return <Outlet />;
}

export default ProtectedRoute;