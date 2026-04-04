import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import DashboardHeader from '../components/layout/DashboardHeader';
import JournAIAssistant from '../components/layout/JournAIAssistant';
import MobileNav from '../components/layout/MobileNav';
import SidebarNav from '../components/layout/SidebarNav';
import useAuth from '../hooks/useAuth';
import { createSocket } from '../services/socket';

const TABS = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    color: 'bg-blue-500',
  },
  {
    key: 'notes',
    label: 'Notes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: 'bg-green-500',
  },
  {
    key: 'studio',
    label: 'Studio',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-amber-500',
  },
  {
    key: 'news',
    label: 'News',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    color: 'bg-yellow-500',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: 'bg-red-500',
  },
  {
    key: 'chat',
    label: 'Chats',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'bg-purple-500',
  },
  {
    key: 'search',
    label: 'Search',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'bg-indigo-500',
  },
];

export default function DashboardLayout() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatRoute = location.pathname.endsWith('/chat');

  const getTabFromPath = (pathname) => {
    if (pathname.endsWith('/news')) return 'news';
    if (pathname.endsWith('/notes')) return 'notes';
    if (pathname.endsWith('/studio')) return 'studio';
    if (pathname.endsWith('/friends')) return 'chat';
    if (pathname.endsWith('/notifications')) return 'notifications';
    if (pathname.endsWith('/search')) return 'search';
    if (pathname.endsWith('/chat')) return 'chat';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/dashboard');
    } else if (tab === 'chat') {
      navigate('/dashboard/chat');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  useEffect(() => {
    if (!token) return;

    let socket;
    let handleReceiveMessage;
    try {
      socket = createSocket(token);

      const getId = (val) => (typeof val === 'object' && val?._id ? String(val._id) : String(val || ''));

      const bumpRecents = (friendId, message) => {
        try {
          const key = 'chatRecents';
          const prev = JSON.parse(localStorage.getItem(key) || '{}');
          prev[String(friendId)] = {
            updatedAt: message?.createdAt || new Date().toISOString(),
            lastText: message?.text || message?.content || (message?.note ? 'Shared a note' : ''),
          };
          localStorage.setItem(key, JSON.stringify(prev));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      };

      const incrementUnread = (friendId) => {
        try {
          const key = 'chatUnreadCounts';
          const map = JSON.parse(localStorage.getItem(key) || '{}');
          map[String(friendId)] = (map[String(friendId)] || 0) + 1;
          localStorage.setItem(key, JSON.stringify(map));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      };

      handleReceiveMessage = (payload) => {
        const message = payload?.message || payload;
        const senderId = getId(message?.sender);
        const recipientId = getId(message?.receiver || message?.recipient);
        const myId = user?.id;
        const friendId = senderId !== String(myId) ? senderId : recipientId;

        bumpRecents(friendId, message);
        incrementUnread(friendId);
      };

      socket.on('receive_message', handleReceiveMessage);
    } catch (err) {
      console.error('Socket connection error:', err);
    }

    return () => {
      if (socket && handleReceiveMessage) {
        socket.off('receive_message', handleReceiveMessage);
      }
    };
  }, [token, user]);

  return (
    <div className="dashboard-page min-h-screen flex flex-col pt-16 lg:pt-0">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <MobileNav
        tabs={TABS}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="hidden lg:block fixed z-40">
        <SidebarNav tabs={TABS} activeTab={activeTab} onTabClick={handleTabClick} />
      </div>

      <div className="lg:ml-72 flex-1 flex flex-col">
        <DashboardHeader userName={user?.name || user?.email} onLogout={logout} />

        <div className={`flex-1 ${isChatRoute ? 'px-2 py-2 lg:px-8 lg:py-6' : 'px-4 py-6 lg:px-8'}`}>
          <main className={`flex-1 ${isChatRoute ? 'min-h-[calc(100dvh-7rem)] lg:min-h-[calc(100vh-200px)]' : 'min-h-[calc(100vh-200px)]'}`}>
            <div className={`max-w-7xl mx-auto relative ${isChatRoute ? 'py-0 lg:py-6' : 'py-6'}`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <footer className={`mt-auto text-center py-4 text-sm text-gray-400 bg-white/5 backdrop-blur-md ${isChatRoute ? 'hidden lg:block' : ''}`}>
        Developed by Ansh · © 2025
      </footer>

      <JournAIAssistant />
    </div>
  );
}
