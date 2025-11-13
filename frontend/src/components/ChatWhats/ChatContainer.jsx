import React, { useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [mobileView, setMobileView] = useState('list');

  useEffect(() => { setAuthToken(token); }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try { const r = await api.get('/friends/list'); setContacts(r.data || []); } catch (e) { setContacts([]); }
    })();

    try {
      const s = createSocket(token);
      setSocket(s);
      return () => { if (s) s.disconnect(); };
    } catch (_) {}
  }, [token]);

  useEffect(() => {
    const onResize = () => {
      const next = window.innerWidth < 768;
      setIsMobile(next);
      if (!next) setMobileView('list');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isMobile && !activeContact) {
      setMobileView('list');
    }
  }, [isMobile, activeContact]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    if (isMobile) {
      setMobileView('chat');
    }
  };

  const handleBack = () => {
    if (isMobile) {
      setMobileView('list');
      return;
    }
    setActiveContact(null);
  };

  const showContacts = !isMobile || mobileView === 'list';
  const showChatArea = !isMobile || mobileView === 'chat';
  const containerStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    padding: isMobile ? '12px' : '16px',
    gap: isMobile ? '12px' : '16px',
    flexDirection: isMobile ? 'column' : 'row',
    minHeight: 0,
  };
  const sidebarStyle = {
    width: isMobile ? '100%' : '320px',
    display: showContacts ? 'flex' : 'none',
    flexDirection: 'column',
    borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
    backgroundColor: '#fff',
    minHeight: 0,
    flexShrink: 0,
    maxHeight: '100%',
  };
  const chatAreaStyle = {
    flex: 1,
    display: showChatArea ? 'flex' : 'none',
    flexDirection: 'column',
    backgroundColor: '#fff',
    minHeight: 0,
  };
  const messageListWrapperStyle = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
  };
  const messageListInnerStyle = {
    flex: 1,
    minHeight: 0,
  };
  const getPlaceholder = () => (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
      <div style={{ textAlign: 'center', paddingTop: '32px' }}>
        <div style={{ opacity: 0.45 }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <path d="M4 4h16v12H8l-4 4z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="9" r="1" />
            <circle cx="12" cy="9" r="1" />
            <path d="M9 13h6" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: 500 }}>Select a chat to start messaging</p>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Choose a contact from the list</p>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Chats</h1>
            <button style={{ padding: '8px', cursor: 'pointer', borderRadius: '50%', backgroundColor: 'transparent', border: 'none', color: '#666' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff', minHeight: 0 }}>
          <ContactsList contacts={contacts} onOpen={handleSelectContact} active={activeContact} />
        </div>
      </div>

      {showChatArea ? (
        <div style={chatAreaStyle}>
          <div style={{ flexShrink: 0, borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
            <ChatHeader contact={activeContact} onBack={handleBack} showBack={isMobile} />
          </div>

          <div style={messageListWrapperStyle}>
            <div style={messageListInnerStyle}>
              {activeContact ? <MessageList contact={activeContact} socket={socket} user={user} /> : getPlaceholder()}
            </div>
          </div>

          <div style={{ flexShrink: 0, padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}>
            <MessageInput contact={activeContact} socket={socket} user={user} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', padding: '16px', minHeight: 0 }}>
          {getPlaceholder()}
        </div>
      )}
    </div>
  );
}
