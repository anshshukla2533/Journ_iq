import React from 'react';
import Button from '../Common/Button';

const DashboardHeader = ({ userName, onLogout }) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Welcome message */}
          <div className="flex items-center">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-800">JournIQ</h1>
              <p className="text-gray-600 text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 px-4 py-2 text-sm font-medium"
              text="Logout"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;