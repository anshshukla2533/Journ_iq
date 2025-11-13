import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import Notification from './models/Notification.js';

// Maps to track sockets and typing state
const userSockets = new Map(); // userId -> Set<Socket>
const typingState = new Map(); // conversationId -> Set<userId>

function addUserSocket(userId, socket) {
  const set = userSockets.get(userId) || new Set();
  set.add(socket);
  userSockets.set(userId, set);
}

function removeUserSocket(userId, socket) {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socket);
  if (set.size === 0) userSockets.delete(userId);
  else userSockets.set(userId, set);
}

function emitToUser(userId, event, data) {
  const set = userSockets.get(String(userId));
  if (!set) return;
  set.forEach(s => {
    try { s.emit(event, data); } catch (e) { /* ignore */ }
  });
}

function emitToUserWithLog(userId, event, data) {
  const set = userSockets.get(String(userId));
  if (!set || set.size === 0) {
    console.log(`emitToUser: no active sockets for user ${userId} (offline?)`);
    return;
  }
  set.forEach(s => {
    try { s.emit(event, data); } catch (e) { console.error('emitToUser error', e); }
  });
}

function normalizeMessageObject(msg) {
  // msg may be a Mongoose document or plain object. Convert to plain object.
  const m = (msg && msg.toObject) ? msg.toObject() : (msg || {});
  // Ensure both 'recipient' and legacy 'receiver' keys exist
  if (m.recipient && !m.receiver) {
    m.receiver = m.recipient;
  }
  if (m.receiver && !m.recipient) {
    m.recipient = m.receiver;
  }
  // Map server 'text' to frontend 'content' if needed
  if (m.text && !m.content) {
    m.content = m.text;
  }
  if (m.content && !m.text) {
    m.text = m.content;
  }
  return m;
}

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Simple auth middleware using JWT from handshake.auth.token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error('Invalid token'));
      const user = await User.findById(decoded.id).select('_id name email profilePic online');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      socket.userId = user._id.toString();
      return next();
    } catch (err) {
      console.error('Socket auth failed', err.message || err);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`Socket connected: ${socket.user?.name} (${userId})`);

    // Track socket
    addUserSocket(userId, socket);

    // Mark user online
    await User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() }).catch(() => {});

    // Notify friends / other interested parties (emit simple user_online)
    emitToUser(userId, 'user_online', { userId });

    // Handle fetch messages: client sends { friendId } or { conversationId }
    socket.on('fetch_messages', async (data) => {
      try {
        const friendId = data?.friendId;
        let conversationId = data?.conversationId;

        if (!conversationId && friendId) {
          // If frontend provided friendId, prefer computing the canonical conversationId from emails.
          if (friendId) {
            const me = await User.findById(userId).select('email');
            const friend = await User.findById(friendId).select('email');
            if (!friend) {
              socket.emit('messages_history', { success: false, error: 'User not found' });
              return;
            }
            conversationId = [String(me.email).toLowerCase(), String(friend.email).toLowerCase()].sort().join(':');
          } else if (!conversationId) {
            // If neither friendId nor conversationId present, error
            socket.emit('messages_history', { success: false, error: 'conversationId required' });
            return;
          }
        }


        let msgs = await Message.find({ conversationId, isDeleted: { $ne: true } })
          .populate('sender', 'name email _id')
          .populate('receiver', 'name email _id')
          .sort({ createdAt: 1 })
          .lean();

        msgs = msgs.map(m => normalizeMessageObject(m));

        socket.emit('messages_history', { success: true, conversationId, messages: msgs });
      } catch (err) {
        console.error('fetch_messages error', err);
        socket.emit('messages_history', { success: false, error: 'Server error' });
      }
    });

    // Join/leave conversation rooms (room name: conversation:<conversationId>)
    socket.on('join_conversation', (data) => {
      try {
        const conversationId = data?.conversationId;
        if (!conversationId) return;
        socket.join(`conversation:${conversationId}`);
        // Optionally acknowledge
        socket.emit('joined_conversation', { conversationId });
      } catch (err) {
        console.error('join_conversation error', err);
      }
    });

    socket.on('leave_conversation', (data) => {
      try {
        const conversationId = data?.conversationId;
        if (!conversationId) return;
        socket.leave(`conversation:${conversationId}`);
        socket.emit('left_conversation', { conversationId });
      } catch (err) {
        console.error('leave_conversation error', err);
      }
    });

    // Handle send_message from frontend
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, noteId, tempId } = data || {};
        if (!receiverId) return socket.emit('error', { message: 'receiverId required' });
        if (!content && !noteId) return socket.emit('error', { message: 'Empty message' });

        // Compute conversationId via emails to ensure uniqueness
        const me = await User.findById(userId).select('email name');
        const to = await User.findById(receiverId).select('email name');
        if (!to) return socket.emit('error', { message: 'Recipient not found' });
        const conversationId = [String(me.email).toLowerCase(), String(to.email).toLowerCase()].sort().join(':');

        // Create message document
        const message = await Message.create({
          conversationId,
          sender: userId,
          receiver: receiverId,
          senderEmail: me.email,
          receiverEmail: to.email,
          text: content || '',
          content: content || '',
          note: noteId || null,
          status: 'sent',
          createdAt: new Date()
        });

        await message.populate('sender', 'name email _id');
        await message.populate('receiver', 'name email _id');

  // Ensure sender joins the conversation room
  try { socket.join(`conversation:${conversationId}`); } catch (e) {}

  // Normalize message for transport
  const outMsg = normalizeMessageObject(message);

  // Emit to conversation room (for participants who joined the room)
  io.to(`conversation:${conversationId}`).emit('receive_message', { conversationId, message: outMsg });

  // Also notify recipient sockets directly (in case they didn't join the room)
  emitToUserWithLog(receiverId, 'receive_message', { conversationId, message: outMsg });

  // Confirm to sender (include tempId so client can replace)
  socket.emit('message_sent', { success: true, conversationId, message: outMsg, tempId });

        // Optionally create a notification document and emit it to recipient (include its id)
              try {
                const notif = await Notification.create({ user: receiverId, type: 'new_message', message: `New message from ${me.name}`, data: { senderId: userId, conversationId, text: content } });
                const notifObj = notif.toObject ? notif.toObject() : notif;
                emitToUserWithLog(receiverId, 'notification', notifObj);
              } catch (e) {
                // ignore notification errors
              }
      } catch (err) {
        console.error('send_message error', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Read receipt
    socket.on('message_read', async (data) => {
      try {
        const { messageId } = data || {};
        if (!messageId) return;
        const msg = await Message.findByIdAndUpdate(messageId, { isRead: true, readAt: new Date() }, { new: true }).lean();
        if (msg) {
          emitToUser(msg.sender.toString(), 'message_status_update', { messageId: msg._id, status: 'read', readAt: msg.readAt });
        }
      } catch (err) {
        console.error('message_read error', err);
      }
    });

    // Typing indicators (frontend uses typing_started / typing_stopped)
    socket.on('typing_started', (data) => {
      try {
        const { receiverId } = data || {};
        if (!receiverId) return;
        emitToUser(receiverId, 'user_typing', { userId, userName: socket.user?.name });
      } catch (err) { console.error('typing_started', err); }
    });

    socket.on('typing_stopped', (data) => {
      try {
        const { receiverId } = data || {};
        if (!receiverId) return;
        emitToUser(receiverId, 'user_stopped_typing', { userId });
      } catch (err) { console.error('typing_stopped', err); }
    });

    // Call-related events (simple passthrough)
    socket.on('call_user', (data) => {
      const { receiverId, callType } = data || {};
      if (!receiverId) return;
      emitToUser(receiverId, 'incoming_call', { from: userId, callType });
    });

    socket.on('accept_call', (data) => {
      const { callerId } = data || {};
      if (!callerId) return;
      emitToUser(callerId, 'call_accepted', { from: userId });
    });

    socket.on('reject_call', (data) => {
      const { callerId } = data || {};
      if (!callerId) return;
      emitToUser(callerId, 'call_rejected', { from: userId });
    });

    socket.on('end_call', (data) => {
      const { peerId } = data || {};
      if (!peerId) return;
      emitToUser(peerId, 'call_ended', { from: userId });
    });

    socket.on('disconnect', async () => {
      try {
        removeUserSocket(userId, socket);

        // If user has no more sockets, mark offline
        if (!userSockets.has(userId)) {
          await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() }).catch(() => {});
          // notify others if needed
          emitToUser(userId, 'user_offline', { userId, lastSeen: new Date() });
        }
      } catch (err) {
        console.error('disconnect handler error', err);
      }
    });
  });

  return io;
}