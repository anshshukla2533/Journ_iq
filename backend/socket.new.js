import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import Friend from './models/Friend.js';
import Notification from './models/Notification.js';

// Store active connections and their states
const onlineUsers = new Map(); // socketId -> { userId, userName, socket }
const userSockets = new Map(); // userId -> Set of socketIds
const typingUsers = new Map(); // conversationId -> Set of userIds

// Helper: find accepted friendship either in Friend collection or via User.friends array
async function resolveFriendshipOrPair(userId, otherUserId) {
  // 1) Try Friend collection
  const friendDoc = await Friend.findOne({
    $or: [
      { requester: userId, recipient: otherUserId, status: 'accepted' },
      { requester: otherUserId, recipient: userId, status: 'accepted' }
    ]
  });
  if (friendDoc) return { type: 'friendDoc', doc: friendDoc, conversationId: friendDoc.conversationId };

  // 2) Fallback to User.friends membership
  const me = await User.findById(userId).select('_id email friends');
  const other = await User.findById(otherUserId).select('_id email friends');
  if (!me || !other) return null;
  const areFriends = me.friends?.some(id => String(id) === String(other._id)) &&
                     other.friends?.some(id => String(id) === String(me._id));
  if (!areFriends) return null;

  // Deterministic conversation id based on emails
  const a = String(me.email).toLowerCase();
  const b = String(other.email).toLowerCase();
  const conversationId = [a, b].sort().join(':');
  return { type: 'userFriends', me, other, conversationId };
}

// Helper to get all socket IDs for a user
const getUserSockets = (userId) => {
  return userSockets.get(userId) || new Set();
};

// Helper to emit to all user's sockets
const emitToUser = (userId, event, data) => {
  const sockets = getUserSockets(userId);
  sockets.forEach(socketId => {
    const connection = onlineUsers.get(socketId);
    if (connection && connection.socket) {
      connection.socket.emit(event, data);
    }
  });
};

