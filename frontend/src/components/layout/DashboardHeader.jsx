import React from 'react';

const DashboardHeader = ({ userName, onLogout }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfce] bg-[rgba(255,251,245,0.82)] shadow-sm backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="ml-14 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c49a6c] to-[#8a9a5b] p-0.5 shadow-xl lg:ml-0">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <span className="text-lg font-bold text-[#7c6247]">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a18464]">Welcome Back</p>
              <h1 className="max-w-[200px] truncate text-lg font-bold tracking-wide text-[#2f2720] xl:max-w-xs">
                {userName || 'User'}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center rounded-full border border-[#dbe6cf] bg-[#f5faef] px-4 py-1.5 shadow-inner md:flex">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
            <span className="text-sm font-medium text-[#5f8750]">Online</span>
          </div>
          
          <button
            onClick={onLogout}
            className="group flex items-center gap-2 rounded-xl border border-[#f0d0d0] bg-[#fff6f6] px-5 py-2.5 font-medium text-[#b15f5f] transition-all active:scale-95 hover:bg-[#ffecec]"
          >
            <span className="hidden sm:inline">Logout</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
