import React from 'react';

const LoadingTransition = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="relative">
          <div className="h-2 w-48 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-white mt-4 text-lg font-medium">Loading your workspace...</p>
      </div>
    </div>
  );
};

export default LoadingTransition;