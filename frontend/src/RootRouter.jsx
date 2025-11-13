import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import OAuthCallback from './components/Auth/OAuthCallback';
import useAuth from './hooks/useAuth';
import LoadingTransition from './components/Common/LoadingTransition';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingTransition />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (accessible only when not authenticated)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingTransition />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
