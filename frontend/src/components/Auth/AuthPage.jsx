import React, { useEffect, useRef, useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = ({
  authMode,
  setAuthMode,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  onLogin,
  onRegister,
  onGoogleLogin,
}) => {
  const featuresRef = useRef(null);
  const plansRef = useRef(null);
  const faqRef = useRef(null);
  const loginRef = useRef(null);
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowHeader(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToRef = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#fffdf8_0%,#f7f0e4_48%,#f4ebdd_100%)] text-[#2f2720]">
      <header
        className={`fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 transition-all duration-300 lg:px-10 ${
          showHeader
            ? 'border-b border-[#eadfce] bg-white/75 backdrop-blur-xl shadow-[0_18px_40px_rgba(122,92,56,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c99a6b_0%,#b88455_100%)] shadow-[0_14px_30px_rgba(184,132,85,0.22)]">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="hidden md:block">
            <p className="font-['Sora'] text-xl font-semibold tracking-tight text-[#2f2720]">JournIQ</p>
            <p className="text-xs uppercase tracking-[0.28em] text-[#9b7651]">Study Workspace</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <button onClick={() => scrollToRef(featuresRef)} className="text-sm font-medium text-[#74695f] transition hover:text-[#2f2720]">
            Features
          </button>
          <button onClick={() => scrollToRef(plansRef)} className="text-sm font-medium text-[#74695f] transition hover:text-[#2f2720]">
            Pricing
          </button>
          <button onClick={() => scrollToRef(faqRef)} className="text-sm font-medium text-[#74695f] transition hover:text-[#2f2720]">
            FAQ
          </button>
        </nav>

        <button onClick={() => scrollToRef(loginRef)} className="btn-primary">
          Get Started
        </button>
      </header>

      <main className="min-h-screen px-4 pb-10 pt-24 lg:px-8 lg:pt-28">
        <section className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.25rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffefb_0%,#f4ead9_52%,#f8f2e7_100%)] shadow-[0_28px_80px_rgba(122,92,56,0.12)]">
          <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-[#d9b88c]/24 blur-3xl" />
          <div className="absolute right-10 top-10 h-44 w-44 rounded-full bg-[#b7c39a]/18 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/60 blur-2xl" />

          <div className="grid min-h-[calc(100vh-10rem)] lg:grid-cols-[minmax(0,1.4fr)_520px]">
            <div ref={featuresRef} className="relative flex flex-col justify-between px-8 py-10 lg:px-14 lg:py-14">
              <div className="max-w-3xl animate-fade-in">
                <span className="inline-flex items-center rounded-full border border-[#dfc7a8] bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7651]">
                  Focused Learning System
                </span>
                <h1 className="mt-6 font-['Sora'] text-5xl font-semibold leading-[1.02] text-[#2f2720] md:text-6xl lg:text-7xl">
                  Turn every video,
                  <br />
                  thought, and question
                  <br />
                  into a sharper study flow.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6b6258]">
                  JournIQ blends watch sessions, live notes, AI help, and collaboration into one premium workspace that feels calm, fast, and worth coming back to.
                </p>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-[#eadfce] bg-white/72 p-5 shadow-[0_14px_30px_rgba(122,92,56,0.08)] backdrop-blur">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1df] text-[#b88455]">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="font-['Sora'] text-lg font-semibold text-[#2f2720]">Live note capture</h3>
                    <p className="mt-2 text-sm leading-6 text-[#75695e]">Write while you watch, keep timestamps, and save notes with the actual video context.</p>
                  </div>

                  <div className="rounded-[1.6rem] border border-[#dfe7d0] bg-[#f6faef]/90 p-5 shadow-[0_14px_30px_rgba(122,92,56,0.06)] backdrop-blur">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf4df] text-[#7f9a5c]">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="font-['Sora'] text-lg font-semibold text-[#2f2720]">Share and discuss</h3>
                    <p className="mt-2 text-sm leading-6 text-[#75695e]">Send a note to a friend and move straight into chat without losing context or momentum.</p>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
                  <div className="rounded-[1.8rem] border border-[#eadfce] bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(255,248,238,0.86))] p-6 shadow-[0_18px_40px_rgba(122,92,56,0.08)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a2805c]">Studio Workflow</p>
                        <h3 className="mt-2 font-['Sora'] text-2xl font-semibold text-[#2f2720]">A calmer way to study online</h3>
                      </div>
                      <div className="rounded-2xl bg-[#fff4e5] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b88455]">
                        Premium
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3">
                      <div className="flex items-center justify-between rounded-2xl border border-[#efe5d7] bg-white/80 px-4 py-3">
                        <span className="text-sm font-medium text-[#51473d]">Watch and take notes</span>
                        <span className="text-xs font-semibold text-[#8d6948]">In sync</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-[#efe5d7] bg-white/80 px-4 py-3">
                        <span className="text-sm font-medium text-[#51473d]">Ask AI in context</span>
                        <span className="text-xs font-semibold text-[#7f9a5c]">Instant</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-[#efe5d7] bg-white/80 px-4 py-3">
                        <span className="text-sm font-medium text-[#51473d]">Share to chat</span>
                        <span className="text-xs font-semibold text-[#8d6948]">One step</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-[#eadfce] bg-[#fffdf8]/85 p-6 shadow-[0_18px_40px_rgba(122,92,56,0.07)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a2805c]">What you get</p>
                    <ul className="mt-4 space-y-4 text-sm leading-6 text-[#685e53]">
                      <li className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#b88455]" />
                        Notes saved with video title and context
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7f9a5c]" />
                        Cleaner chat around shared notes
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#b88455]" />
                        News, AI support, notifications, and collaboration in one place
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-4 border-t border-[#eadfce] pt-8 md:grid-cols-3">
                <div>
                  <p className="text-3xl font-semibold text-[#2f2720]">Watch</p>
                  <p className="mt-2 text-sm text-[#7a6f63]">Study from videos without breaking your flow.</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[#2f2720]">Write</p>
                  <p className="mt-2 text-sm text-[#7a6f63]">Capture notes that stay structured and searchable.</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[#2f2720]">Share</p>
                  <p className="mt-2 text-sm text-[#7a6f63]">Move from note to conversation in one clean handoff.</p>
                </div>
              </div>
            </div>

            <div ref={loginRef} className="relative flex items-center justify-center border-t border-[#eadfce] bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,248,239,0.84))] p-6 lg:border-l lg:border-t-0 lg:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.74),transparent_55%)]" />
              <div className="relative z-10 w-full max-w-md animate-slide-up">
                <div className="rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e6_100%)] p-8 shadow-[0_24px_70px_rgba(122,92,56,0.14)]">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#7a5bf5_0%,#9f5ef0_100%)] shadow-[0_14px_34px_rgba(122,91,245,0.25)]">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                      </svg>
                    </div>
                  </div>

                  {authMode === 'login' ? (
                    <LoginForm
                      loginForm={loginForm}
                      setLoginForm={setLoginForm}
                      onLogin={onLogin}
                      onGoogleLogin={onGoogleLogin}
                      onSwitchToRegister={() => setAuthMode('register')}
                    />
                  ) : (
                    <RegisterForm
                      registerForm={registerForm}
                      setRegisterForm={setRegisterForm}
                      onRegister={onRegister}
                      onGoogleLogin={onGoogleLogin}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-[#eadfce] bg-white/75 p-4 shadow-[0_14px_30px_rgba(122,92,56,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">Why it feels better</p>
                      <p className="mt-1 text-sm text-[#6f655b]">One login, one workspace, all your study tools connected.</p>
                    </div>
                    <div className="rounded-2xl bg-[#eef7ea] px-3 py-2 text-xs font-semibold text-[#6f8a50]">
                      Smooth
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section ref={plansRef} className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="inline-flex items-center rounded-full border border-[#dfc7a8] bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7651]">
              Plans
            </span>
            <h2 className="mt-4 font-['Sora'] text-4xl font-semibold text-[#2f2720] md:text-5xl">Choose your pace</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#6b6258]">
              Start free, then grow into a deeper study workspace as your routine gets more serious.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[1.8rem] border border-[#eadfce] bg-white/80 p-8 shadow-[0_18px_40px_rgba(122,92,56,0.08)]">
              <h3 className="font-['Sora'] text-2xl font-semibold text-[#2f2720]">Free</h3>
              <p className="mt-2 text-[#756a60]">Start your workflow today.</p>
              <ul className="mt-8 space-y-4 text-sm text-[#5d544a]">
                <li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#7f9a5c]" /> Unlimited notes</li>
                <li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#7f9a5c]" /> Basic search and studio access</li>
                <li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#7f9a5c]" /> News and video learning flows</li>
              </ul>
              <div className="mt-10 text-4xl font-semibold text-[#2f2720]">$0<span className="ml-1 text-lg font-normal text-[#8c8175]">/mo</span></div>
              <button onClick={() => scrollToRef(loginRef)} className="btn-secondary mt-8 w-full">Current Plan</button>
            </div>

            <div className="rounded-[1.8rem] border border-[#dfc7a8] bg-[linear-gradient(180deg,#fffaf1_0%,#f6ecdc_100%)] p-8 shadow-[0_24px_50px_rgba(184,132,85,0.12)]">
              <div className="flex items-center justify-between">
                <h3 className="font-['Sora'] text-2xl font-semibold text-[#2f2720]">Pro</h3>
                <span className="rounded-full bg-[#b88455] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">Popular</span>
              </div>
              <p className="mt-2 text-[#756a60]">For deep learners and serious builders.</p>
              <ul className="mt-8 space-y-4 text-sm text-[#5d544a]">
                <li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#b88455]" /> Advanced AI support</li>
                <li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#b88455]" /> Better search and note intelligence</li>
                <li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#b88455]" /> Stronger collaboration workflows</li>
              </ul>
              <div className="mt-10 text-4xl font-semibold text-[#2f2720]">$20<span className="ml-1 text-lg font-normal text-[#8c8175]">/mo</span></div>
              <button className="btn-primary mt-8 w-full">Upgrade to Pro</button>
            </div>
          </div>
        </div>
      </section>

      <section ref={faqRef} className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#eadfce] bg-white/75 p-8 shadow-[0_18px_40px_rgba(122,92,56,0.08)]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#dfc7a8] bg-[#fff8ef] px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7651]">
              FAQ
            </span>
            <h2 className="mt-4 font-['Sora'] text-3xl font-semibold text-[#2f2720]">Built for a cleaner learning rhythm</h2>
            <p className="mt-4 text-base leading-7 text-[#6f655b]">
              Sign in with Google or your own username, save notes while watching, and return to one workspace that keeps everything connected.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#eadfce] py-8 text-center text-sm text-[#8b7f73]">
        Developed by Ansh · © 2025
      </footer>
    </div>
  );
};

export default AuthPage;
