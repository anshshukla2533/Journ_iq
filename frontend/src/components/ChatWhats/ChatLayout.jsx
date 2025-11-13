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

  useEffect(() => { setAuthToken(token); }, [token]);

  useEffect(() => {
    if (!token) return;
    // load friends
    (async () => {
      try { const r = await api.get('/friends/list'); setContacts(r.data || []); } catch (e) { setContacts([]); }
    })();

    // create socket
    try {
      const s = createSocket(token);
      setSocket(s);
      return () => { if (s) s.disconnect(); };
    } catch (_) {}
  }, [token]);

  return (
    <div className="flex w-full h-full bg-gray-200">
      {/* Left Sidebar - Contacts (WhatsApp style) */}
      <div className="w-80 bg-gray border-r border-gray-200 flex flex-col">
        {/* Header with search and menu */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Contacts List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <ContactsList contacts={contacts} onOpen={setActiveContact} active={activeContact} />
        </div>
      </div>

      {/* Right Side - Chat (WhatsApp style) */}
      <div className="flex-1 flex flex-col bg-gray-200 min-h-0">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-gray h-auto">
              <ChatHeader contact={activeContact} onBack={() => setActiveContact(null)} />
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
              <MessageList contact={activeContact} socket={socket} user={user} />
            </div>
            
            {/* Input Area */}
            <div className="flex-shrink-0 p-4 bg-gray-100 border-t border-gray-200">
              <MessageInput contact={activeContact} socket={socket} user={user} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="text-8xl mb-4 opacity-30">💬</div>
              <p className="text-gray-500 text-lg font-medium">Select a chat to start messaging</p>
              <p className="text-gray-400 text-sm mt-2">Choose a contact from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
