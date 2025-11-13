import React, { useEffect, useState } from 'react';
import { api, setAuthToken } from '../../services/api';
import useAuth from '../../hooks/useAuth';

export default function FriendsFresh({ onStartChat }) {
  const { token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sendingIds, setSendingIds] = useState(new Set());
  const [sentIds, setSentIds] = useState(new Set());

  useEffect(() => { setAuthToken(token); }, [token]);

  const load = async () => {
    try { const r = await api.get('/friends/list'); setFriends(r.data || []); } catch { setFriends([]); }
    try { const r2 = await api.get('/friends/requests'); setRequests(r2.data || []); } catch { setRequests([]); }
  };

  useEffect(() => { if (token) load(); }, [token]);

  useEffect(() => {
    let t;
    if (query.trim()) {
      t = setTimeout(async () => {
        try { const r = await api.get(`/friends/search?q=${encodeURIComponent(query)}`); setResults(r.data.users || []); } catch { setResults([]); }
      }, 250);
    } else setResults([]);
    return () => clearTimeout(t);
  }, [query]);

  const send = async (id) => {
    try {
      // optimistic UI: mark as sending
      setSendingIds(prev => new Set(prev).add(id));
      const res = await api.post('/friends/send', { receiverId: id });
      // mark as sent for short period
      setSendingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      setSentIds(prev => new Set(prev).add(id));
      setTimeout(() => setSentIds(prev => { const s = new Set(prev); s.delete(id); return s; }), 3000);
      await load();
    } catch (e) {
      setSendingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      // show basic feedback
      alert('Failed to send friend request');
    }
  };
  const accept = async (id) => { try { await api.post('/friends/accept', { requestId: id }); load(); } catch {} };
  const decline = async (id) => { try { await api.post('/friends/decline', { requestId: id }); load(); } catch {} };

  return (
    <div className="w-80 bg-white shadow p-4 h-full">
      <h2 className="text-xl font-bold mb-3">Friends (fresh)</h2>

      <div className="mb-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email" className="w-full p-2 border rounded" />
        {results.length>0 && (
          <ul className="mt-2 max-h-48 overflow-y-auto">
            {results.map(u => (
              <li key={u._id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <div className="font-medium">{u.name || u.email}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="ml-2">
                  {sendingIds.has(u._id) ? (
                    <button disabled className="text-sm px-3 py-1 rounded bg-gray-300 text-gray-700">Sending...</button>
                  ) : sentIds.has(u._id) ? (
                    <span className="text-sm text-green-600">Sent</span>
                  ) : (
                    <button onClick={() => send(u._id)} className="text-sm bg-green-600 text-white px-3 py-1 rounded">Add</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-3">
        <h3 className="font-semibold">Requests</h3>
        <ul className="mt-2">
          {requests.map(r => (
            <li key={r._id} className="flex justify-between items-center py-1">
              <div>{r.requesterName || r.requesterEmail}</div>
              <div>
                <button onClick={() => accept(r._id)} className="text-green-600 mr-2">Accept</button>
                <button onClick={() => decline(r._id)} className="text-red-600">Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Friends</h3>
        <ul className="mt-2 max-h-64 overflow-y-auto">
          {friends.map(f => (
            <li key={f._id} className="flex justify-between items-center p-2 border-b cursor-pointer" onClick={() => onStartChat(f)}>
              <div>
                <div className="font-medium">{f.name || f.email}</div>
                <div className="text-xs text-gray-500">{f.email}</div>
              </div>
              <div className="text-xs text-gray-400">{f.online ? 'Online' : 'Offline'}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
