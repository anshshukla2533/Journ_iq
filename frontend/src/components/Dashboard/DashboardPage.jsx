
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DashboardHeader from './DashboardHeader';
import NewsSection from './NewsSection';
import SavedNotes from './SavedNotes';
import ChatWelcome from './ChatWelcome';
import MobileNav from './MobileNav';

import ChatbotSidebar from './ChatbotSidebar';
import YouTubeSearch from './YouTubeSearch';
import ToDoSidebar from './ToDoSidebar';
import ChatContainer from '../ChatWhats/ChatContainer';
import SidebarNav from './SidebarNav';
import NotificationsPanel from './NotificationsPanel';
import SearchPanel from './SearchPanel';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';
import { createSocket } from '../../services/socket';


const TABS = [
  { key: 'home', label: 'Home', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ), color: 'bg-blue-500' },
  { key: 'notes', label: 'Notes', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ), color: 'bg-green-500' },
  { key: 'news', label: 'News', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ), color: 'bg-yellow-500' },
  { key: 'chat', label: 'Chat', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ), color: 'bg-cyan-500' },
  { key: 'notifications', label: 'Notifications', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ), color: 'bg-red-500' },
  { key: 'search', label: 'Search', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ), color: 'bg-indigo-500' },
  { key: 'todo', label: 'Todo', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ), color: 'bg-orange-500' },
  { key: 'videos', label: 'YouTube', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ), color: 'bg-pink-500' },
];


const DashboardPage = ({
  user,
  news,
  savedNotes,
  onLogout,
  onFetchNews
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Determine tab from URL
  const getTabFromPath = (pathname) => {
    if (pathname.endsWith('/news')) return 'news';
    if (pathname.endsWith('/notes')) return 'notes';
    if (pathname.endsWith('/videos')) return 'videos';
    if (pathname.endsWith('/notifications')) return 'notifications';
    if (pathname.endsWith('/search')) return 'search';
    if (pathname.endsWith('/chat')) return 'chat';
    if (pathname.endsWith('/todo')) return 'todo';
    return 'home';
  };
  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    // Redirect /friends to /chat since friends tab no longer exists
    if (newTab === 'friends' || (location.pathname.includes('/friends') && newTab !== 'friends')) {
      navigate('/dashboard/chat');
      return;
    }
    setActiveTab(newTab);
    
    // Initialize the tab-specific data when switching tabs
    if (newTab === 'notifications') {
      setNotifReloadSignal(prev => prev + 1);
    }
  }, [location.pathname, navigate]);


  const [chatFriend, setChatFriend] = useState(null);
  const [noteToShare, setNoteToShare] = useState(null);
  const { token } = useAuth();
  const [notifReloadSignal, setNotifReloadSignal] = useState(0);

  const openChatFromSearch = (friend) => {
    if (!friend) return;
    setChatFriend(friend);
    setActiveTab('chat');
    navigate('/dashboard/chat');
  };

  // Handle tab click and navigation
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Clear any active chat when switching tabs
    if (tab !== 'chat') {
      setChatFriend(null);
      setNoteToShare(null);
    }
    
    // Update URL
    if (tab === 'home') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
    
    // Fetch news when News tab is clicked
    if (tab === 'news' && typeof onFetchNews === 'function') {
      onFetchNews();
    }
  };

  // Chatbot handled internally by ChatbotSidebar (has its own floating button)
  // Draggable Save Note widget state (moved to DraggableSaveNote component)
