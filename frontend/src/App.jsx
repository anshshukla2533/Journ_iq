import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import LoadingTransition from './components/Common/LoadingTransition';
import useAuth from './hooks/useAuth';
import useNews from './hooks/useNews';


// Lazy load the dashboard for better initial load performance
const DashboardPage = React.lazy(() => import('./components/Dashboard/DashboardPage'));

function App() {
  const auth = useAuth();
  const { news, fetchNews } = useNews();
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await auth.checkAuthStatus();
        setIsInitialized(true);
        if (!isAuthenticated && location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsInitialized(true);
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, []);

  // Handle routing after auth check
  useEffect(() => {
    if (!isInitialized) return;

    if (!auth.token && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (auth.token && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.token, location.pathname, navigate, isInitialized]);

  useEffect(() => {
    if (auth.user && location.pathname.startsWith('/dashboard')) {
      fetchNews();
    }
  }, [auth.user, location.pathname, fetchNews]);

  const handleLogin = async () => {
    const success = await auth.login();
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/', { replace: true });
  };

  // Use the loading transition component
  if (auth.isLoading) {
    return <LoadingTransition />;
  }

  return (
    <div className={`App min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50 ${location.pathname === '/login' ? 'auth-mode' : ''}`}>
      <div className="w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={
            auth.token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage
                authMode={auth.authMode}
                setAuthMode={auth.setAuthMode}
                loginForm={auth.loginForm}
                setLoginForm={auth.setLoginForm}
                registerForm={auth.registerForm}
                setRegisterForm={auth.setRegisterForm}
                onLogin={handleLogin}
                onRegister={auth.register}
              />
            )
          } />
          <Route path="/dashboard/*" element={
            !auth.token ? (
              <Navigate to="/login" replace />
            ) : (
              <Suspense fallback={<LoadingTransition />}>
                <DashboardPage user={auth.user} news={news} onLogout={handleLogout} />
              </Suspense>
            )
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;