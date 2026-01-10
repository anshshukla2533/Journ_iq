import React, { useEffect, useState } from 'react';
import { api, setAuthToken } from '../../services/api';
import useAuth from '../../hooks/useAuth';

export default function SearchPanel({ onOpenChat }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [notesResults, setNotesResults] = useState([]);
  const [friendsResults, setFriendsResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!query.trim()) {
      setNotesResults([]);
      setFriendsResults([]);
      setInfo('');
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('searching');
      setInfo('');
      const encoded = encodeURIComponent(query.trim());

      try {
        const [notesRes, friendsRes] = await Promise.all([
          api.get(`/notes/search?q=${encoded}`, { signal: controller.signal }),
          api.get(`/friends/search?q=${encoded}`, { signal: controller.signal })
        ]);

        const notes = Array.isArray(notesRes.data?.data) ? notesRes.data.data : [];
        const friends = Array.isArray(friendsRes.data?.users) ? friendsRes.data.users : [];
        setNotesResults(notes);
        setFriendsResults(friends);

        if (!notes.length && !friends.length) {
          setInfo(`No matches found for "${query.trim()}"`);
          setStatus('empty');
        } else {
          setInfo('');
          setStatus('ready');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Search failed', error);
        setStatus('error');
        setInfo('Unable to load search results right now.');
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, token]);

  const renderNote = (note) => (
    <div key={note._id} className="border border-gray-100 rounded-lg bg-gray-50 p-4 space-y-2">
      <div className="text-gray-600 text-xs uppercase tracking-wide">Note</div>
      <p className="text-gray-800 font-medium" data-testid="note-text">
        {note.text?.length > 160 ? `${note.text.slice(0, 160)}…` : note.text}
      </p>
      <div className="text-gray-500 text-xs">{new Date(note.createdAt).toLocaleString()}</div>
    </div>
  );

  const handleAddFriend = async (friendId, friendEmail) => {
    try {
      setLoading(prev => ({ ...prev, [friendId]: true }));
      const response = await api.post('/friends/send', { receiverId: friendId });
      
      if (response.data?.request?._id) {
        setSentRequests(prev => new Set([...prev, friendId]));
        setInfo(`Friend request sent to ${friendEmail}!`);
        setTimeout(() => setInfo(''), 3000);
      }
    } catch (error) {
      console.error('Failed to send friend request', error);
      setInfo(error.response?.data?.message || 'Failed to send friend request');
    } finally {
      setLoading(prev => ({ ...prev, [friendId]: false }));
    }
  };

  const renderFriend = (friend) => (
    <div key={friend._id} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate">{friend.name || friend.email}</p>
          <p className="text-xs text-gray-500 truncate">{friend.email}</p>
        </div>
        <span className={`text-xs font-semibold ${friend.online ? 'text-green-600' : 'text-gray-400'}`}>
          {friend.online ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onOpenChat?.(friend)}
          className="flex-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
        >
          {friend.online ? 'Open chat' : 'View'
          }
        </button>
        <button
          onClick={() => handleAddFriend(friend._id, friend.email)}
          disabled={sentRequests.has(friend._id) || loading[friend._id]}
          className={`flex-1 text-sm font-semibold px-3 py-2 rounded-lg transition ${
            sentRequests.has(friend._id)
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {loading[friend._id] ? 'Adding...' : sentRequests.has(friend._id) ? 'Request Sent' : 'Add Friend'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label htmlFor="global-search" className="text-sm font-medium text-gray-700">Search</label>
        <div className="relative">
          <input
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, friends, or content..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Press “Enter” to refresh</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">Enter your search query above to find content across JournIQ</p>

      {status === 'searching' && <p className="text-sm text-blue-600">Searching...</p>}
      {info && <p className="text-sm text-gray-500 italic">{info}</p>}

      {(notesResults.length || friendsResults.length) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <span className="text-xs text-gray-500">{notesResults.length} found</span>
            </div>
            <div className="space-y-3">
              {notesResults.map(renderNote)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Friends</h3>
              <span className="text-xs text-gray-500">{friendsResults.length} found</span>
            </div>
            <div className="space-y-3">
              {friendsResults.map(renderFriend)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
