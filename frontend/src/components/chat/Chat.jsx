import React, { useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { createSocket, getSocket } from '../../services/socket';

const conversationCache = new Map();
const TYPING_IDLE_MS = 1200;

const formatDayLabel = (value) => {
  const date = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target - today) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatLastSeen = (value) => {
  if (!value) return 'Last seen recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last seen recently';

  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 2) return 'Last seen just now';
  if (minutes < 60) return `Last seen ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;

  return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
};

const Chat = ({
  friend,
  onClose,
  initialDraft = '',
  initialNoteId = null,
  initialNoteTitle = '',
  initialNoteAlreadyShared = false,
}) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attachedNote, setAttachedNote] = useState(null);
  const [typing, setTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [presence, setPresence] = useState({
    online: Boolean(friend?.online),
    lastSeen: friend?.lastLogin || null,
  });
  const socketRef = useRef(null);
  const endRef = useRef(null);
  const seenIds = useRef(new Set());
  const convRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const pendingQueueRef = useRef([]);
  const typingTimeoutRef = useRef(null);
  const typingSentRef = useRef(false);

  const getId = (value) => {
    if (value && typeof value === 'object') {
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
      return '';
    }
    return String(value || '');
  };
  const getEmail = v => (v ? String(v).toLowerCase() : '');
  const msgId = m => String(m?._id || m?.id || '');
  const isMine = (message) => {
    const sender = message?.sender;
    const senderId = getId(message?.senderId || sender);
    const senderEmail = getEmail(typeof sender === 'object' ? sender?.email : '');
    const receiver = message?.receiver || message?.recipient;
    const receiverId = getId(message?.receiverId || receiver);
    const myId = String(user?.id || '');
    const friendId = String(friend?._id || '');

    return (
      senderId === myId ||
      senderEmail === getEmail(user?.email) ||
      (senderId === myId && receiverId === friendId)
    );
  };

  const cacheKey = useMemo(() => {
    const a = (user?.email || '').toLowerCase();
    const b = (friend?.email || '').toLowerCase();
    return a && b ? [a, b].sort().join(':') : '';
  }, [user?.email, friend?.email]);

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    if (typingSentRef.current && socketRef.current?.connected && friend?._id) {
      try {
        socketRef.current.emit('typing:stop', { receiverId: friend._id });
      } catch {}
    }
    typingSentRef.current = false;
  };

  const emitTyping = () => {
    if (!friend?._id || !socketRef.current?.connected) return;

    if (!typingSentRef.current) {
      try {
        socketRef.current.emit('typing:start', { receiverId: friend._id });
      } catch {}
      typingSentRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_IDLE_MS);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setInput(initialDraft || '');
    if (initialNoteId) {
      setAttachedNote({
        id: initialNoteId,
        title: initialNoteTitle || 'Shared study note',
        alreadyShared: initialNoteAlreadyShared,
      });
    } else {
      setAttachedNote(null);
    }
  }, [initialDraft, initialNoteId, initialNoteTitle, initialNoteAlreadyShared, friend?._id]);

  useEffect(() => {
    setErrorMessage('');
  }, [friend?._id]);

  useEffect(() => {
    setPresence({
      online: Boolean(friend?.online),
      lastSeen: friend?.lastLogin || null,
    });
  }, [friend?._id, friend?.online, friend?.lastLogin]);

  useEffect(() => {
    if (!token || !friend?._id) return;

    if (cacheKey && conversationCache.has(cacheKey)) {
      setMessages(conversationCache.get(cacheKey));
    } else {
      setMessages([]);
    }

    seenIds.current = new Set();
    convRef.current = null;
    historyLoadedRef.current = false;
    socketRef.current = createSocket(token) || getSocket();

    const extract = (payload) => (payload && payload.message ? payload.message : payload);
    const markMessagesRead = (list) => {
      list.forEach((message) => {
        const senderId = getId(message?.senderId || message?.sender);
        const isIncoming = senderId === String(friend._id);
        const isUnread = !message.read;
        const messageId = msgId(message);
        if (isIncoming && isUnread && messageId) {
          try {
            socketRef.current?.emit('message:read', { messageId });
          } catch {}
        }
      });
    };

    const normalizeStatus = (message) => {
      const mine = isMine(message);
      if (!mine) return { ...message, status: message.read ? 'read' : 'received' };
      return { ...message, status: message.read ? 'read' : 'delivered' };
    };

    const onConnect = () => {
      try {
        socketRef.current.emit('fetch_messages', { friendId: friend._id });
      } catch {}

      const queue = pendingQueueRef.current;
      pendingQueueRef.current = [];
      queue.forEach((payload) => {
        try {
          socketRef.current.emit('send_message', payload);
        } catch {}
      });
    };

    const onHistory = (payload) => {
      if (!payload || payload.success === false) {
        setErrorMessage(payload?.error || 'Could not load messages');
        return;
      }

      const history = Array.isArray(payload.messages) ? payload.messages : [];
      convRef.current = payload.conversationId || convRef.current;

      setMessages((prev) => {
        const keyFor = (message) => message?._id || message?.id || `${message?.createdAt}:${message?.text || message?.content || ''}`;
        const byKey = new Map();
        prev.forEach((message) => byKey.set(keyFor(message), message));
        history.forEach((message) => byKey.set(keyFor(message), normalizeStatus(message)));

        const merged = Array.from(byKey.values()).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        seenIds.current = new Set(merged.map((message) => msgId(message)).filter(Boolean));
        historyLoadedRef.current = true;
        if (cacheKey) {
          conversationCache.set(cacheKey, merged);
        }
        markMessagesRead(merged);
        return merged;
      });
    };

    const onReceive = (payload) => {
      const message = extract(payload);
      if (!message) return;

      const id = msgId(message);
      if (id && seenIds.current.has(id)) return;

      const me = String(user?.id || '');
      const friendId = String(friend._id);
      const senderId = getId(message.sender);
      const receiverId = getId(message.receiver || message.recipient);
      if (!((senderId === me || receiverId === me) && (senderId === friendId || receiverId === friendId))) return;
      if (isMine(message)) return;

      const normalized = { ...message, read: true, status: 'received' };
      setMessages((prev) => {
        const next = [...prev, normalized];
        if (id) seenIds.current.add(id);
        if (cacheKey) {
          conversationCache.set(cacheKey, next);
        }
        return next;
      });

      if (id) {
        try {
          socketRef.current?.emit('message:read', { messageId: id });
        } catch {}
      }
    };

    const onSent = (payload) => {
      const message = extract(payload);
      const tempId = payload?.tempId;
      if (!message) return;

      setMessages((prev) => {
        let replaced = false;
        const next = prev.map((item) => {
          if (item._id === tempId) {
            replaced = true;
            return { ...message, status: message.read ? 'read' : 'delivered' };
          }
          return item;
        });

        if (!replaced) {
          const id = msgId(message);
          if (!(id && seenIds.current.has(id))) {
            next.push({ ...message, status: message.read ? 'read' : 'delivered' });
          }
          if (id) seenIds.current.add(id);
        }

        if (cacheKey) {
          conversationCache.set(cacheKey, next);
        }

        return next;
      });

      setErrorMessage('');
    };

    const onStatus = ({ messageId, status }) => {
      if (!messageId) return;
      setMessages((prev) => {
        const next = prev.map((message) => {
          if (msgId(message) === String(messageId)) {
            return { ...message, status, read: status === 'read' ? true : message.read };
          }
          return message;
        });
        if (cacheKey) conversationCache.set(cacheKey, next);
        return next;
      });
    };

    const onMessageError = ({ tempId, error }) => {
      setMessages((prev) => {
        const next = prev.map((message) => (
          message._id === tempId ? { ...message, status: 'failed' } : message
        ));
        if (cacheKey) conversationCache.set(cacheKey, next);
        return next;
      });
      setErrorMessage(error || 'Message failed to send');
    };

    const onTyping = ({ userId, typing: isTyping }) => {
      if (String(userId) !== String(friend._id)) return;
      setTyping(Boolean(isTyping));
    };

    const onFriendOnline = ({ userId, timestamp }) => {
      if (String(userId) !== String(friend._id)) return;
      setPresence({
        online: true,
        lastSeen: timestamp || new Date().toISOString(),
      });
    };

    const onFriendOffline = ({ userId, timestamp }) => {
      if (String(userId) !== String(friend._id)) return;
      setPresence({
        online: false,
        lastSeen: timestamp || new Date().toISOString(),
      });
    };

    socketRef.current.on('connect', onConnect);
    socketRef.current.on('messages_history', onHistory);
    socketRef.current.on('receive_message', onReceive);
    socketRef.current.on('message_sent', onSent);
    socketRef.current.on('message:status', onStatus);
    socketRef.current.on('message:error', onMessageError);
    socketRef.current.on('user_typing', onTyping);
    socketRef.current.on('friend:online', onFriendOnline);
    socketRef.current.on('friend:offline', onFriendOffline);
    socketRef.current.on('user_online', onFriendOnline);
    socketRef.current.on('user_offline', onFriendOffline);

    if (socketRef.current?.connected) {
      onConnect();
    }

    return () => {
      stopTyping();
      setTyping(false);
      try {
        socketRef.current?.off('connect', onConnect);
        socketRef.current?.off('messages_history', onHistory);
        socketRef.current?.off('receive_message', onReceive);
        socketRef.current?.off('message_sent', onSent);
        socketRef.current?.off('message:status', onStatus);
        socketRef.current?.off('message:error', onMessageError);
        socketRef.current?.off('user_typing', onTyping);
        socketRef.current?.off('friend:online', onFriendOnline);
        socketRef.current?.off('friend:offline', onFriendOffline);
        socketRef.current?.off('user_online', onFriendOnline);
        socketRef.current?.off('user_offline', onFriendOffline);
      } catch {}
    };
  }, [token, friend?._id, friend?.email, user?.email, user?.id, cacheKey]);

  const send = () => {
    if (!input.trim() && !attachedNote?.id) return;

    stopTyping();
    setErrorMessage('');

    const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tempText = input.trim() || `Shared note: ${attachedNote?.title || 'Study note'}`;
    const tempMessage = {
      _id: tempId,
      sender: user?.id,
      receiver: friend._id,
      text: tempText,
      content: tempText,
      status: 'sending',
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => {
      const next = [...prev, tempMessage];
      if (cacheKey) conversationCache.set(cacheKey, next);
      return next;
    });

    const payload = {
      receiverId: friend._id,
      content: input.trim() || `Sharing my note: ${attachedNote?.title || 'Study note'}`,
      noteId: attachedNote?.id && !attachedNote?.alreadyShared ? attachedNote.id : undefined,
      tempId,
    };

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', payload);
      } else {
        pendingQueueRef.current.push(payload);
        socketRef.current?.connect?.();
      }
    } catch {
      setErrorMessage('Could not send message');
    }

    setInput('');
    setAttachedNote(null);
  };

  const messageGroups = useMemo(() => {
    const groups = [];

    messages.forEach((message, index) => {
      const currentDate = new Date(message.createdAt || Date.now());
      const prev = messages[index - 1];
      const prevDate = prev ? new Date(prev.createdAt || Date.now()) : null;

      if (!prevDate || currentDate.toDateString() !== prevDate.toDateString()) {
        groups.push({
          type: 'separator',
          id: `separator-${currentDate.toDateString()}-${index}`,
          label: formatDayLabel(currentDate),
        });
      }

      const incoming = !isMine(message);
      const next = messages[index + 1];
      const currentMine = isMine(message);
      const prevSameSender = prev && isMine(prev) === currentMine && (currentDate - new Date(prev.createdAt || Date.now())) < 5 * 60 * 1000;
      const nextSameSender = next && isMine(next) === currentMine && (new Date(next.createdAt || Date.now()) - currentDate) < 5 * 60 * 1000;

      groups.push({
        type: 'message',
        id: message._id || message.id || `message-${index}`,
        message,
        incoming,
        compactTop: Boolean(prevSameSender),
        compactBottom: Boolean(nextSameSender),
      });
    });

    return groups;
  }, [messages, friend?._id]);

  return (
    <div className="relative flex h-full w-full flex-col bg-[linear-gradient(180deg,#f9f1e5_0%,#f5ecde_100%)]">
      <div className="z-10 flex shrink-0 items-center justify-between border-b border-[#eadfce] bg-white/85 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c99a6b_0%,#b88455_100%)] font-bold text-white shadow-[0_14px_30px_rgba(184,132,85,0.2)]">
              {(friend.name || friend.email)?.[0]?.toUpperCase()}
            </div>
            {presence.online && <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-white bg-[#7f9a5c]" />}
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold leading-tight text-[#2f2720]">{friend.name || friend.email}</h3>
            <span className="text-xs font-medium tracking-wide text-[#8a7b6c]">
              {typing ? 'typing...' : presence.online ? 'online now' : formatLastSeen(presence.lastSeen)}
            </span>
          </div>
        </div>
        <button
          className="rounded-xl border border-[#eadfce] bg-white p-2 text-[#8d6948] transition hover:border-[#c49a6c] hover:bg-[#fff6eb] lg:hidden"
          onClick={onClose}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(217,184,140,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(183,195,154,0.14),transparent_28%),linear-gradient(180deg,#f9f1e5_0%,#f5ecde_100%)] p-4 md:p-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-[#7d7267]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(122,92,56,0.08)]">
              <svg className="h-8 w-8 text-[#b88455]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium text-[#4f453b]">Start chatting with {friend.name || friend.email}.</p>
            <p className="mt-2 max-w-sm text-sm leading-6">
              Messages will appear here in a cleaner, WhatsApp-style thread with delivery states and quick context.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messageGroups.map((item) => {
              if (item.type === 'separator') {
                return (
                  <div key={item.id} className="flex justify-center py-3">
                    <span className="rounded-full border border-[#eadfce] bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b8d7d]">
                      {item.label}
                    </span>
                  </div>
                );
              }

              const { message, incoming, compactTop, compactBottom } = item;
              const time = new Date(message.createdAt || Date.now());
              const bubbleRadius = incoming
                ? `${compactTop ? 'rounded-tl-lg' : 'rounded-tl-[1.35rem]'} ${compactBottom ? 'rounded-bl-lg' : 'rounded-bl-[0.45rem]'} rounded-tr-[1.35rem] rounded-br-[1.35rem]`
                : `${compactTop ? 'rounded-tr-lg' : 'rounded-tr-[1.35rem]'} ${compactBottom ? 'rounded-br-lg' : 'rounded-br-[0.45rem]'} rounded-tl-[1.35rem] rounded-bl-[1.35rem]`;

              return (
                <div key={item.id} className={`flex ${incoming ? 'justify-start' : 'justify-end'} ${compactTop ? 'pt-0.5' : 'pt-3'}`}>
                  <div
                    className={`max-w-[84%] px-4 py-2.5 shadow-[0_12px_28px_rgba(122,92,56,0.08)] md:max-w-[68%] ${bubbleRadius} ${
                      incoming
                        ? 'border border-[#eadfce] bg-white text-[#3f362d]'
                        : 'bg-[linear-gradient(135deg,#d6a067_0%,#c78953_100%)] text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.content || message.text}</div>
                    <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-[11px] ${incoming ? 'text-[#9a8f84]' : 'text-white/90'}`}>
                      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!incoming && message.status === 'sending' && (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {!incoming && message.status === 'delivered' && (
                        <>
                          <span>Delivered</span>
                          <span className="flex -space-x-2">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </>
                      )}
                      {!incoming && message.status === 'read' && (
                        <>
                          <span className="text-[#eef8ff]">Seen</span>
                          <span className="flex -space-x-2 text-[#dff4ff]">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </>
                      )}
                      {!incoming && message.status === 'failed' && (
                        <>
                          <span className="text-[#fff0f0]">Failed</span>
                          <svg className="h-3.5 w-3.5 text-[#fff0f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} className="h-2" />
          </div>
        )}
      </div>

      <div className="z-10 shrink-0 border-t border-[#eadfce] bg-white/88 p-4 backdrop-blur-md">
        {errorMessage ? (
          <div className="mb-3 rounded-2xl border border-[#f0d4d4] bg-[#fff5f5] px-4 py-3 text-sm text-[#a35d5d]">
            {errorMessage}
          </div>
        ) : null}

        {attachedNote ? (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#dbe6cf] bg-[#f5faef] px-4 py-3 text-sm text-[#49613d]">
            <div className="min-w-0">
              <p className="font-semibold">Attached note</p>
              <p className="truncate text-[#5f8750]">{attachedNote.title}</p>
              <p className="text-xs text-[#6d8a60]">
                {attachedNote.alreadyShared ? 'Already shared. This message starts the discussion.' : 'Will be shared with this message.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAttachedNote(null)}
              className="rounded-lg p-2 text-[#5f8750] transition hover:bg-white hover:text-[#4e7442]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2 rounded-[1.6rem] border border-[#e7dac7] bg-[#fffdf9] p-2 transition focus-within:border-[#c49a6c] focus-within:ring-4 focus-within:ring-[#c49a6c]/15">
          <textarea
            className="max-h-32 min-h-[46px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#2f2720] placeholder:text-[#a2917f] focus:outline-none"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim()) {
                emitTyping();
              } else {
                stopTyping();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message"
            rows={1}
          />
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#b88455] text-white transition hover:bg-[#a97546] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={send}
            disabled={!input.trim() && !attachedNote?.id}
          >
            <svg className="h-5 w-5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
