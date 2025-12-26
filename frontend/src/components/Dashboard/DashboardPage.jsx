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
  { key: 'videos', label: 'YouTube', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ), color: 'bg-pink-500' },
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
];

const DashboardPage = ({ user, news, savedNotes, onLogout, onFetchNews }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifReloadSignal, setNotifReloadSignal] = useState(0);

  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    setActiveTab(newTab);
    
    if (newTab === 'notifications') {
      setNotifReloadSignal(prev => prev + 1);
    }
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'home') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
    
    if (tab === 'news' && typeof onFetchNews === 'function') {
      onFetchNews();
    }
  };

  // Draggable Save Note Widget
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

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth < 768) {
          setPos(prev => ({
            x: 10,
            y: window.innerHeight - 150
          }));
        } else {
          setPos(prev => ({
            x: Math.min(Math.max(0, prev.x), window.innerWidth - 400),
            y: Math.min(prev.y, window.innerHeight - 120)
          }));
        }
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
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 flex flex-col items-center border border-gray-200 dark:border-gray-700 w-full">
          <div
            className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-t-2xl cursor-move flex items-center justify-center text-xs text-gray-500 select-none"
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
              onClick={handleSaveNote}
              disabled={!note.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
            {saveMsg && <div className="mt-2 text-green-600 text-sm">{saveMsg}</div>}
          </div>
        </div>
      </div>
    );
  };

  // Dashboard socket for notifications
  const [dashboardSocket, setDashboardSocket] = useState(null);
  useEffect(() => {
    if (!token) return;
    let socket;
    try {
      socket = createSocket(token);
      setDashboardSocket(socket);
      
      socket.on('receive_message', () => setNotifReloadSignal(n => n + 1));
      socket.on('message_sent', () => setNotifReloadSignal(n => n + 1));
      socket.on('friend:request', () => setNotifReloadSignal(n => n + 1));
      socket.on('friend:accepted', () => setNotifReloadSignal(n => n + 1));
    } catch (err) {
      console.error('Socket connection error:', err);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  return (
    <div className="dashboard-page bg-white min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg"
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
      <div className="hidden lg:block fixed z-40 h-screen overflow-y-auto">
        <SidebarNav 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabClick={handleTabClick}
        />
      </div>
      
      {/* Main content area */}
      <div className="lg:ml-72 flex-1 flex flex-col h-full overflow-hidden">
        <DashboardHeader userName={user?.name} onLogout={onLogout} />

        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {/* Chat panel - full screen */}
          {activeTab === 'chat' ? (
            <div className="flex-1 w-full h-full overflow-hidden">
              <ChatContainer />
            </div>
          ) : (
            <div className="px-4 lg:px-8 py-6 flex-1 overflow-auto bg-white">
              <main className="flex-1 min-h-[calc(100vh-200px)]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                  {activeTab === 'notifications' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px]">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
                      <NotificationsPanel reloadSignal={notifReloadSignal} socket={dashboardSocket} />
                    </div>
                  )}

                  {activeTab === 'todo' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px]">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h2>
                      <ToDoSidebar showAsMainContent={true} />
                    </div>
                  )}

                  {activeTab === 'search' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px]">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Search</h2>
                      <SearchPanel />
                    </div>
                  )}

                  {activeTab === 'videos' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">YouTube Search</h2>
                      <YouTubeSearch />
                      <DraggableSaveNote />
                    </div>
                  )}

                  {activeTab === 'home' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                      <div className="space-y-8 p-4 lg:p-6">
                        <div className="space-y-6">
                          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            JournIQ
                          </h1>
                          <h2 className="text-2xl lg:text-3xl font-medium text-gray-700">
                            Your Intelligent Digital Workspace
                          </h2>
                          <p className="text-lg text-gray-600 leading-relaxed">
                            Transform your digital experience with JournIQ, where productivity meets intelligence.
                          </p>
                        </div>

                        {/* Features Section */}
                        <div className="space-y-6 pt-4">
                          <h3 className="text-xl font-bold text-gray-800">Why JournIQ?</h3>
                          
                          <div className="space-y-4">
                            {/* Feature 1 */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">All-in-One Platform</h4>
                                <p className="text-gray-600 text-sm mt-1">
                                  Consolidated YouTube, news feeds, search, and notes in one place—reducing app-switching by 70% for 200+ users.
                                </p>
                              </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">AI-Powered Search</h4>
                                <p className="text-gray-600 text-sm mt-1">
                                  Cut content retrieval time by 50% with semantic search using Gemini API for instant discovery.
                                </p>
                              </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Real-Time Collaboration</h4>
                                <p className="text-gray-600 text-sm mt-1">
                                  Enable seamless teamwork through low-latency shared notes, chat, and voice calling using Socket.io and WebRTC.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Illustration or Stats */}
                      <div className="hidden lg:flex items-center justify-center p-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
                          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                            <div className="space-y-6">
                              <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                                  70%
                                </div>
                                <p className="text-gray-600 text-sm mt-2">Reduction in app-switching</p>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                                  50%
                                </div>
                                <p className="text-gray-600 text-sm mt-2">Faster content retrieval</p>
                              </div>

                              <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                                  200+
                                </div>
                                <p className="text-gray-600 text-sm mt-2">Active users</p>
                              </div>

                              <div className="pt-4 border-t border-blue-200">
                                <p className="text-center text-gray-700 font-medium text-sm">
                                  ✨ Powered by AI & Real-Time Tech
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'news' && (
                    <div className="max-w-4xl mx-auto">
                      <NewsSection news={news} />
                      <DraggableSaveNote />
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <SavedNotes />
                    </div>
                  )}
                </div>
              </main>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Hidden for chat tab */}
      {activeTab !== 'chat' && (
        <footer className="text-center py-1 text-xs text-gray-400 flex-shrink-0 bg-white">
          © 2025 Ansh
        </footer>
      )}

      {/* Luna Chatbot */}
      <ChatbotSidebar />
    </div>
  );
};

export default DashboardPage;