// Draggable Save Note widget component
const DraggableSaveNote = () => {
  const { token } = useAuth();
  const [show, setShow] = useState(true);
  const [note, setNote] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pos, setPos] = useState(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      x: width < 768 ? 10 : width / 2 - 200,
      y: height - (width < 768 ? 150 : 200)
    };
  });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setPos(prev => ({
          x: 10,
          y: window.innerHeight - 150
        }));
        return;
      }
      setPos(prev => ({
        x: Math.min(Math.max(0, prev.x), window.innerWidth - 400),
        y: Math.min(prev.y, window.innerHeight - 120)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = e => {
      if (dragging) {
        const maxY = window.innerHeight - (isMobile ? 150 : 120);
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.current.x)),
          y: Math.max(0, Math.min(maxY, e.clientY - dragOffset.current.y)),
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, isMobile]);

  const handleSaveNote = async () => {
    if (!note.trim() || !token) return;
    setSaveMsg('');
    setSaving(true);
    try {
      const res = await notesService.createNote(token, { text: note });
      if (res.success) {
        setSaveMsg('Note saved!');
        setNote('');
        setTimeout(() => setSaveMsg(''), 2000);
      } else {
        setSaveMsg(res.message || 'Failed to save note.');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveMsg('Failed to save note.');
    }
    setSaving(false);
  };

  if (!show) return null;
  return (
    <div
      className={`fixed z-[100] ${isMobile ? 'w-[calc(100%-20px)]' : 'w-full max-w-lg'}`}
      style={{ 
        left: pos.x, 
        top: pos.y
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 flex flex-col items-center border border-gray-200 dark:border-gray-700 w-full"
        style={{ position: 'relative' }}
      >
        {/* Drag handle */}
        <div
          className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-t-2xl cursor-move flex items-center justify-center text-xs text-gray-500 select-none"
          style={{ userSelect: 'none' }}
          onMouseDown={e => {
            setDragging(true);
            dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
          }}
        >
          Drag to move
          <button className="ml-auto px-2 text-red-500 hover:text-red-700" onClick={() => setShow(false)}>×</button>
        </div>
        <div className="p-6 w-full flex flex-col items-center">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Save a Note</h3>
          <textarea
            className="w-full min-h-[80px] p-2 border border-gray-300 dark:border-gray-700 rounded mb-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            placeholder="Write your note here..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            onClick={handleSaveNote}
            disabled={!note.trim()}
          >
            Save Note
          </button>
          {saveMsg && <div className="mt-2 text-green-600 text-sm">{saveMsg}</div>}
        </div>
      </div>
    </div>
  );
};
 
  // Setup a lightweight socket in dashboard to listen for events that should refresh notifications
  const [dashboardSocket, setDashboardSocket] = useState(null);
  useEffect(() => {
    if (!token) return;
    let socket;
    try {
      socket = createSocket(token);
      setDashboardSocket(socket);
      socket.on('connect', () => {
        // console.log('dashboard socket connected')
      });
      
      // Helpers for localStorage state shared across components
      const getId = (val) => (typeof val === 'object' && val?._id ? String(val._id) : String(val || ''));
      const bumpRecents = (friendId, message) => {
        try {
          const key = 'chatRecents';
          const prev = JSON.parse(localStorage.getItem(key) || '{}');
          prev[String(friendId)] = {
            updatedAt: message?.createdAt || new Date().toISOString(),
            lastText: message?.text || message?.content || (message?.note ? 'Shared a note' : '')
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

      // Message related events
      socket.on('receive_message', (payload) => {
        const message = payload?.message || payload;
        const senderId = getId(message?.sender);
        const recipientId = getId(message?.receiver || message?.recipient);
        const myId = auth?.user?.id;
        const friendId = senderId !== String(myId) ? senderId : recipientId;

        bumpRecents(friendId, message);
        // increment unread if not currently chatting with this friend or active tab isn't chat
        const isActiveChat = activeTab === 'chat' && chatFriend && getId(chatFriend?._id) === String(friendId);
        if (!isActiveChat) incrementUnread(friendId);
        setNotifReloadSignal(n => n + 1);
      });
      socket.on('message_sent', (msg) => {
        setNotifReloadSignal(n => n + 1);
      });
      
      // Friend related events
      socket.on('friend:request', () => {
        setNotifReloadSignal(n => n + 1);
      });
      // Typing indicator propagate to list
      const setTyping = (friendId) => {
        try {
          const key = 'chatTyping';
          const map = JSON.parse(localStorage.getItem(key) || '{}');
          map[String(friendId)] = { lastTypingAt: Date.now() };
          localStorage.setItem(key, JSON.stringify(map));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      };
      socket.on('user_typing', ({ userId }) => {
        setTyping(userId);
      });
      socket.on('user_stopped_typing', ({ userId }) => {
        setTyping(userId);
      });
      socket.on('friend:accepted', () => {
        setNotifReloadSignal(n => n + 1);
      });
      socket.on('friend:online', (userId) => {
        setNotifReloadSignal(n => n + 1);
      });
      socket.on('friend:offline', (userId) => {
        setNotifReloadSignal(n => n + 1);
      });
    } catch (err) {
      console.error('Socket connection error:', err);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-page bg-gray-50 min-h-screen flex flex-col">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white"
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

      {/* Mobile Navigation */}
      <MobileNav
        tabs={TABS}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed z-40">
        <SidebarNav 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabClick={handleTabClick}
        />
      </div>
      
  {/* Main content area with responsive margin */}
  <div className="lg:ml-72 flex-1 flex flex-col">
        <DashboardHeader userName={user?.name} onLogout={onLogout} />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full h-full">
          {/* Chat panel - full screen */}
          {activeTab === 'chat' ? (
            <div style={{ flex: 1, display: 'flex', width: '100%', height: '100%', minHeight: 0 }}>
              <ChatContainer />
            </div>
          ) : (
            <div className="px-4 lg:px-8 py-6 flex-1">
              <main className="flex-1 min-h-[calc(100vh-200px)]">
                {/* All panel content goes inside max-w-7xl container */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                  <>
                    {activeTab === 'notifications' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px]">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
                      <div className="bg-white p-4 rounded-lg">
                        <NotificationsPanel reloadSignal={notifReloadSignal} socket={dashboardSocket} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'todo' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px]">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h2>
                      <div className="bg-white p-4 rounded-lg">
                        <ToDoSidebar showAsMainContent={true} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'search' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px]">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Search</h2>
                      <div className="bg-white p-4 rounded-lg">
                        <SearchPanel onOpenChat={openChatFromSearch} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'videos' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">YouTube Search</h2>
                      <div className="w-full">
                        <YouTubeSearch />
                        {/* Draggable Save Note widget will appear here */}
                        {<DraggableSaveNote />}
                      </div>
                    </div>
                  )}

                  {/* Home, News, and Notes tabs remain unchanged */}
                  {activeTab === 'home' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                      {/* JournIQ Introduction Section */}
                      <div className="space-y-8 p-4 lg:p-6">
                        <div className="space-y-6">
                          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            JournIQ
                          </h1>
                          <h2 className="text-2xl lg:text-3xl font-medium text-gray-700">
                            Your Intelligent Digital Workspace
                          </h2>
                          <div className="space-y-4">
                            <p className="text-lg text-gray-600 leading-relaxed">
                              Transform your digital experience with JournIQ, where productivity meets intelligence. 
                              Seamlessly organize your thoughts, connect with friends, and stay updated—all in one place.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-blue-500 mb-2">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Smart Notes</h3>
                                <p className="text-gray-600 text-sm">Capture ideas and share them instantly with your network</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-purple-500 mb-2">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Connect & Share</h3>
                                <p className="text-gray-600 text-sm">Build meaningful connections and collaborate seamlessly</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-green-500 mb-2">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                  </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Stay Informed</h3>
                                <p className="text-gray-600 text-sm">Get personalized news and updates that matter to you</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-orange-500 mb-2">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Task Management</h3>
                                <p className="text-gray-600 text-sm">Organize your tasks and boost productivity</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Side Feature Highlights */}
                      <div className="hidden lg:block space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">What's New</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Real-time Collaboration</h4>
                              <p className="text-gray-600">Share notes and ideas instantly with your connections</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Smart Organization</h4>
                              <p className="text-gray-600">Intelligent categorization and search for your content</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Smart Notifications</h4>
                              <p className="text-gray-600">Stay updated with personalized alerts and reminders</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'news' && (
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                        <div className="w-full">
                          <NewsSection news={news} />
                        </div>
                      </div>
                      {<DraggableSaveNote />}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <SavedNotes onSelectForShare={note => setNoteToShare(note)} />
                    </div>
                  )}
                  </>
                </div>
              </main>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Hidden for chat tab */}
      {activeTab !== 'chat' && (
        <footer className="text-center py-1 text-xs text-gray-400">
          © 2025 Ansh
        </footer>
      )}

      {/* Luna Chatbot (renders floating toggle internally) */}
      <ChatbotSidebar />

    </div>
  );
};

export default DashboardPage;