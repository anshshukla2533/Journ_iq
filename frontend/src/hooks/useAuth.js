import { useState, useEffect } from 'react'
import authService from '../services/authService'


const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

 
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const response = await authService.getCurrentUser(storedToken);
        if (response.success && response.data) {
          setUser({ 
            _id: response.data._id || response.data.id,
            id: response.data._id || response.data.id,
            name: response.data.name,
            email: response.data.email
          });
          setToken(storedToken);
          return true;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          return false;
        }
      }
      return false;
    } catch (e) {
      console.error('Failed to check auth session:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    
    const initAuth = async () => {
      setIsLoading(true);
      await checkAuthStatus();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async () => {
    if (!loginForm.email || !loginForm.password) {
      alert("Please fill in all fields")
      return false
    }
    
    try {
      const response = await authService.login(loginForm)
      if (response.success) {
        const userData = {
          _id: response.data.user?._id || response.data._id || response.data.id,
          id: response.data.user?._id || response.data._id || response.data.id,
          name: response.data.user?.name || response.data.name,
          email: response.data.user?.email || response.data.email
        };
        setToken(response.data.token)
        setUser(userData)
        setLoginForm({ email: '', password: '' })
        // Persist in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        return true
      } else {
        alert(response.message)
        return false
      }
    } catch (error) {
      alert("Login failed. Please try again.")
      return false
    }
  }

  const register = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      alert("Please fill in all fields")
      return
    }
    
    try {
      const response = await authService.register(registerForm)
      // If validation failed on the backend, show detailed errors when available
      if (!response.success) {
        if (response.errors && response.errors.length > 0) {
          const msgs = response.errors.map(e => e.msg || e.message || JSON.stringify(e)).join('\n')
          alert(msgs)
        } else {
          alert(response.message || 'Registration failed')
        }
        return
      }

      // Success
      alert(response.message)
      if (response.success) {
        setRegisterForm({ name: '', email: '', password: '' })
        setAuthMode('login')
      }
    } catch (error) {
      alert("Registration failed. Please try again.")
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setLoginForm({ email: '', password: '' })
    setRegisterForm({ name: '', email: '', password: '' })
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    alert("Logout successful")
  }

  return {
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
    checkAuthStatus
  }
}

export default useAuth