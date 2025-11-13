import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import MessageBubble from './MessageBubble';

export default function MessageList({ contact, socket, user }) {
  const [messages, setMessages] = useState([]);
  const ref = useRef();
  const userId = user?._id;

  // Helper to flag ownership without useCallback to avoid stale closure
  const withFromMe = (msg) => {
    if (!userId) return msg;
    const senderId = msg?.sender?._id || msg?.sender;
    const isMine = String(senderId) === String(userId);
    return { ...msg, fromMe: isMine };
  };

  useEffect(() => {
    if (!contact || !userId) { setMessages([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const r = await api.get(`/messages/${contact._id}`);
        const list = Array.isArray(r.data) ? r.data.map(withFromMe) : [];
        if (!cancelled) setMessages(list);
      } catch (e) { if (!cancelled) setMessages([]); }
    })();
    return () => { cancelled = true; };
  }, [contact, userId]);

  // Handle read receipts
  const markMessagesAsRead = () => {
    if (!socket || !contact || !userId) return;
    setMessages((prev) => {
      prev.forEach((msg) => {
        const receiverId = msg?.receiver?._id || msg?.receiver;
        // Only mark as read if: it's not from me AND it's for me AND not already read
        const isForMe = receiverId && String(receiverId) === String(userId);
        if (msg.fromMe || !isForMe || msg.status === 'read') return;
        socket.emit('message:read', { messageId: msg._id });
      });
      return prev;
    });
  };

  useEffect(() => {
    if (!socket) return;

    const appendIfRelevant = (payload) => {
      const message = withFromMe(payload?.message || payload);
      const senderId = message?.sender?._id || message?.sender;
      const receiverId = message?.receiver?._id || message?.receiver;
      if (!contact) return;
      // Show message if it's from the active contact OR to the active contact
      if (String(senderId) === String(contact._id) || String(receiverId) === String(contact._id)) {
        setMessages((m) => [...m, message]);
        setTimeout(() => ref.current?.scrollTo(0, ref.current.scrollHeight), 50);
      }
    };

    const onMessageStatusUpdate = (payload) => {
      const { messageId, status } = payload;
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m))
      );
    };

    // Recipient side
    socket.on('message:received', appendIfRelevant);
    // Sender confirmation
    socket.on('message:sent', appendIfRelevant);
    // Read receipt update
    socket.on('message:status', onMessageStatusUpdate);

    return () => {
      socket.off('message:received', appendIfRelevant);
      socket.off('message:sent', appendIfRelevant);
      socket.off('message:status', onMessageStatusUpdate);
    };
  }, [socket, contact, userId]);

  // Mark visible messages as read after a short delay
  useEffect(() => {
    const timer = setTimeout(markMessagesAsRead, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', width: '100%', height: '100%' }} ref={ref}>
      {messages.length === 0 && (
        <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '32px' }}>No messages yet</div>
      )}
      {messages.map((m) => (
        <MessageBubble key={m._id || m.createdAt} message={m} />
      ))}
    </div>
  );
}
