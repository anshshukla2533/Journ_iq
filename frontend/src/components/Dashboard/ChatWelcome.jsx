import React from 'react';

const ChatWelcome = () => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center justify-between bg-gradient-to-br from-gray-50 to-white p-4 sm:p-8 overflow-y-auto gap-8">
      {/* Left Side - Welcome Text */}
      <div className="flex flex-col items-center lg:items-start justify-center flex-1 min-w-0 text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Welcome to JournIQ Chat
        </h1>
        
        <div className="max-w-md space-y-4">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Select a friend from the sidebar to start a conversation. Share messages, notes, and connect through audio or video calls.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Real-time messaging</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Voice & video calls</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Share notes and collaborate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Video */}
      <div className="w-full lg:w-auto flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-sm h-96">
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
          
          {/* Video container */}
          <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/src/assets/chatsidebar.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;