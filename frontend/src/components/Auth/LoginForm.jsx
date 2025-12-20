import React from 'react'
import Button from '../Common/Button'
import Input from '../Common/Input'

const LoginForm = ({ loginForm, setLoginForm, onLogin, onSwitchToRegister }) => {
  const handleInputChange = (field, value) => {
    console.log('[TEST] LoginForm - Field changed:', field, '-> Value:', value);
    setLoginForm({ ...loginForm, [field]: value })
  }

  const handleLoginClick = () => {
    console.log('[TEST] LoginForm - Login clicked with data:', { email: loginForm.email, password: '***' });
    onLogin();
  }

  // Get the backend URL dynamically
  const getBackendUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace('/api', '');
    }
    if (import.meta.env.DEV) {
      return 'http://localhost:3000';
    }
    return window.location.origin;
  };

  const backendUrl = getBackendUrl();

  return (
    <div className="w-full flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-900 tracking-tight">
          JournIQ
        </h1>
            <button
              onClick={() => window.location.href = `${backendUrl}/api/auth/google`}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold p-3 rounded shadow hover:bg-red-700 transition-colors mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.87-6.87C36.13 2.36 30.45 0 24 0 14.82 0 6.73 5.06 2.69 12.44l8.06 6.26C12.5 13.13 17.81 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.75 28.69c-1.01-2.99-1.01-6.21 0-9.2l-8.06-6.26C.9 16.36 0 20.06 0 24c0 3.94.9 7.64 2.69 10.77l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.19-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-7.5 2.16-6.19 0-11.5-3.63-13.25-8.69l-8.06 6.26C6.73 42.94 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Login with Google
            </button>

            <div class="flex items-center my-4">
  <div class="flex-grow border-t border-gray-800"></div>
  <span class="mx-4 text-gray-800 font-bold ">OR</span>
  <div class="flex-grow border-t border-gray-800"></div>
</div>

        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Username"
              value={loginForm.email}
              onChange={(value) => handleInputChange('email', value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(value) => handleInputChange('password', value)}
            />
            <Button
              onClick={handleLoginClick}
              className="w-full bg-gray-900 text-white font-bold p-3 shadow hover:bg-gray-800 transition-colors"
              text="Login"
            />
           
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-500">Don't have an account?</p>
            <button
              onClick={onSwitchToRegister}
              className="text-gray-900 hover:text-gray-700 font-bold mt-2 underline text-lg transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm