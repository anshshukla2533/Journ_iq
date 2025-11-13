import React, { useRef, useEffect, useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthPage = ({ 
  authMode, 
  setAuthMode, 
  loginForm, 
  setLoginForm, 
  registerForm, 
  setRegisterForm, 
  onLogin, 
  onRegister 
}) => {

  
  const featuresRef = useRef(null);
  const plansRef = useRef(null);
  const faqRef = useRef(null);
  const footerTriggerRef = useRef(null);
  const loginRef = useRef(null);

 
  const [showHeader, setShowHeader] = useState(false);

  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowFooter(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.5,
      }
    );
    if (footerTriggerRef.current) {
      observer.observe(footerTriggerRef.current);
    }
    return () => {
      if (footerTriggerRef.current) {
        observer.unobserve(footerTriggerRef.current);
      }
    };
  }, []);



  

 
  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  

  return (
    <>
      {/* Modern Header Bar with gradient background */}
      <header
        className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between px-8 py-4 transition-all duration-300 z-50
          ${showHeader ? 'fixed top-0 left-0 right-0 shadow-lg opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ position: showHeader ? 'fixed' : 'absolute' }}
      >
        <div className="flex items-center">
          <svg className="w-8 h-8 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-2xl font-bold tracking-tight text-white">JournIQ</span>
        </div>
        <nav className="flex items-center gap-10">
          <button onClick={() => scrollToRef(featuresRef)} className="text-lg text-white hover:text-gray-200 font-medium bg-transparent border-none cursor-pointer">Features</button>
          <button onClick={() => scrollToRef(plansRef)} className="text-lg text-white hover:text-gray-200 font-medium bg-transparent border-none cursor-pointer">Pricing</button>
          <button onClick={() => scrollToRef(faqRef)} className="text-lg text-white hover:text-gray-200 font-medium bg-transparent border-none cursor-pointer">FAQ</button>
        </nav>
        <button onClick={() => scrollToRef(loginRef)} className="bg-white text-indigo-600 font-bold rounded-xl px-6 py-2 text-lg shadow hover:bg-gray-100 transition">Get started</button>
      </header>
      <div className="auth-page min-h-screen w-full flex flex-col md:flex-row bg-[#fcfbfa]">
        {}
        <div ref={featuresRef} className="flex-1 flex flex-col justify-center items-center px-8 py-12 md:py-0 bg-[#fcfbfa]">
          <div className="max-w-lg w-full">
            <div className="flex items-center mb-6">
              <svg className="w-10 h-10 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-2xl font-bold tracking-tight text-gray-900">JournIQ</span>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Your ideas, amplified</h1>
            <p className="text-xl text-gray-700 mb-8">Privacy-first diary that helps you create, organize, and reflect in confidence.</p>
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Features</h2>
              <ul className="list-none text-gray-700 space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Save and organize your notes
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search and edit notes instantly
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Stay updated with the latest news
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Modern, minimal interface
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure login and registration
                </li>
              </ul>
            </div>
          </div>
        </div>
        {}
        <div ref={loginRef} className="flex-1 flex flex-col justify-center items-center px-8 py-12 md:py-0 bg-[#f6f5f2]">
          <div className="w-full max-w-md">
            {authMode === 'login' ? (
              <LoginForm
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                onLogin={onLogin}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                registerForm={registerForm}
                setRegisterForm={setRegisterForm}
                onRegister={onRegister}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      </div>
      {}
      <section ref={plansRef} className="w-full bg-[#fcfbfa] py-16 px-4 flex flex-col items-center border-t border-gray-200">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Meet Digital Diary</h2>
        <p className="text-xl text-gray-700 mb-8 text-center max-w-3xl">Digital Diary is your next-generation personal assistant for notes, journaling, and productivity. Built to be secure, private, and easy to use, it helps you organize your thoughts, track your progress, and stay updated with news and trends. Your data is always yours, and your privacy is our top priority.</p>
        <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-5xl">
          <div className="bg-white rounded-2xl shadow p-8 flex-1 min-w-[250px] border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-700 mb-4">Try Digital Diary for free</p>
            <ul className="list-disc list-inside text-gray-600 mb-2">
              <li>Unlimited notes</li>
              <li>Basic search & edit</li>
              <li>Access on web & mobile</li>
              <li>News feed</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex-1 min-w-[250px] border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro-20$</h3>
            <p className="text-gray-700 mb-4">For everyday productivity</p>
            <ul className="list-disc list-inside text-gray-600 mb-2">
              <li>All Free features</li>
              <li>Advanced search & tags</li>
              <li>Reminders & calendar sync</li>
              <li>Priority support</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex-1 min-w-[250px] border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Max-50$</h3>
            <p className="text-gray-700 mb-4">For power users & teams</p>
            <ul className="list-disc list-inside text-gray-600 mb-2">
              <li>All Pro features</li>
              <li>Team collaboration</li>
              <li>Export & backup options</li>
              <li>Early access to new features</li>
            </ul>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section ref={faqRef} className="w-full bg-[#fcfbfa] py-16 px-4 flex flex-col items-center border-t border-gray-200">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Frequently asked questions</h2>
        <div className="w-full max-w-3xl">
          <details className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-100">
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">What is Digital Diary and how does it work?</summary>
            <p className="mt-2 text-gray-600">Digital Diary is a secure, cloud-based app for taking notes, journaling, and organizing your thoughts. You can access it from any device, and your data is always private and encrypted.</p>
          </details>
          <details className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-100">
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">What can I use Digital Diary for?</summary>
            <p className="mt-2 text-gray-600">You can use Digital Diary for daily journaling, project notes, reminders, saving news articles, and collaborating with others (Pro/Max plans).</p>
          </details>
          <details className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-100">
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">How much does it cost to use?</summary>
            <p className="mt-2 text-gray-600">Digital Diary offers a free plan with core features, and paid plans for advanced productivity and team collaboration. See the plans above for details.</p>
          </details>
          <details className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-100">
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">Is my data private and secure?</summary>
            <p className="mt-2 text-gray-600">Yes, your notes are encrypted and only accessible by you. We never sell or share your data.</p>
          </details>
        </div>
      </section>
    </>
  );
  return (
    <>
      {}
      {}
      
      <section ref={faqRef} className="w-full bg-[#fcfbfa] py-16 px-4 flex flex-col items-center border-t border-gray-200">
        {/* ...existing code... */}
        </section>
      {/* Minimal Acknowledgment */}
      <div className="text-center py-2 text-sm text-gray-500">
        Developed by Ansh · © 2025
      </div>
    </>
  );
}
export default AuthPage