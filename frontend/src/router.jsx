import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import LoadingTransition from './components/Common/LoadingTransition';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import NotesPage from './pages/NotesPage';
import NewsPage from './pages/NewsPage';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import NotificationsPage from './pages/NotificationsPage';
import TodoPage from './pages/TodoPage';
import YouTubePage from './pages/YouTubePage';
import SearchPage from './pages/SearchPage';
import StudioPage from './pages/StudioPage';
import AuthPage from './components/Auth/AuthPage';
import OAuthCallback from './components/Auth/OAuthCallback';
import authService from './services/authService';
const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return <LoadingTransition />;
  if (!token) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return <LoadingTransition />;
  if (token) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const AuthWrapper = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const success = await auth.login();
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleRegister = async () => {
    const success = await auth.register();
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthPage
      authMode={auth.authMode}
      setAuthMode={auth.setAuthMode}
      loginForm={auth.loginForm}
      setLoginForm={auth.setLoginForm}
      registerForm={auth.registerForm}
      setRegisterForm={auth.setRegisterForm}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onGoogleLogin={() => {
        window.location.href = authService.getGoogleAuthUrl();
      }}
    />
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthWrapper />
      </PublicRoute>
    ),
  },
  {
    path: '/auth/callback',
    element: <OAuthCallback />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingTransition />}>
          <DashboardLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'notes',
        element: <NotesPage />,
      },
      {
        path: 'studio',
        element: <StudioPage />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
      {
        path: 'friends',
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'todo',
        element: <TodoPage />,
      },
      {
        path: 'videos',
        element: <YouTubePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
