import React from 'react';
import Button from '../Common/Button';
import NotificationBell from '../Common/NotificationBell';
import useAuth from '../../hooks/useAuth';

const DashboardHeader = ({ userName, onLogout }) => {
  const { token } = useAuth();
  return (
    <header className="bg-white">
      <div className="flex justify-end items-center py-2 px-4">
        {/* Right side - User Profile & Actions */}
        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          <NotificationBell token={token} />

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <span className="text-xs text-green-500">Online</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <Button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg border border-red-400/50 hover:scale-105 duration-200"
              text="Logout"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;