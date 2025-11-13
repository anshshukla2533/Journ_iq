import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DashboardHeader from './DashboardHeader';
import NewsSection from './NewsSection';
import SavedNotes from './SavedNotes';
import ChatbotSidebar from './ChatbotSidebar';
import YouTubeSearch from './YouTubeSearch';
import ToDoSidebar from './ToDoSidebar';
import FriendsFresh from './FriendsFresh';
import ChatLayout from '../ChatWhats/ChatLayout';
import SidebarNav from './SidebarNav';
import NotificationsPanel from './NotificationsPanel';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';
import { createSocket } from '../../services/socket';

const TABS = [
  { key: 'home', label: 'Home', icon: '🏠', color: 'bg-blue-500' },
  { key: 'notes', label: 'Notes', icon: '📝', color: 'bg-green-500' },
  { key: 'news', label: 'News', icon: '📰', color: 'bg-yellow-500' },
  { key: 'notifications', label: 'Notifications', icon: '🔔', color: 'bg-red-500' },
  { key: 'friends', label: 'Friends', icon: '👥', color: 'bg-purple-500' },
  { key: 'search', label: 'Search', icon: '🔍', color: 'bg-indigo-500' },
  { key: 'todo', label: 'Todo', icon: '✓', color: 'bg-orange-500' },
  { key: 'videos', label: 'YouTube', icon: '🎥', color: 'bg-pink-500' },
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
    if (pathname.endsWith('/todo')) return 'todo';
    if (pathname.endsWith('/search')) return 'search';
    if (pathname.endsWith('/friends')) return 'friends';
    if (pathname.endsWith('/notifications')) return 'notifications';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
  const [chatFriend, setChatFriend] = useState(null);
  const [noteToShare, setNoteToShare] = useState(null);
  const { token } = useAuth();
  const [notifReloadSignal, setNotifReloadSignal] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Handle tab navigation
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/dashboard');
    else navigate(`/dashboard/${tab}`);
    if (tab === 'news' && typeof onFetchNews === 'function') {
      onFetchNews();
    }
  };

  // Draggable Save Note widget component
  const DraggableSaveNote = () => {
    const { token } = useAuth();
    const [show, setShow] = useState(true);
    const [note, setNote] = useState('');
    const [saveMsg, setSaveMsg] = useState('');
    const [saving, setSaving] = useState(false);
    const [pos, setPos] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight - 200 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
      const handleMouseMove = e => {
        if (dragging) {
          setPos({
            x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.current.x)),
            y: Math.max(0, Math.min(window.innerHeight - 180, e.clientY - dragOffset.current.y)),
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
    }, [dragging]);

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
        className="fixed z-[100] w-full max-w-lg"
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 flex flex-col items-center border border-gray-200 dark:border-gray-700">
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

  // Socket connection for real-time notifications
  const [dashboardSocket, setDashboardSocket] = useState(null);
  useEffect(() => {
    if (!token) return;
    let socket;
    try {
      socket = createSocket(token);
      setDashboardSocket(socket);
      socket.on('connect', () => {
        console.log('Dashboard socket connected');
      });
      socket.on('receive_message', () => {
        setNotifReloadSignal(n => n + 1);
      });
      socket.on('message_sent', () => {
        setNotifReloadSignal(n => n + 1);
      });
      socket.on('user_online', () => {
        setNotifReloadSignal(n => n + 1);
      });
    } catch (err) {
      console.error('Socket connection error:', err);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  return (
    <div className="dashboard-page bg-gray-50 min-h-screen">
      <SidebarNav tabs={TABS} activeTab={activeTab} onTabClick={handleTabClick} />
      
      {/* Main content area with margin for fixed sidebar */}
      <div className="ml-72">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <DashboardHeader userName={user?.name} onLogout={onLogout} />
          </div>
        </div>

        {/* Main content */}
        <main className="px-8 py-6">
          {/* Tab Content */}
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Welcome Section */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-6xl font-bold text-gray-800 leading-tight">Welcome</h1>
                  <h2 className="text-4xl font-semibold text-indigo-600">{user?.name || 'User'}!</h2>
                  <p className="text-xl text-gray-700 leading-relaxed">Your personal digital companion for staying organized and informed</p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">✨ Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {TABS.slice(1).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => handleTabClick(tab.key)}
                        className={`flex items-center space-x-4 p-4 ${tab.color} bg-opacity-10 rounded-lg transition-all hover:bg-opacity-20`}
                      >
                        <div className={`w-12 h-12 ${tab.color} rounded-lg flex items-center justify-center text-2xl`}>
                          {tab.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-gray-800">{tab.label}</h4>
                          <p className="text-sm text-gray-600">Access your {tab.label.toLowerCase()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* App Illustration */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full bg-pattern"></div>
                    </div>
                    <div className="relative z-10 text-center">
                      <div className="text-8xl mb-4">📔</div>
                      <div className="absolute -top-8 -left-8 text-4xl animate-bounce">📝</div>
                      <div className="absolute -top-4 -right-8 text-3xl animate-pulse">💡</div>
                      <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>⭐</div>
                      <div className="absolute -bottom-8 -right-4 text-4xl animate-pulse" style={{animationDelay: '1s'}}>🚀</div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">JournIQ</h3>
                        <p className="text-gray-600 text-sm">Your thoughts, organized</p>
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
            <div className="max-w-4xl mx-auto">
              <SavedNotes onSelectForShare={note => setNoteToShare(note)} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-4xl mx-auto">
              <NotificationsPanel reloadSignal={notifReloadSignal} socket={dashboardSocket} />
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="max-w-4xl mx-auto">
              <FriendsFresh
                onStartChat={friend => { setChatFriend(friend); setActiveTab('chat'); }}
              />
              {chatFriend && (
                <ChatLayout />
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="max-w-4xl mx-auto">
              <YouTubeSearch />
              <DraggableSaveNote />
            </div>
          )}

          {activeTab === 'todo' && (
            <div className="max-w-4xl mx-auto">
              <ToDoSidebar standalone={true} />
            </div>
          )}
        </main>
      </div>

      {/* Chatbot Toggle Button */}
      {!showChatbot && (
        <button
          className="fixed right-6 bottom-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all"
          onClick={() => setShowChatbot(true)}
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}

      {/* Chatbot Sidebar */}
      {showChatbot && (
        <div className="fixed right-0 top-0 h-full w-96 z-50">
          <ChatbotSidebar onClose={() => setShowChatbot(false)} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;