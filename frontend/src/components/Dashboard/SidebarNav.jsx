import React from 'react'

const SidebarNav = ({ tabs, activeTab, onTabClick }) => {
  return (
    <aside className="w-72 bg-white min-h-screen border-r border-gray-200 shadow-lg flex flex-col fixed left-0 top-0">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✦</span>
          JournIQ
        </h2>
        <p className="text-indigo-200 mt-1">Your Digital Companion</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map(tab => (
            <li key={tab.key}>
              <button
                onClick={() => onTabClick(tab.key)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                  activeTab === tab.key 
                    ? `${tab.color} text-white shadow-lg transform scale-105` 
                    : 'text-gray-700 hover:bg-gray-50 hover:scale-102'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <span className="text-lg">{tab.icon}</span>
                </div>
                <span className="font-medium">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium">👤</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Profile</p>
            <p className="text-xs text-gray-500">Settings & more</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default SidebarNav
