import React from 'react';
import { useNavigate } from 'react-router-dom';
import Friends from '../components/chat/Friends';
import ChatWelcome from '../components/chat/ChatWelcome';

export default function FriendsPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">Friends Network</h2>
        <p className="text-indigo-200">Connect with peers globally.</p>
      </div>

      <div className="glass-panel flex-1 shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/10">
        <div className="w-full lg:w-[450px] border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5 backdrop-blur-sm">
          <Friends
            onStartChat={friend => {
               navigate('/dashboard/chat');
            }}
          />
        </div>
        
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <ChatWelcome />
        </div>
      </div>
    </div>
  );
}
