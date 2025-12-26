import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import MessageBubble from './MessageBubble';

export default function MessageList({ contact, socket, user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const userId = user?._id || user?.id;

  // Helper to add ownership flag
  const withFromMe = (msg) => {
    if (!userId) return msg;
    const senderId = msg?.sender?._id || msg?.sender;
    return { ...msg, fromMe: String(senderId) === String(userId) };
  };

  // Load messages when contact changes
  useEffect(() => {
    if (!contact || !userId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const loadMessages = async () => {
      try {
        const res = await api.get(`/messages/${contact._id}`);
        const messageList = Array.isArray(res.data) 
          ? res.data.map(withFromMe) 
          : [];
        
        if (!cancelled) {
          setMessages(messageList);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        if (!cancelled) {
          setMessages([]);
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [contact?._id, userId]);

  // Socket event handlers for real-time messages
  useEffect(() => {
    if (!socket || !contact) return;

    const handleNewMessage = (payload) => {
      const message = withFromMe(payload?.message || payload);
      const senderId = message?.sender?._id || message?.sender;
      const receiverId = message?.receiver?._id || message?.receiver;

      // Only add message if it's relevant to current chat
      if (
        String(senderId) === String(contact._id) || 
        String(receiverId) === String(contact._id)
      ) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const handleMessageStatus = ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(m => (m._id === messageId ? { ...m, status } : m))
      );
    };

    // Listen to both event formats for compatibility
    socket.on('message:received', handleNewMessage);
    socket.on('receive_message', handleNewMessage);
    socket.on('message:sent', handleNewMessage);
    socket.on('message_sent', handleNewMessage);
    socket.on('message:status', handleMessageStatus);
    socket.on('message_read', handleMessageStatus);

    return () => {
      socket.off('message:received', handleNewMessage);
      socket.off('receive_message', handleNewMessage);
      socket.off('message:sent', handleNewMessage);
      socket.off('message_sent', handleNewMessage);
      socket.off('message:status', handleMessageStatus);
      socket.off('message_read', handleMessageStatus);
    };
  }, [socket, contact, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!socket || !contact || !userId || messages.length === 0) return;

    const timer = setTimeout(() => {
      messages.forEach(msg => {
        const receiverId = msg?.receiver?._id || msg?.receiver;
        const isForMe = String(receiverId) === String(userId);
        
        if (!msg.fromMe && isForMe && msg.status !== 'read') {
          socket.emit('message:read', { messageId: msg._id });
          socket.emit('read_message', { messageId: msg._id });
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [messages, socket, contact, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 w-full h-full overflow-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Send a message to start the conversation</p>
          </div>
        </div>
      ) : (
        messages.map(message => (
          <MessageBubble 
            key={message._id || message.createdAt} 
            message={message} 
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}