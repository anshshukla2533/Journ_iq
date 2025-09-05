import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import useAuth from './hooks/useAuth';
import useNews from './hooks/useNews';

function App() {
  const auth = useAuth();
  const { news, fetchNews } = useNews();
  const location = useLocation();
  const navigate = useNavigate();
  // On first load, check if user is logged in (from localStorage or OAuth)
  const [currentPage, setCurrentPage] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    return (storedUser && storedToken) ? 'dashboard' : 'login';
  });

  // If user is set (from OAuth/cookie), go to dashboard
  useEffect(() => {
    if (auth.user && currentPage !== 'dashboard') {
      setCurrentPage('dashboard');
      if (location.pathname.startsWith('/dashboard')) return;
      navigate('/dashboard');
    }
  }, [auth.user, currentPage, location.pathname, navigate]);

  useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchNews();
    }
  }, [currentPage, fetchNews]);

  const handleLogin = async () => {
    const success = await auth.login();
    if (success) {
      setCurrentPage('dashboard');
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentPage('login');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center">
      <div className="w-full">
        <Routes>
          <Route
            path="/"
            element={
              currentPage === 'login' ? (
                <Navigate to="/login" />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/login"
            element={
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
            }
          />
          <Route
            path="/dashboard/*"
            element={
              auth.user ? (
                <Routes>
                  <Route path="" element={<DashboardPage user={auth.user} news={news} onLogout={handleLogout} />} />
                  <Route path="news" element={<DashboardPage user={auth.user} news={news} onLogout={handleLogout} />} />
                  <Route path="notes" element={<DashboardPage user={auth.user} news={news} onLogout={handleLogout} />} />
                  <Route path="videos" element={<DashboardPage user={auth.user} news={news} onLogout={handleLogout} />} />
                </Routes>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;