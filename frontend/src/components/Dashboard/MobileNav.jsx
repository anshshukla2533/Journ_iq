import React from 'react';

const MobileNav = ({ tabs, activeTab, onTabClick, isOpen, onClose }) => {
  return (
    <div className={`
      fixed inset-0 z-50 lg:hidden
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {}
      <div className="relative w-64 h-full bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  onTabClick(tab.key);
                  onClose();
                }}
                className={`
                  w-full px-4 py-2 rounded-lg flex items-center space-x-3
                  ${activeTab === tab.key 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'}
                  transition-colors duration-150
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;