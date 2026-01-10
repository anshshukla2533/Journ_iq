import React, { useEffect, useState, useRef } from 'react';
import ContactsList from './ContactsList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ThreeDAnimation from './ThreeDAnimation';
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
            // Welcome Screen - Video
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
              {/* Soft background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
                <div className="absolute top-1/3 -right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-1000"></div>
              </div>

              {/* Video */}
              <div className="relative z-10 w-full max-w-2xl h-48 sm:h-56 md:h-72 lg:h-96 px-2">
                {/* Video container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-500">
                  {/* Subtle border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20 pointer-events-none z-10 border border-gray-200"></div>
                  
                  {/* Video */}
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/src/assets/chatsidebar.mp4" type="video/mp4" />
                  </video>

                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-5 pointer-events-none rounded-2xl"></div>
                </div>

                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-10 -z-10 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}