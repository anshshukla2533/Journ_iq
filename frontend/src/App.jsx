import React, { useEffect, Suspense } from 'react';
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

  // Redirect logic in useEffect
  useEffect(() => {
    // Skip redirects while loading
    if (auth.isLoading) return;

    // Redirect to dashboard if authenticated and on login page
    if (auth.token && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Redirect to login if not authenticated and on dashboard
    if (!auth.token && location.pathname.startsWith('/dashboard')) {
      navigate('/login', { replace: true });
      return;
    }
  }, [auth.token, auth.isLoading, location.pathname, navigate]);

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

  // Show loading transition during initial auth check
  if (auth.isLoading) {
    return <LoadingTransition />;
  }

  // Prevent rendering Routes if we're in a mismatch state (redirect needed)
  // This prevents the login page from briefly showing when user is authenticated
  const isAuthMismatch = (auth.token && location.pathname === '/login') || 
                         (!auth.token && location.pathname.startsWith('/dashboard'));
  
  if (isAuthMismatch) {
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
                isLoading={auth.isLoading}
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