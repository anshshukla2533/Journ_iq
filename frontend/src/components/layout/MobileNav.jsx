import React from 'react';

const MobileNav = ({ tabs, activeTab, onTabClick, isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(82,64,44,0.18)] backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-[#eadfce] bg-[linear-gradient(180deg,#fffdf8_0%,#f4ecdf_100%)] shadow-2xl backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#eadfce] p-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c49a6c] to-[#8a9a5b] shadow-lg shadow-[#c49a6c]/20">
              <span className="text-white font-bold">J</span>
            </div>
            <h2 className="text-xl font-bold tracking-wider text-[#2f2720]">JournIQ</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#8e7f70] transition-colors hover:bg-white hover:text-[#2f2720]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <div className="mb-4 px-4 text-xs font-semibold uppercase tracking-widest text-[#9d8c77]">Menu</div>
          <ul className="space-y-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <li key={tab.key}>
                  <button
                    onClick={() => {
                      onTabClick(tab.key);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 group ${
                      isActive 
                        ? 'border border-[#e4cfb3] bg-white text-[#2f2720] shadow-sm'
                        : 'border border-transparent text-[#776c61] hover:bg-white/70 hover:text-[#2f2720]'
                    }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      isActive ? tab.color + ' text-white shadow-md' : 'bg-[#f4ecdf] text-[#8b7d6b] group-hover:text-[#2f2720]'
                    }`}>
                      {tab.icon}
                    </div>
                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#b88455] shadow-[0_0_8px_rgba(184,132,85,0.45)]"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[#eadfce] bg-white/50 p-4">
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2 transition-colors hover:bg-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#c49a6c] to-[#8a9a5b] text-white shadow-lg">
              <span className="text-sm font-bold">J</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[#2f2720]">Settings</p>
              <p className="truncate text-xs text-[#8c7d6e]">Preferences & more</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileNav;