// Create notification helper - aligns with Notification schema
const createNotification = async ({ userId, type, message, reference, referenceModel, senderInfo = {} }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message: message || undefined,
      reference: reference || undefined,
      referenceModel: referenceModel || undefined,
      senderInfo: senderInfo || undefined,
      isRead: false,
      createdAt: new Date()
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        process.env.FRONTEND_URL || 'http://localhost:5173',
        process.env.VERCEL_FRONTEND_URL || 'http://localhost:5173',
        'https://journ-iq-93xs.vercel.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error('Invalid token'));

      const user = await User.findById(decoded.id).select('_id name email');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      console.error('Socket auth error:', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const userName = socket.user.name;

    console.log(`✓ User connected: ${userName} (${userId})`);

    try {
      // Store socket information
      onlineUsers.set(socket.id, {
        userId,
        userName,
        socket,
        connectedAt: Date.now()
      });

      // Add socket to user's socket set
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Get user's friends and their online status
      const friendships = await Friend.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      }).populate('requester recipient', '_id name email');

      // Notify friends that user is online
      for (const friendship of friendships) {
        const friendId = friendship.requester._id.toString() === userId ? 
          friendship.recipient._id : friendship.requester._id;
        
        emitToUser(friendId, 'friend:online', {
          userId,
          name: userName,
          timestamp: new Date()
        });
      }

      // Send friend list to user with online status
      const friendsList = friendships.map(friendship => {
        const friendId = friendship.requester._id.toString() === userId ? 
          friendship.recipient._id : friendship.requester._id;
        const friendInfo = friendship.requester._id.toString() === userId ? 
          friendship.recipient : friendship.requester;
        
        return {
          _id: friendId,
          name: friendInfo.name,
          email: friendInfo.email,
          online: userSockets.has(friendId.toString()),
          conversationId: friendship.conversationId
        };
      });

      socket.emit('friends:list', { friends: friendsList });

      // Send unread notifications count
      const unreadNotifications = await Notification.countDocuments({
        user: userId,
        read: false
      });

      if (unreadNotifications > 0) {
        socket.emit('notifications:count', { count: unreadNotifications });
      }

      // ============ MESSAGE HANDLING ============
      const handleMessageSend = async (data) => {
        try {
          const { receiverId, content, noteId, tempId } = data;
          if (!content?.trim() && !noteId) {
            throw new Error('Message content is required');
          }

          // Verify friendship exists and get conversation ID
          const resolved = await resolveFriendshipOrPair(userId, receiverId);
          if (!resolved) throw new Error('Can only send messages to friends');

          // Create message
          const me = resolved.me || await User.findById(userId).select('email');
          const other = resolved.other || await User.findById(receiverId).select('email');
          const message = await Message.create({
            conversationId: resolved.conversationId,
            sender: userId,
            receiver: receiverId,
            senderEmail: me.email,
            receiverEmail: other.email,
            content: content.trim(),
            text: content.trim(),
            note: noteId,
            status: 'sent'
          });

          const populatedMessage = await message.populate([
            { path: 'sender', select: 'name _id' },
            { path: 'receiver', select: 'name _id' },
            { path: 'note', select: 'text _id' }
          ]);

          // Create notification for receiver and emit it
          const notif = await createNotification({
            userId: receiverId,
            type: 'new_message',
            message: `New message from ${userName}`,
            reference: message._id,
            referenceModel: 'Message',
            senderInfo: { id: userId, name: userName }
          });

          // Emit to all receiver's sockets: message + notification
          emitToUser(receiverId, 'message:received', {
            message: populatedMessage,
            notification: notif
          });

          // Confirm to sender
          socket.emit('message:sent', {
            tempId,
            message: populatedMessage
          });

          // Update friendship last interaction
          if (resolved.type === 'friendDoc') {
            await Friend.findByIdAndUpdate(resolved.doc._id, { lastInteraction: new Date() });
          }

        } catch (err) {
          console.error('Message send error:', err);
          socket.emit('message:error', {
            tempId,
            error: err.message
          });
        }
      };
      socket.on('message:send', handleMessageSend);
      // Back-compat alias
      socket.on('send_message', handleMessageSend);

      // Message history request
      const handleMessagesFetchByConversation = async ({ conversationId }) => {
        try {
          // Verify user is part of this conversation
          const friendDoc = await Friend.findOne({ conversationId, $or: [{ requester: userId }, { recipient: userId }] });
          if (!friendDoc) {
            // Fallback: verify via emails in conversationId
            const parts = String(conversationId).split(':');
            if (parts.length !== 2) throw new Error('Invalid conversationId');
            const me = await User.findById(userId).select('email friends');
            if (!me) throw new Error('Unauthorized');
            const [e1, e2] = parts;
            const mine = String(me.email).toLowerCase();
            if (mine !== e1 && mine !== e2) throw new Error('Unauthorized');
          }

          const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).populate([
            { path: 'sender', select: 'name _id' },
            { path: 'receiver', select: 'name _id' },
            { path: 'note', select: 'text _id' }
          ]).lean();
          socket.emit('messages:history', {
            conversationId,
            messages
          });

        } catch (err) {
          console.error('Message fetch error:', err);
          socket.emit('messages:error', {
            error: err.message
          });
        }
      };
      socket.on('messages:fetch', handleMessagesFetchByConversation);
      // Back-compat: fetch by friendId
      socket.on('fetch_messages', async ({ friendId }) => {
        try {
          const resolved = await resolveFriendshipOrPair(userId, friendId);
          if (!resolved) {
            return socket.emit('messages:error', { error: 'No friendship' });
          }
          await handleMessagesFetchByConversation({ conversationId: resolved.conversationId });
        } catch (err) {
          socket.emit('messages:error', { error: 'Server error' });
        }
      });

      // Message read receipt
      socket.on('message:read', async ({ messageId }) => {
        try {
          const message = await Message.findById(messageId);
          if (!message || message.receiver.toString() !== userId) {
            throw new Error('Unauthorized');
          }

          if (message.status !== 'read') {
            message.status = 'read';
            message.readAt = new Date();
            await message.save();
          }
          
          // Notify sender of read status
          emitToUser(message.sender.toString(), 'message:status', {
            messageId,
            status: 'read',
            readAt: new Date()
          });

        } catch (err) {
          console.error('Message read error:', err);
        }
      });

      // Friend request handling
      socket.on('friend:request', async ({ targetId }) => {
        try {
          // Check if friendship already exists
          const existingFriendship = await Friend.findOne({
            $or: [
              { requester: userId, recipient: targetId },
              { requester: targetId, recipient: userId }
            ]
          });

          if (existingFriendship) {
            throw new Error('Friendship already exists');
          }

          // Create friendship
          const friendship = await Friend.create({
            requester: userId,
            recipient: targetId,
            status: 'pending'
          });

          // Create notification
          const notification = await createNotification({
            userId: targetId,
            type: 'friend_request',
            message: `${userName} sent you a friend request`,
            senderInfo: { id: userId, name: userName }
          });

          // Notify recipient
          emitToUser(targetId, 'friend:request', {
            friendship,
            notification
          });

          // Confirm to sender
          socket.emit('friend:request:sent', {
            friendship
          });

        } catch (err) {
          console.error('Friend request error:', err);
          socket.emit('friend:error', {
            error: err.message
          });
        }
      });

      // Friend request response
      socket.on('friend:respond', async ({ friendshipId, accept }) => {
        try {
          const friendship = await Friend.findById(friendshipId);
          if (!friendship || friendship.recipient.toString() !== userId) {
            throw new Error('Unauthorized');
          }

          friendship.status = accept ? 'accepted' : 'declined';
          await friendship.save();

          // Notify requester
          const notification = await createNotification({
            userId: friendship.requester,
            type: accept ? 'friend_accepted' : 'friend_declined',
            message: accept ? `${userName} accepted your friend request` : `${userName} declined your friend request`,
            senderInfo: { id: userId, name: userName }
          });

          emitToUser(friendship.requester.toString(), 'friend:response', {
            friendship,
            notification,
            accepted: accept
          });

          // Confirm to responder
          socket.emit('friend:response:sent', {
            friendship
          });

        } catch (err) {
          console.error('Friend response error:', err);
          socket.emit('friend:error', {
            error: err.message
          });
        }
      });

      // Disconnect handling
      socket.on('disconnect', async () => {
        console.log(`✗ User disconnected: ${userName} (${socket.id})`);

        // Remove this socket
        onlineUsers.delete(socket.id);
        const userSocketSet = userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            userSockets.delete(userId);
            
            // Get user's friends
            const friendships = await Friend.find({
              $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
              ]
            });

            // Notify friends of offline status
            for (const friendship of friendships) {
              const friendId = friendship.requester.toString() === userId ? 
                friendship.recipient : friendship.requester;
              
              emitToUser(friendId.toString(), 'friend:offline', {
                userId,
                timestamp: new Date()
              });
            }
          }
        }
      });
    } catch (err) {
      console.error('Socket connection error:', err);
      socket.disconnect(true);
    }
  });

  return io;
}