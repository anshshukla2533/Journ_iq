import React from 'react';

export default function MessageBubble({ message }) {
  const fromMe = message?.fromMe;
  const status = message?.status;
  const content = message?.content || message?.text || message?.note?.text || '';
  const timestamp = new Date(message?.createdAt || Date.now());
  
  const timeStr = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Status icon for sent messages
  const getStatusIcon = () => {
    if (!fromMe) return null;

    if (status === 'read') {
      return (
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
        </svg>
      );
    }
    
    if (status === 'delivered' || status === 'sent') {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
        </svg>
      );
    }
    
    if (status === 'sending') {
      return (
        <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  return (
    <div className={`flex w-full mb-2 ${fromMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] sm:max-w-[55%] rounded-lg px-3 py-2 shadow-sm ${
          fromMe
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {content}
        </p>

        {/* Note attachment if exists */}
        {message?.note && (
          <div className="mt-2 p-2 bg-black/10 rounded-lg">
            <p className="text-xs font-semibold mb-1">📝 Shared Note:</p>
            <p className="text-xs">{message.note.text}</p>
          </div>
        )}

        {/* Time and Status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${fromMe ? 'text-white/70' : 'text-gray-600'}`}>
            {timeStr}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}