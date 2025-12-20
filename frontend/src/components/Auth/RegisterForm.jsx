import React from 'react'
import Button from '../Common/Button'
import Input from '../Common/Input'

const RegisterForm = ({ registerForm, setRegisterForm, onRegister, onSwitchToLogin }) => {
  const handleInputChange = (field, value) => {
    console.log('[TEST] RegisterForm - Field changed:', field, '-> Value:', value);
    setRegisterForm({ ...registerForm, [field]: value })
  }

  const handleRegisterClick = () => {
    console.log('[TEST] RegisterForm - Register clicked with data:', { name: registerForm.name, email: registerForm.email, password: '***' });
    onRegister();
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Name"
          value={registerForm.name}
          onChange={(value) => handleInputChange('name', value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={registerForm.email}
          onChange={(value) => handleInputChange('email', value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={registerForm.password}
          onChange={(value) => handleInputChange('password', value)}
        />
        <Button
          onClick={handleRegisterClick}
          className="w-full bg-green-500 hover:bg-green-600 p-3"
          text="Register"
        />
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-600">Already have an account?</p>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:text-blue-700 font-medium mt-2"
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default RegisterForm