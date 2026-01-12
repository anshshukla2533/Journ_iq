import React, { useRef, useEffect, useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import authGif from '../../assets/auth.gif'

const AuthPage = ({ 
  authMode, 
  setAuthMode, 
  loginForm, 
  setLoginForm, 
  registerForm, 
  setRegisterForm, 
  onLogin, 
  onRegister,
  isLoading = false 
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
        className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 transition-all duration-300 z-50
          ${showHeader ? 'fixed top-0 left-0 right-0 shadow-lg opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ position: showHeader ? 'fixed' : 'absolute' }}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-lg md:text-2xl font-bold tracking-tight text-white">JournIQ</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 md:gap-10">
          <button onClick={() => scrollToRef(featuresRef)} className="text-sm md:text-lg text-white hover:text-gray-200 font-medium bg-transparent border-none cursor-pointer transition">Features</button>
          <button onClick={() => scrollToRef(plansRef)} className="text-sm md:text-lg text-white hover:text-gray-200 font-medium bg-transparent border-none cursor-pointer transition">Pricing</button>
          <button onClick={() => scrollToRef(faqRef)} className="text-sm md:text-lg text-white hover:text-gray-200 font-medium bg-transparent border-none cursor-pointer transition">FAQ</button>
        </nav>
        <button onClick={() => scrollToRef(loginRef)} className="bg-white text-indigo-600 font-bold rounded-lg md:rounded-xl px-3 md:px-6 py-2 md:py-2 text-sm md:text-lg shadow hover:bg-gray-100 transition">Get started</button>
      </header>
      <div className="auth-page w-full flex flex-col md:flex-row md:min-h-screen bg-[#fcfbfa]">
        {}
        <div ref={featuresRef} className="w-full md:flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-8 md:py-12 bg-[#fcfbfa]">
          <div className="max-w-lg w-full">
            <div className="flex items-center mb-6">
              <svg className="w-10 h-10 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-2xl font-bold tracking-tight text-gray-900">JournIQ</span>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Your ideas, amplified</h1>
            <p className="text-xl text-gray-700 mb-6">Helps you create,collaborate, organize, and reflect in confidence.</p>
          
            {/* Ecosystem Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-8 border border-blue-100">
              <p className="text-sm font-semibold text-gray-900 mb-2">All-in-One Learning Ecosystem</p>
              <p className="text-gray-700 text-sm leading-relaxed">Consolidate YouTube, news feeds, web search, and collaborative notes in one platform. Reduce app-switching by 70% for enhanced productivity.</p>
              <p className="text-xs text-gray-600 mt-3 font-medium">✓ 200+ active users trusting JournIQ</p>
            </div>

            {/* Video Demo - Responsive */}
            <div className="mb-8 rounded-xl overflow-hidden shadow-2xl h-48 sm:h-56 md:h-72 lg:h-96 border-2 border-gray-200 w-full">
              <img
                src={authGif}
                alt="JournIQ Demo"
                className="w-full h-full object-cover"
              />
            </div>

            
          </div>
        </div>
        {}
        <div ref={loginRef} className="w-full md:flex-1 flex flex-col justify-center items-center px-8 py-12 md:py-0 bg-[#f6f5f2]">
          <div className="w-full max-w-md min-h-fit">
            {authMode === 'login' ? (
              <LoginForm
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                onLogin={onLogin}
                onSwitchToRegister={() => setAuthMode('register')}
                isLoading={isLoading}
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
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Meet JournIq </h2>
        <p className="text-xl text-gray-700 mb-8 text-center max-w-3xl">JournIq is your next-generation personal assistant for notes, journaling, and productivity. Built to be secure, private, and easy to use, it helps you organize your thoughts, track your progress, and stay updated with news and trends. Your data is always yours, and your privacy is our top priority.</p>
        <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-5xl">
          <div className="bg-white rounded-2xl shadow p-8 flex-1 min-w-[250px] border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-700 mb-4">Try JournIq for free</p>
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
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">What is JournIQ Diary and how does it work?</summary>
            <p className="mt-2 text-gray-600">JournIQ Diary is a secure, cloud-based app for taking notes, journaling, and organizing your thoughts. You can access it from any device, and your data is always private and encrypted.</p>
          </details>
          <details className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-100">
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">What can I use JournIQ Diary for?</summary>
            <p className="mt-2 text-gray-600">You can use JournIQ Diary for daily journaling, project notes, reminders, saving news articles, and collaborating with others (Pro/Max plans).</p>
          </details>
          <details className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-100">
            <summary className="font-semibold text-lg text-gray-800 cursor-pointer">How much does it cost to use?</summary>
            <p className="mt-2 text-gray-600">JournIQ Diary offers a free plan with core features, and paid plans for advanced productivity and team collaboration. See the plans above for details.</p>
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
      <div className="text-center py-3 text-xs text-gray-400 border-t border-gray-200">
        <p>Crafted with precision by <span className="font-semibold text-gray-600">Ansh Shukla</span> · © 2025</p>
      </div>
    </>
  );
}
export default AuthPage