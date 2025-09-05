import React from 'react'
import Button from '../Common/Button'
import Input from '../Common/Input'

const LoginForm = ({ loginForm, setLoginForm, onLogin, onSwitchToRegister }) => {
  const handleInputChange = (field, value) => {
    setLoginForm({ ...loginForm, [field]: value })
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-900 tracking-tight">
          JournIQ
        </h1>
            <a
              href="http://localhost:5001/api/auth/google"
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold p-3 rounded shadow hover:bg-red-700 transition-colors mt-2"
              style={{ textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.87-6.87C36.13 2.36 30.45 0 24 0 14.82 0 6.73 5.06 2.69 12.44l8.06 6.26C12.5 13.13 17.81 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.75 28.69c-1.01-2.99-1.01-6.21 0-9.2l-8.06-6.26C.9 16.36 0 20.06 0 24c0 3.94.9 7.64 2.69 10.77l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.19-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-7.5 2.16-6.19 0-11.5-3.63-13.25-8.69l-8.06 6.26C6.73 42.94 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Login with Google
            </a>
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
              onClick={onLogin}
              className="w-full bg-gray-900 text-white font-bold p-3 shadow hover:bg-gray-800 transition-colors"
              text="Login"
            />
            <a
              href="http://localhost:5001/api/auth/github"
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white font-bold p-3 rounded shadow hover:bg-black transition-colors mt-2"
              style={{ textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-github"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.38 9.38 0 012.5-.34c.85 0 1.71.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0022 12.26C22 6.58 17.52 2 12 2z"></path></svg>
              Login with GitHub
            </a>
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