import React, { useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { createSocket, getSocket } from '../../services/socket';

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

const Friends = ({ onStartChat, onFriendsLoaded }) => {
  const { token, user } = useAuth();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState('');
  const [requestFeedback, setRequestFeedback] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [recentMessages, setRecentMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const loadFriends = async () => {
    setFriendsLoading(true);
    try {
      const r = await api.get('/friends/list');
      setFriends(r.data || []);
    } catch {
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const r = await api.get('/friends/requests');
      setRequests(r.data || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    if (token) {
      loadFriends();
      loadRequests();
    }
  }, [token]);

  useEffect(() => {
    const syncLocalChatState = () => {
      try {
        setUnreadCounts(JSON.parse(localStorage.getItem('chatUnreadCounts') || '{}'));
        setRecentMessages(JSON.parse(localStorage.getItem('chatRecents') || '{}'));
      } catch {
        setUnreadCounts({});
        setRecentMessages({});
      }
    };

    syncLocalChatState();
    window.addEventListener('storage', syncLocalChatState);
    return () => window.removeEventListener('storage', syncLocalChatState);
  }, []);

  useEffect(() => {
    if (!token) return;

    const socket = createSocket(token) || getSocket();
    if (!socket) return;

    const handleOnline = ({ userId, timestamp }) => {
      setFriends((prev) =>
        prev.map((friend) =>
          String(friend.id || friend._id) === String(userId)
            ? { ...friend, online: true, lastLogin: timestamp || new Date().toISOString() }
            : friend
        )
      );
    };

    const handleOffline = ({ userId, timestamp }) => {
      setFriends((prev) =>
        prev.map((friend) =>
          String(friend.id || friend._id) === String(userId)
            ? { ...friend, online: false, lastLogin: timestamp || new Date().toISOString() }
            : friend
        )
      );
    };

    const handleTyping = ({ userId, typing }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (typing) {
          next[String(userId)] = true;
        } else {
          delete next[String(userId)];
        }
        return next;
      });
    };

    socket.on('friend:online', handleOnline);
    socket.on('friend:offline', handleOffline);
    socket.on('user_online', handleOnline);
    socket.on('user_offline', handleOffline);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('friend:online', handleOnline);
      socket.off('friend:offline', handleOffline);
      socket.off('user_online', handleOnline);
      socket.off('user_offline', handleOffline);
      socket.off('user_typing', handleTyping);
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setSearching(true);
      try {
        const r = await api.get(`/friends/search?q=${encodeURIComponent(query)}`);
        if (!cancelled) {
          setResults(r.data?.users || []);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    };

    const t = setTimeout(run, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const sendRequest = async (email) => {
    setRequestFeedback(null);
    setSendingTo(email);
    try {
      const response = await api.post('/friends/request', { receiverEmail: email });
      await loadRequests();
      setRequestFeedback({
        type: 'success',
        message: response.data?.message || `Request sent to ${email}`,
      });
    } catch (error) {
      setRequestFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Could not send friend request',
      });
    } finally {
      setSendingTo('');
    }
  };

  const accept = async (id) => {
    try {
      await api.post('/friends/accept', { requestId: id });
      loadFriends();
      loadRequests();
    } catch {}
  };

  const decline = async (id) => {
    try {
      await api.post('/friends/decline', { requestId: id });
      loadRequests();
    } catch {}
  };

  const uniqueFriends = useMemo(() => {
    const map = new Map();
    (friends || []).forEach(f => {
      const email = (f?.email || '').toLowerCase();
      if (!map.has(email)) {
        map.set(email, f);
      }
    });
    return Array.from(map.values());
  }, [friends]);

  const sortedFriends = useMemo(
    () =>
      uniqueFriends
        .slice()
        .sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0) || (a.name || '').localeCompare(b.name || '')),
    [uniqueFriends]
  );

  const pendingRequestEmails = useMemo(
    () => new Set((requests || []).map((request) => String(request?.senderEmail || '').toLowerCase())),
    [requests]
  );

  const friendEmails = useMemo(
    () => new Set(sortedFriends.map((friend) => String(friend?.email || '').toLowerCase())),
    [sortedFriends]
  );

  const visibleResults = useMemo(() => {
    const currentUserEmail = String(user?.email || '').toLowerCase();

    return results.filter((candidate) => {
      const candidateEmail = String(candidate?.email || '').toLowerCase();
      return candidateEmail && candidateEmail !== currentUserEmail;
    });
  }, [results, user?.email]);

  useEffect(() => {
    if (typeof onFriendsLoaded === 'function') {
      onFriendsLoaded(sortedFriends, friendsLoading);
    }
  }, [sortedFriends, friendsLoading, onFriendsLoaded]);

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">People</p>
        <h3 className="mt-2 font-['Sora'] text-xl font-semibold text-[#2f2720]">Friends and requests</h3>
        <p className="mt-2 text-sm leading-6 text-[#776d62]">
          Search anyone, accept requests, and jump into focused conversations.
        </p>
      </div>

      <div className="relative mb-5">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users by name or email"
          className="w-full rounded-2xl border border-[#e7dac7] bg-[#fffdf9] py-3 pl-11 pr-4 text-sm text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a68d74]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
        {requestFeedback ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              requestFeedback.type === 'success'
                ? 'border-[#dbe6cf] bg-[#f5faef] text-[#5f8750]'
                : 'border-[#f0d4d4] bg-[#fff5f5] text-[#a35d5d]'
            }`}
          >
            {requestFeedback.message}
          </div>
        ) : null}

        {!!query && (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">Search Results</h3>
            {searching ? (
              <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-[#efe5d7] bg-[#fffcf8] p-3">
                <div className="h-10 w-10 rounded-full bg-[#f1e7d7]" />
                <div className="h-10 flex-1 rounded-xl bg-[#f1e7d7]" />
              </div>
            ) : (
              <ul className="space-y-2">
                {visibleResults.map(u => {
                  const candidateEmail = String(u.email || '').toLowerCase();
                  const isAlreadyFriend = friendEmails.has(candidateEmail);
                  const hasPendingRequest = pendingRequestEmails.has(candidateEmail);
                  const isSending = sendingTo === u.email;

                  return (
                    <li
                      key={(u.email || '') + '-' + (u._id || '')}
                      className="flex items-center justify-between rounded-2xl border border-[#efe5d7] bg-[#fffcf8] p-3 transition hover:border-[#dbc3a4] hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c99a6b_0%,#b88455_100%)] text-sm font-bold text-white shadow-[0_12px_25px_rgba(184,132,85,0.2)]">
                          {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#2f2720]">{u.name || u.email}</span>
                          <span className="w-32 truncate text-xs text-[#8d8174]">
                            {u.username ? `${u.username} - ${u.email}` : u.email}
                          </span>
                        </div>
                      </div>
                      {isAlreadyFriend ? (
                        <span className="rounded-xl border border-[#dbe6cf] bg-[#f5faef] px-3 py-2 text-xs font-semibold text-[#5f8750]">
                          Friends
                        </span>
                      ) : hasPendingRequest ? (
                        <span className="rounded-xl border border-[#efe5d7] bg-white px-3 py-2 text-xs font-semibold text-[#8d6948]">
                          Pending
                        </span>
                      ) : (
                        <button
                          className="rounded-xl bg-[#b88455] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#a97546] disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => sendRequest(u.email)}
                          disabled={isSending}
                        >
                          {isSending ? 'Sending...' : 'Add'}
                        </button>
                      )}
                    </li>
                  );
                })}
                {visibleResults.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf9] py-4 text-center text-sm text-[#8e8275]">
                    No users found
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        {requests.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">
              <span className="h-2 w-2 rounded-full bg-[#c49a6c]" />
              Pending Requests
            </h3>
            <ul className="space-y-2">
              {requests.map(r => (
                <li key={r._id} className="flex flex-col gap-2 rounded-2xl border border-[#eadfce] bg-[linear-gradient(180deg,#fffdf8_0%,#f8f1e6_100%)] p-4">
                  <span className="text-sm font-semibold text-[#2f2720]">{r.senderEmail}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      className="flex-1 rounded-xl bg-[#7f9a5c] py-2 text-xs font-semibold text-white transition hover:bg-[#718c4f]"
                      onClick={() => accept(r._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 rounded-xl border border-[#e6cfc2] bg-white py-2 text-xs font-semibold text-[#9d6d5e] transition hover:bg-[#fff6f1]"
                      onClick={() => decline(r._id)}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">All Friends ({sortedFriends.length})</h3>
          <ul className="space-y-2">
            {friendsLoading && (
              <>
                <li className="animate-pulse rounded-2xl border border-[#efe5d7] bg-[#fffcf8] p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f1e7d7]" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-[#f1e7d7]" />
                      <div className="h-3 w-32 rounded bg-[#f5ecde]" />
                    </div>
                  </div>
                </li>
                <li className="animate-pulse rounded-2xl border border-[#efe5d7] bg-[#fffcf8] p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f1e7d7]" />
                    <div className="space-y-2">
                      <div className="h-3 w-20 rounded bg-[#f1e7d7]" />
                      <div className="h-3 w-28 rounded bg-[#f5ecde]" />
                    </div>
                  </div>
                </li>
              </>
            )}
            {sortedFriends.map(f => (
              <li
                key={(f.email || '') + '-' + (f._id || '')}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-transparent bg-white/50 p-3 transition hover:border-[#dbc3a4] hover:bg-white hover:shadow-[0_12px_30px_rgba(122,92,56,0.08)]"
                onClick={() => {
                  try {
                    const key = 'chatUnreadCounts';
                    const next = JSON.parse(localStorage.getItem(key) || '{}');
                    delete next[String(f.id || f._id)];
                    localStorage.setItem(key, JSON.stringify(next));
                    setUnreadCounts(next);
                    window.dispatchEvent(new Event('storage'));
                  } catch {}
                  onStartChat(f);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6d6c3] bg-[#f7f1e7] font-bold text-[#7a6857] transition group-hover:border-[#d2b08a] group-hover:bg-[#fff6eb] group-hover:text-[#8d6948]">
                      {(f.name || f.email)?.[0]?.toUpperCase()}
                    </div>
                    {f.online && <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-white bg-[#7f9a5c]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#2f2720]">{f.name || f.email}</span>
                    <span className="w-40 truncate text-xs text-[#8d8174]">
                      {typingUsers[String(f.id || f._id)]
                        ? 'typing...'
                        : recentMessages[String(f.id || f._id)]?.lastText || (f.online ? 'Online now' : formatLastSeen(f.lastLogin))}
                    </span>
                  </div>
                </div>
                {unreadCounts[String(f.id || f._id)] ? (
                  <div className="flex min-w-6 items-center justify-center rounded-full bg-[#7f9a5c] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
                    {unreadCounts[String(f.id || f._id)]}
                  </div>
                ) : (
                  <div className="text-[#b88455] opacity-0 transition group-hover:opacity-100">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                )}
              </li>
            ))}
            {!friendsLoading && sortedFriends.length === 0 && (
              <li className="mt-2 rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf9] py-6 text-center text-sm text-[#8e8275]">
                <div className="mb-2 text-lg text-[#b88455]">+</div>
                No friends yet
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Friends;
