import React from 'react';

const LoginForm = ({ loginForm, setLoginForm, onLogin, onGoogleLogin, onSwitchToRegister }) => {
  const handleInputChange = (field, value) => {
    setLoginForm({ ...loginForm, [field]: value });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="mb-2 text-center font-['Sora'] text-3xl font-semibold tracking-tight text-[#2f2720]">Welcome Back</h2>
      <p className="mb-8 text-center text-[#766b60]">Sign in to your JournIQ workspace</p>

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
          <label className="ml-1 text-sm font-medium text-[#6e6358]">Email or Username</label>
          <input
            type="text"
            placeholder="name@example.com or username"
            value={loginForm.identifier}
            onChange={(e) => handleInputChange('identifier', e.target.value)}
            className="input-glass"
          />
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-[#6e6358]">Password</label>
          <input
            type="password"
            placeholder="********"
            value={loginForm.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="input-glass"
          />
        </div>

        <button
          onClick={onLogin}
          className="btn-primary w-full py-3 mt-4 text-lg"
        >
          Sign In
        </button>
      </div>

      <div className="relative mt-8 w-full border-t border-[#eadfce] pt-6 text-center">
        <p className="text-[#7b7065]">
          New here?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-semibold text-[#7a5bf5] transition-colors hover:text-[#6547db]"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
