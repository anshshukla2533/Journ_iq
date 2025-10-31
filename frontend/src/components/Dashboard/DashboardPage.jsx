
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DashboardHeader from './DashboardHeader';
import NewsSection from './NewsSection';
import SavedNotes from './SavedNotes';

import ChatbotSidebar from './ChatbotSidebar';
import YouTubeSearch from './YouTubeSearch';
import ToDoSidebar from './ToDoSidebar';
import FriendsSidebar from './FriendsSidebar';
import ChatWindow from './ChatWindow';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';


const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'news', label: 'News', icon: '📰' },
  { key: 'notes', label: 'Notes', icon: '📝' },
  { key: 'videos', label: 'Videos', icon: '🎥' },
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
    return 'home';
  };
  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);


  // Friends sidebar state
  const [showFriends, setShowFriends] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);

  // Fetch news when News tab is clicked
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Update URL
    if (tab === 'home') navigate('/dashboard');
    else navigate(`/dashboard/${tab}`);
    if (tab === 'news' && typeof onFetchNews === 'function') {
      onFetchNews();
    }
  };

  const [showChatbot, setShowChatbot] = useState(false);
  const [showTodo, setShowTodo] = useState(false);
  // Draggable Save Note widget state (moved to DraggableSaveNote component)
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
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 flex flex-col items-center border border-gray-200 dark:border-gray-700"
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

  return (
    <div className="dashboard-page bg-[#f2c08e] min-h-screen relative">
      <DashboardHeader userName={user?.name} onLogout={onLogout} />

      {/* Tab Navigation */}
      <div className="w-full flex justify-center py-6 bg-white/80 shadow-sm sticky top-0 z-20">
        <div className="flex gap-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${activeTab === tab.key ? 'bg-pink-100 text-pink-700 shadow' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => handleTabClick(tab.key)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
          {/* Friends Button */}
          <button
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-lg transition-colors bg-purple-100 text-purple-700 shadow hover:bg-purple-200"
            onClick={() => setShowFriends(true)}
          >
            <span>👥</span> Friends
          </button>
        </div>
      </div>
      {/* Friends Sidebar Overlay */}
      {showFriends && (
        <div className="fixed inset-0 z-[200] bg-black bg-opacity-30 flex justify-end">
          <FriendsSidebar
            onStartChat={friend => {
              setChatFriend(friend);
              setShowFriends(false);
            }}
            onShareNote={friend => {}}
          />
          <button
            className="absolute top-4 right-96 bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600"
            onClick={() => setShowFriends(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Chat Window Overlay */}
      {chatFriend && (
        <ChatWindow
          friend={chatFriend}
          onClose={() => setChatFriend(null)}
        />
      )}

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Draggable Save Note widget (on news and videos tabs, only one instance) */}
        {(activeTab === 'news' || activeTab === 'videos') && <DraggableSaveNote />}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Welcome Section (same as before) */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold text-gray-800 leading-tight">Welcome</h1>
                <h2 className="text-4xl font-semibold text-blue-600">{user?.name || 'User'}!</h2>
                <p className="text-xl text-gray-700 leading-relaxed">Your personal digital companion for staying organized and informed</p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">✨ What you can do:</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <div className="text-3xl">📰</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Stay Updated</h4>
                      <p className="text-gray-700">Get the latest news from various categories including education, business, sports, and politics</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <div className="text-3xl">📝</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Organize Thoughts</h4>
                      <p className="text-gray-700">Write, save, edit, and manage your personal notes with timestamps and easy organization</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <div className="text-3xl">🎥</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Watch & Learn</h4>
                      <p className="text-gray-700">Access educational videos and content to enhance your knowledge and skills</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <div className="text-3xl">🔒</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Secure & Private</h4>
                      <p className="text-gray-700">Your data is protected with secure authentication and private storage</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <p className="text-lg text-gray-700 mb-4">Ready to get started?</p>
                <div className="flex space-x-4">
                  <button onClick={() => setActiveTab('news')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">📰 Read Latest News</button>
                  <button onClick={() => setActiveTab('notes')} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">📝 Create New Note</button>
                </div>
              </div>
            </div>
            {/* JournIQ Illustration (formerly Digital Diary) */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
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
                  <div className="absolute top-8 left-8 w-16 h-16 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
                  <div className="absolute bottom-12 right-12 w-12 h-12 bg-purple-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-20 right-8 w-8 h-8 bg-green-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 rounded-3xl transform translate-x-2 translate-y-2 -z-10"></div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'news' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            {/* News on left */}
            <div>
              <NewsSection news={news} />
            </div>
            {/* Removed non-draggable Save Note widget from news section */}
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto space-y-8 px-4">
            <SavedNotes />
          </div>
        )}
        {activeTab === 'videos' && (
          <div className="w-full flex flex-col items-center justify-center px-2 md:px-8">
            <YouTubeSearch />
            {/* Only draggable Save Note widget will show, no extra note widget */}
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="w-full bg-black text-white py-6 flex items-center justify-center mt-12 border-t border-gray-900">
        <span className="text-lg font-semibold tracking-wide">Built with <span className="text-red-500">♥</span> by Ansh</span>
      </footer>


      {/* To-Do Toggle Button (left side) */}
      {!showTodo && (
        <button
          className="fixed left-0 top-1/3 z-50 bg-green-600 text-white px-4 py-2 rounded-r-lg shadow-lg hover:bg-green-700 transition"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => setShowTodo(true)}
        >
          Open To-Do
        </button>
      )}

      {/* To-Do Sidebar */}
      {showTodo && (
        <ToDoSidebar onClose={() => setShowTodo(false)} />
      )}

      {/* Chatbot Toggle Button (right side) */}
      {!showChatbot && (
        <button
          className="fixed right-0 top-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-l-lg shadow-lg hover:bg-blue-700 transition"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => setShowChatbot(true)}
        >
          Open Chatbot
        </button>
      )}

      {/* Chatbot Sidebar */}
      {showChatbot && (
        <ChatbotSidebar onClose={() => setShowChatbot(false)} />
      )}
    </div>
  );
};

export default DashboardPage;