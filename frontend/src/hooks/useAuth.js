import { useState, useEffect } from 'react'
import authService from '../services/authService'


const useAuth = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

 
  useEffect(() => {
    const checkOAuthSession = async () => {
      try {
        const res = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser({ name: data.user.name });
        }
      } catch (e) {
       
      }
    };
    if (!user) checkOAuthSession();
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
        setToken(response.data.token)
        setUser({ name: response.data.name })
        setLoginForm({ email: '', password: '' })
        // Persist in localStorage
        localStorage.setItem('user', JSON.stringify({ name: response.data.name }));
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
    logout
  }
}

export default useAuth