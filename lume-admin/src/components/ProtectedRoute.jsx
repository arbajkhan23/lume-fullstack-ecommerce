import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base text-muted text-sm">
        Loading LUMÉ Admin…
      </div>
    );
  }
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}
