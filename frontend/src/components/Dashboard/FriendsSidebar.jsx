
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const FriendsSidebar = ({ onStartChat, onShareNote }) => {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);


  const { token } = useAuth();

  // Helper to get auth headers
  const authHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (token) {
      fetchFriends();
      fetchOnlineFriends();
      fetchRequests();
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (search.trim().length > 0 && token) {
      setSearching(true);
      axios.get(`/api/friends/search?query=${encodeURIComponent(search)}`, authHeaders())
        .then(res => setUserResults(res.data.users || []))
        .finally(() => setSearching(false));
    } else {
      setUserResults([]);
    }
  }, [search, token]);

  const handleSendRequest = async (userId) => {
    await axios.post('/api/friends/send', { recipientId: userId }, authHeaders());
    alert('Friend request sent!');
  };

  const handleShowProfile = async (userId) => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`/api/friends/profile/${userId}`, authHeaders());
      setProfileUser(res.data);
    } catch {
      setProfileUser(null);
    }
    setProfileLoading(false);
  };

  const fetchFriends = async () => {
    const res = await axios.get('/api/friends/list', authHeaders());
    setFriends(res.data);
  };

  const fetchOnlineFriends = async () => {
    const res = await axios.get('/api/friends/online', authHeaders());
    setOnlineFriends(res.data);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/friends/requests', authHeaders());
      setRequests(res.data);
    } catch {
      setRequests([]);
    }
  };

  const handleAccept = async (id) => {
    await axios.post('/api/friends/accept', { requestId: id }, authHeaders());
    fetchFriends();
    fetchRequests();
  };

  const handleDecline = async (id) => {
    await axios.post('/api/friends/decline', { requestId: id }, authHeaders());
    fetchRequests();
  };

  return (
    <div className="w-80 bg-white shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-2 p-2 border rounded w-full"
      />
      {search.trim().length >= 2 && (
        <div className="mb-4">
          <h3 className="font-semibold">Search Results</h3>
          {searching ? (
            <div>Searching...</div>
          ) : (
            <ul>
              {userResults.map(user => (
                <li key={user._id} className="flex items-center justify-between py-1">
                  <span className="cursor-pointer text-blue-700 hover:underline" onClick={() => handleShowProfile(user._id)}>{user.name}</span>
                  <span className="text-xs text-gray-500">({user.email})</span>
                  <button className="ml-2 text-green-600" onClick={() => handleSendRequest(user._id)}>Add Friend</button>
                </li>
              ))}
      {/* User Profile Modal */}
      {profileUser && (
        <div className="fixed inset-0 z-[300] bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 w-96 relative flex flex-col items-center">
            <button className="absolute top-2 right-2 text-red-500 text-2xl" onClick={() => setProfileUser(null)}>×</button>
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-4xl">
              <span>{profileUser.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">{profileUser.name}</h2>
            <p className="text-gray-600 mb-2 text-center">{profileUser.email}</p>
            <div className="mb-2 text-center">
              <span className="font-semibold">Friends:</span> {profileUser.friends.length}
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Shared Notes:</span> {profileUser.sharedNotes.length}
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Joined:</span> {new Date(profileUser.createdAt).toLocaleDateString()}
            </div>
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              onClick={() => { handleSendRequest(profileUser._id); setProfileUser(null); }}
            >
              Add Friend
            </button>
            <div className="mt-4 w-full">
              <h3 className="font-semibold mb-1">Notes:</h3>
              <ul className="max-h-32 overflow-y-auto text-sm">
                {profileUser.sharedNotes.map(note => (
                  <li key={note._id} className="mb-1 p-2 bg-gray-100 rounded">{note.text}</li>
                ))}
                {profileUser.sharedNotes.length === 0 && <li className="text-gray-400">No shared notes.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
              {userResults.length === 0 && <li className="text-gray-500">No users found.</li>}
            </ul>
          )}
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-semibold">Online Friends</h3>
        <ul>
          {onlineFriends.map(friend => (
            <li key={friend._id} className="flex items-center justify-between py-1">
              <span>{friend.name}</span>
              <span className="text-green-500">●</span>
              <button className="ml-2 text-blue-500" onClick={() => onStartChat(friend)}>Chat</button>
              <button className="ml-2 text-purple-500" onClick={() => onShareNote(friend)}>Share Note</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">All Friends</h3>
        <ul>
          {friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(friend => (
            <li key={friend._id} className="flex items-center justify-between py-1">
              <span>{friend.name}</span>
              {friend.online && <span className="text-green-500">●</span>}
              <button className="ml-2 text-blue-500" onClick={() => onStartChat(friend)}>Chat</button>
              <button className="ml-2 text-purple-500" onClick={() => onShareNote(friend)}>Share Note</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Friend Requests</h3>
        <ul>
          {requests.map(req => (
            <li key={req._id} className="flex items-center justify-between py-1">
              <span>{req.requesterName}</span>
              <button className="ml-2 text-green-500" onClick={() => handleAccept(req._id)}>Accept</button>
              <button className="ml-2 text-red-500" onClick={() => handleDecline(req._id)}>Decline</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendsSidebar;
