import React, { useEffect, useState, useRef } from 'react';
import ContactsList from './ContactsList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { createSocket } from '../../services/socket';
import { api, setAuthToken } from '../../services/api';
import useAuth from '../../hooks/useAuth';

export default function ChatContainer() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => { 
    setAuthToken(token); 
  }, [token]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load contacts and setup socket
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const initializeChat = async () => {
      setLoading(true);
      try {
        const res = await api.get('/friends/list');
        setContacts(res.data || []);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    try {
      const socketInstance = createSocket(token);
      setSocket(socketInstance);
      
      return () => { 
        if (socketInstance) socketInstance.disconnect(); 
      };
    } catch (err) {
      console.error('Socket connection failed:', err);
    }
  }, [token]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBack = () => {
    if (isMobile) {
      setShowSidebar(true);
    }
    setActiveContact(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading chats...</p>
        </div>
      </div>
    );
  }

  const showContactsList = !isMobile || showSidebar;
  const showChatArea = !isMobile || !showSidebar;

  return (
    <div className="flex w-full h-full bg-white relative overflow-hidden">
      {/* Sidebar - Contacts List */}
      {showContactsList && (
        <div className={`${
          isMobile ? 'absolute inset-0 z-20' : 'relative w-80 lg:w-96'
        } bg-white border-r border-gray-200 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">No contacts found</p>
                <p className="text-gray-400 text-sm">Add friends to start chatting</p>
              </div>
            ) : (
              <ContactsList
                contacts={contacts}
                onOpen={handleSelectContact}
                active={activeContact}
              />
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {showChatArea && (
        <div className="flex-1 flex flex-col bg-white">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 border-b border-gray-200 bg-white">
                <ChatHeader
                  contact={activeContact}
                  onBack={handleBack}
                  showBack={isMobile}
                />
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <MessageList
                  contact={activeContact}
                  socket={socket}
                  user={user}
                />
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
            // Welcome Screen
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
              <div className="mb-6 relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Select a chat to start messaging
              </h2>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                Choose a contact from the list to begin your conversation
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  💬 Real-time Chat
                </span>
                <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                  📞 Voice Calls
                </span>
                <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                  🎥 Video Calls
                </span>
                <span className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-full text-sm font-medium">
                  📝 Share Notes
                </span>
              </div>

              {/* Mobile: Show contacts button */}
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                  View Contacts
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}