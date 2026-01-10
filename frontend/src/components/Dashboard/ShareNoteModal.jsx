import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { api, setAuthToken } from '../../services/api';
import notesService from '../../services/notesService';

export default function ShareNoteModal({ note, isOpen, onClose, onShared }) {
  const { token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState({});
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [shared, setShared] = useState(new Set());
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      const response = await api.get('/friends/list');
      const friendsList = Array.isArray(response.data?.friends) 
        ? response.data.friends 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      setFriends(friendsList);
      setFilteredFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends', error);
      setMessage('Failed to load friends');
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setFilteredFriends(friends);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      const filtered = friends.filter(friend =>
        friend.name?.toLowerCase().includes(query.toLowerCase()) ||
        friend.email?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFriends(filtered);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, friends]);

  const handleShareWithFriend = async (friendId, friendEmail) => {
    // Prevent sharing with same person twice
    if (shared.has(friendId)) {
      setMessage('Already shared with this friend');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [friendId]: true }));
      const response = await notesService.shareNote(token, note._id, friendId);

      if (response.success) {
        setShared(prev => new Set([...prev, friendId]));
        setMessage(`✓ Note shared with ${friendEmail}! They'll receive a notification.`);
        setTimeout(() => setMessage(''), 3000);
        
        if (typeof onShared === 'function') {
          onShared(friendId);
        }
      } else {
        setMessage(response.message || 'Failed to share note');
      }
    } catch (error) {
      console.error('Error sharing note', error);
      setMessage('Error sharing note. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [friendId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Share Note</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Note Preview */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4 max-h-24 overflow-y-auto">
          <p className="text-sm text-gray-700">
            {note?.text?.slice(0, 100)}
            {note?.text?.length > 100 ? '...' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search friends by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`text-sm p-2 rounded mb-4 ${
            message.includes('shared') || message.includes('notification')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Friends List */}
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {searching ? (
            <p className="text-sm text-gray-500 text-center py-2">Searching...</p>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
              <div
                key={friend._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {friend.name || friend.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                </div>
                <button
                  onClick={() => handleShareWithFriend(friend._id, friend.email)}
                  disabled={loading[friend._id] || shared.has(friend._id)}
                  className={`ml-2 px-3 py-1 rounded text-sm font-semibold transition whitespace-nowrap ${
                    shared.has(friend._id)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading[friend._id] ? 'Sharing...' : shared.has(friend._id) ? '✓ Shared' : 'Share'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {query ? 'No friends found matching your search' : 'No friends added yet'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
