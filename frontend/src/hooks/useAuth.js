import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

function getStoredJson(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(() => getStoredJson('user'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);

    if (nextToken && nextUser) {
      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const clearSession = () => {
    persistSession(null, null);
    setLoginForm({ identifier: '', password: '' });
    setRegisterForm({ name: '', username: '', email: '', password: '' });
  };

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);
    try {
      const response = await authService.getCurrentUser(storedToken);
      if (response.success && response.data) {
        persistSession(storedToken, response.data);
        return true;
      }

      clearSession();
      return false;
    } catch (error) {
      console.error('Failed to check auth session:', error);
      clearSession();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async () => {
    if (!loginForm.identifier || !loginForm.password) {
      alert('Please fill in all fields');
      return false;
    }

    const response = await authService.login(loginForm);
    if (!response.success) {
      alert(response.message);
      return false;
    }

    persistSession(response.data.token, response.data.user);
    setLoginForm({ identifier: '', password: '' });
    return true;
  };

  const register = async () => {
    if (!registerForm.name || !registerForm.username || !registerForm.email || !registerForm.password) {
      alert('Please fill in all fields');
      return false;
    }

    const response = await authService.register(registerForm);
    if (!response.success) {
      const validationErrors = response.errors?.map((item) => item.msg).filter(Boolean);
      alert(validationErrors?.length ? validationErrors.join('\n') : response.message);
      return false;
    }

    persistSession(response.data.token, response.data.user);
    setRegisterForm({ name: '', username: '', email: '', password: '' });
    return true;
  };

  const completeOAuth = async (oauthToken) => {
    if (!oauthToken) {
      clearSession();
      return false;
    }

    const response = await authService.getCurrentUser(oauthToken);
    if (!response.success || !response.data) {
      clearSession();
      return false;
    }

    persistSession(oauthToken, response.data);
    return true;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authMode,
      setAuthMode,
      loginForm,
      setLoginForm,
      registerForm,
      setRegisterForm,
      login,
      register,
      logout,
      isLoading,
      checkAuthStatus,
      completeOAuth,
    }),
    [user, token, authMode, loginForm, registerForm, isLoading]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
