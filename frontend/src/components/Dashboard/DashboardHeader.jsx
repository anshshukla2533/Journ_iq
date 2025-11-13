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
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              text="Logout"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;