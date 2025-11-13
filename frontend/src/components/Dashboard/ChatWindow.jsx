
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createSocket } from '../../services/socket';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';
import IncomingCallModal from './IncomingCallModal';
import CallOverlay from './CallOverlay';

const ChatWindow = ({ friend, onClose }) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState('');
  const [friendProfile, setFriendProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null); // { from, callType }
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerRef = useRef(null);

    useEffect(() => {
      fetchMessages();
      fetchNotes();
      fetchFriendProfile();
      if (token && friend?._id) {
        socketRef.current = createSocket(token);

        // Helper to extract message object whether server sends raw message or wrapper { conversationId, message }
        const extractMessage = (payload) => {
          if (!payload) return null;
          if (payload.message) return payload.message;
          return payload;
        };

        socketRef.current.on('receive_message', (payload) => {
          const msg = extractMessage(payload);
          if (!msg) return;
          // Accept both recipient/receiver shapes and compare ids as strings
          const senderId = String(msg.sender || (msg.sender && msg.sender._id) || '');
          const receiverId = String(msg.receiver || msg.recipient || (msg.recipient && msg.recipient._id) || '');
          if (senderId === String(friend._id) || receiverId === String(friend._id)) {
            setMessages((prev) => [...prev, msg]);
          }
        });

        socketRef.current.on('message_sent', (payload) => {
          // payload may be { success, conversationId, message, tempId }
          const msg = extractMessage(payload);
          const tempId = payload?.tempId;
          if (!msg) return;
          const receiverId = String(msg.receiver || msg.recipient || (msg.recipient && msg.recipient._id) || '');

          // If the sender had created a temp message, replace it (otherwise append)
          if (tempId) {
            setMessages(prev => {
              let replaced = false;
              const next = prev.map(m => {
                if (m._id === tempId) {
                  replaced = true;
                  return msg;
                }
                return m;
              });
              if (!replaced) next.push(msg);
              return next;
            });
          } else if (receiverId === String(friend._id) || String(msg.sender) === String(friend._id)) {
            setMessages(prev => [...prev, msg]);
          }
        });
        socketRef.current.on('message_read', ({ messageId }) => {
          setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, status: 'read' } : m));
        });
        socketRef.current.on('user_online', ({ userId }) => {
          if (userId === friend._id) setIsOnline(true);
        });
        socketRef.current.on('user_offline', ({ userId, lastSeen }) => {
          if (userId === friend._id) {
            setIsOnline(false);
            setLastSeen(lastSeen);
          }
        });
        socketRef.current.on('incoming_call', ({ from, callType }) => {
          setIncomingCall({ from, callType });
        });
        socketRef.current.on('call_accepted', async ({ from }) => {
          setCallActive(true);
          setCallStatus('Call started');
          await startMedia(callType || 'video');
          createOffer();
        });
        socketRef.current.on('call_rejected', () => {
          setCallStatus('Call rejected');
          endCall();
        });
        socketRef.current.on('call_ended', () => {
          setCallStatus('Call ended');
          endCall();
        });
        socketRef.current.on('webrtc_offer', async ({ sdp }) => {
          await startMedia(incomingCall?.callType || 'video');
          await createAnswer(sdp);
        });
        socketRef.current.on('webrtc_answer', async ({ sdp }) => {
          if (peerRef.current) await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        });
        socketRef.current.on('webrtc_ice', async ({ candidate }) => {
          if (peerRef.current && candidate) await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });
      }
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
      // eslint-disable-next-line
    }, [token, friend?._id]);

    useEffect(() => {
      if (socketRef.current && messages.length > 0) {
        messages.forEach(msg => {
          if (msg.receiver === user?.id && msg.status !== 'read') {
            socketRef.current.emit('read_message', { messageId: msg._id });
          }
        });
      }
    }, [messages]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchFriendProfile = async () => {
      if (!friend?._id) return;
      try {
        const res = await axios.get(`/api/friends/profile/${friend._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriendProfile(res.data);
        setIsOnline(!!res.data.online);
        setLastSeen(res.data.lastLogin || res.data.lastSeen);
      } catch {
        setFriendProfile(null);
      }
    };

    const fetchMessages = async () => {
      if (!friend?._id) return;
      const res = await axios.get(`/api/messages/${friend._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    };

    const fetchNotes = async () => {
      if (!token) return;
      try {
        const res = await notesService.getNotes(token);
        if (res.success) setNotes(res.data || []);
        else setNotes([]);
      } catch (err) {
        console.error('Failed to fetch notes:', err);
        setNotes([]);
      }
    };

    const sendMessage = () => {
      if (!input.trim() && !selectedNote) return;
      setSending(true);

      // create a temp id for optimistic UI
      const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const tempMsg = {
        _id: tempId,
        sender: user?.id,
        receiver: friend._id,
        content: input,
        note: selectedNote ? { _id: selectedNote } : null,
        status: 'sending',
        createdAt: new Date().toISOString()
      };

      // Optimistically show the message
      setMessages(prev => [...prev, tempMsg]);

      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          receiverId: friend._id,
          content: input,
          noteId: selectedNote || undefined,
          tempId
        });
      }

      setInput('');
      setSelectedNote('');
      setSending(false);
    };

    const handleCall = async (type) => {
      setCallType(type);
      setCallStatus('Calling...');
      setCallActive(true);
      await startMedia(type);
      if (socketRef.current && friend?._id) {
        socketRef.current.emit('call_user', {
          receiverId: friend._id,
          callType: type
        });
      }
    };

    const handleAcceptCall = async () => {
      if (socketRef.current && incomingCall) {
        setCallType(incomingCall.callType);
        setCallStatus('Connecting...');
        setCallActive(true);
        await startMedia(incomingCall.callType);
        socketRef.current.emit('accept_call', { callerId: incomingCall.from });
        setIncomingCall(null);
      }
    };
    const handleRejectCall = () => {
      if (socketRef.current && incomingCall) {
        socketRef.current.emit('reject_call', { callerId: incomingCall.from });
        setIncomingCall(null);
      }
    };

    const endCall = () => {
      setCallActive(false);
      setCallType(null);
      setCallStatus('');
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setRemoteStream(null);
      if (socketRef.current && friend?._id) {
        socketRef.current.emit('end_call', { peerId: friend._id });
      }
    };

    // WebRTC logic
    const startMedia = async (type) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(type === 'video' ? { video: true, audio: true } : { audio: true });
        setLocalStream(stream);
        if (!peerRef.current) createPeer(type);
        stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));
      } catch (err) {
        setCallStatus('Could not access media devices');
      }
    };

    const createPeer = (type) => {
      peerRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerRef.current.onicecandidate = (e) => {
        if (e.candidate && socketRef.current && friend?._id) {
          socketRef.current.emit('webrtc_ice', { candidate: e.candidate, peerId: friend._id });
        }
      };
      peerRef.current.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };
    };

    const createOffer = async () => {
      if (!peerRef.current) createPeer(callType);
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      if (socketRef.current && friend?._id) {
        socketRef.current.emit('webrtc_offer', { sdp: offer, peerId: friend._id });
      }
    };

    const createAnswer = async (remoteSdp) => {
      if (!peerRef.current) createPeer(callType);
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      if (socketRef.current && friend?._id) {
        socketRef.current.emit('webrtc_answer', { sdp: answer, peerId: friend._id });
      }
    };

    return (
      <>
        {incomingCall && !callActive && (
          <IncomingCallModal
            caller={friendProfile}
            callType={incomingCall.callType}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}
        {callActive && (
          <CallOverlay
            callType={callType}
            onEnd={endCall}
            remoteStream={remoteStream}
            localStream={localStream}
            status={callStatus}
          />
        )}
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-200 shadow-2xl z-[300] flex flex-col">
          {/* Profile Section */}
          <div className="p-4 border-b flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold">
                {friendProfile?.name?.charAt(0).toUpperCase() || friend.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-lg">{friendProfile?.name || friend.name}</div>
                <div className="text-xs text-gray-500">
                  {isOnline ? (
                    <span className="text-green-600 font-semibold">Online</span>
                  ) : lastSeen ? (
                    <span>Last seen: {new Date(lastSeen).toLocaleString()}</span>
                  ) : (
                    <span>Offline</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-blue-100"
                title="Video Call"
                onClick={() => handleCall('video')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15m3-6v6m0 0l-3-3m3 3l-3 3" />
                </svg>
              </button>
              <button
                className="p-2 rounded-full hover:bg-green-100"
                title="Audio Call"
                onClick={() => handleCall('audio')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m0 0l3-3m-3 3l-3-3m9 6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="text-red-500 ml-2" onClick={onClose}>Close</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map(msg => (
              <div key={msg._id} className={`mb-2 flex ${msg.sender === friend._id ? 'justify-start' : 'justify-end'}`}>
                <div className={`px-4 py-2 rounded-lg ${msg.sender === friend._id ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}
                     style={{ position: 'relative', minWidth: '80px' }}>
                  <div>{msg.content}</div>
                  {msg.note && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded text-gray-800">
                      <div className="font-semibold">Shared Note:</div>
                      <div>{msg.note.text}</div>
                    </div>
                  )}
                  {/* Message status for sender only */}
                  {msg.sender === user.id && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1" style={{ float: 'right' }}>
                      {msg.status === 'read' ? (
                        <span title="Read" className="text-red-400 font-bold">✔✔</span>
                      ) : msg.status === 'delivered' ? (
                        <span title="Delivered">✔✔</span>
                      ) : (
                        <span title="Sent">✔</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={sending}
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={sendMessage}
                disabled={sending || (!input.trim() && !selectedNote)}
              >
                Send
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Share a Note:</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedNote}
                onChange={e => setSelectedNote(e.target.value)}
                disabled={sending}
              >
                <option value="">Select a note...</option>
                {notes.map(note => (
                  <option key={note._id} value={note._id}>{note.text.slice(0, 40)}...</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </>
    );
}

export default ChatWindow;