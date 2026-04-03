import React from 'react';

const RegisterForm = ({
  registerForm,
  setRegisterForm,
  onRegister,
  onGoogleLogin,
  onSwitchToLogin,
}) => {
  const handleInputChange = (field, value) => {
    setRegisterForm({ ...registerForm, [field]: value });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="mb-2 text-center font-['Sora'] text-3xl font-semibold tracking-tight text-[#2f2720]">Create Account</h2>
      <p className="mb-8 text-center text-[#766b60]">Build your study workspace in minutes</p>

      <div className="w-full space-y-5">
        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full rounded-2xl border border-[#e7dac7] bg-white px-4 py-3 text-sm font-semibold text-[#2f2720] transition hover:border-[#c49a6c] hover:bg-[#fffaf2]"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#9a8f84]">
          <div className="h-px flex-1 bg-[#eadfce]" />
          <span>or</span>
          <div className="h-px flex-1 bg-[#eadfce]" />
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-[#6e6358]">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={registerForm.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input-glass"
          />
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-[#6e6358]">Username</label>
          <input
            type="text"
            placeholder="john_doe"
            value={registerForm.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="input-glass"
          />
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-[#6e6358]">Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={registerForm.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input-glass"
          />
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-[#6e6358]">Password</label>
          <input
            type="password"
            placeholder="********"
            value={registerForm.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="input-glass"
          />
        </div>

        <button
          onClick={onRegister}
          className="mt-4 w-full rounded-2xl bg-[#7f9a5c] py-3 text-lg font-semibold text-white shadow-[0_14px_28px_rgba(127,154,92,0.24)] transition hover:bg-[#718c4f]"
        >
          Sign Up Free
        </button>
      </div>

      <div className="mt-8 w-full border-t border-[#eadfce] pt-6 text-center">
        <p className="text-[#7b7065]">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-semibold text-[#7a5bf5] transition-colors hover:text-[#6547db]"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
