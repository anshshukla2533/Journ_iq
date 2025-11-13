import React from 'react';

const ChatWelcome = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-white p-8">
      {/* Welcome Illustration */}
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-16 h-16 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-3">
        Welcome to JournIQ Chat
      </h1>
      
      <div className="max-w-md text-center space-y-4">
        <p className="text-gray-600">
          Select a friend from the sidebar to start a conversation. Share messages, notes, and connect through audio or video calls.
        </p>
        
        {/* Feature List */}
        <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-blue-600 mb-2">
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">Real-time Chat</h3>
            <p className="text-gray-600">Instant messaging with read receipts</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="text-green-600 mb-2">
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">Video Calls</h3>
            <p className="text-gray-600">Face-to-face conversations</p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
            <div className="text-purple-600 mb-2">
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">Share Notes</h3>
            <p className="text-gray-600">Collaborate on ideas</p>
          </div>
          
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <div className="text-yellow-600 mb-2">
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828 2.828a9 9 0 001.414 1.414" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">Audio Calls</h3>
            <p className="text-gray-600">Clear voice communication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;