import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'student' | 'client';
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">Access Denied</h1>
          <p className="text-[var(--color-text-muted)] mb-4">
            You don't have permission to access this page
          </p>
          <button onClick={() => window.history.back()} className="text-[var(--color-primary)]">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}