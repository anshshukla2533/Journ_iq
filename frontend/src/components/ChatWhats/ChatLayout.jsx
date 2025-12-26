import React, { useEffect, useState } from 'react';
import ContactsList from './ContactsList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { createSocket } from '../../services/socket';
import { api, setAuthToken } from '../../services/api';
import useAuth from '../../hooks/useAuth';

export default function ChatLayout() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { 
    setAuthToken(token); 
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Initialize data loading
    const initializeChat = async () => {
      setLoading(true);
      try {
        // Load friends
        const r = await api.get('/friends/list');
        setContacts(r.data || []);
      } catch (e) {
        console.error('Failed to load contacts:', e);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Create socket connection
    try {
      const s = createSocket(token);
      setSocket(s);
      return () => { 
        if (s) s.disconnect(); 
      };
    } catch (err) {
      console.error('Socket connection failed:', err);
    }
  }, [token]);

  // Close sidebar when contact is selected on mobile
  const handleContactSelect = (contact) => {
    setActiveContact(contact);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Handle back button on mobile
  const handleBack = () => {
    setActiveContact(null);
    setSidebarOpen(true);
  };

  if (loading) {
    return (
      <div className="flex w-full h-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-white relative">
      {/* Left Sidebar - Contacts (Responsive) */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 absolute md:relative w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out h-full z-20`}
      >
        {/* Header with search and menu */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chats</h1>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or email"
              className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Contacts List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">No contacts found</p>
              <p className="text-gray-400 text-sm">Add friends to start chatting</p>
            </div>
          ) : (
            <ContactsList 
              contacts={contacts} 
              onOpen={handleContactSelect} 
              active={activeContact} 
            />
          )}
        </div>
      </div>

      {/* Right Side - Chat Area (Responsive) */}
      <div 
        className={`${
          !sidebarOpen || !activeContact ? 'translate-x-0' : 'translate-x-0'
        } flex-1 flex flex-col bg-gray-50 min-h-0 w-full`}
      >
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
              <ChatHeader 
                contact={activeContact} 
                onBack={handleBack}
                showBackButton={true}
              />
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 min-h-0 bg-white overflow-hidden">
              <div className="h-full overflow-y-auto flex flex-col px-4 py-3 space-y-2">
                <MessageList 
                  contact={activeContact} 
                  socket={socket} 
                  user={user} 
                />
              </div>
            </div>
            
            {/* Input Area */}
            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
              <MessageInput 
                contact={activeContact} 
                socket={socket} 
                user={user} 
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white p-4">
            <div className="text-center max-w-md">
              {/* Welcome Illustration */}
              <div className="mb-6 relative inline-block">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500"
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

              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                Select a chat to start messaging
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Choose a contact from the list to begin your conversation
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                  💬 Real-time Chat
                </span>
                <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full font-medium">
                  📞 Voice Calls
                </span>
                <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                  🎥 Video Calls
                </span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full font-medium">
                  📝 Share Notes
                </span>
              </div>

              {/* Mobile: Show contacts button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View Contacts
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {!sidebarOpen && activeContact && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(true)}
        />
      )}
    </div>
  );
}