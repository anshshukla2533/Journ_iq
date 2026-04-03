import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma.js';
import { deleteCacheKeys, notificationCacheKeys } from './lib/cache.js';

const onlineUsers = new Map();
const userSockets = new Map();

async function resolveFriendshipOrPair(userId, otherUserId) {
  const friendReq = await prisma.friendRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }
  });

  if (!friendReq) return null;

  const me = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  const other = await prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true, email: true } });
  if (!me || !other) return null;

  const a = String(me.id);
  const b = String(other.id);
  const conversationId = [a, b].sort().join(':');
  
  return { type: 'friendDoc', me, other, conversationId };
}

const getUserSockets = (userId) => userSockets.get(userId) || new Set();

const emitToUser = (userId, event, data) => {
  const sockets = getUserSockets(userId);
  sockets.forEach(socketId => {
    const connection = onlineUsers.get(socketId);
    if (connection && connection.socket) {
      connection.socket.emit(event, data);
    }
  });
};

const createNotification = async (userId, type, data) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        data,
      }
    });
    await deleteCacheKeys(notificationCacheKeys(userId));
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from './lib/redis.js';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const redisClient = getRedisClient();
  if (redisClient) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✓ Socket.io Redis Adapter successfully connected');
    }).catch(err => {
      console.error('Failed to configure Socket.io Redis Adapter:', err);
    });
  }

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error('Invalid token'));

      const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true } });
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      socket.userId = user.id;
      next();
    } catch (err) {
      console.error('Socket auth error:', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const userName = socket.user.name;
    const connectedAt = new Date();

    console.log(`✓ User connected: ${userName} (${userId})`);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          online: true,
          lastLogin: connectedAt
        }
      });

      onlineUsers.set(socket.id, { userId, userName, socket, connectedAt: Date.now() });

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      socket.join(`user:${userId}`);

      const friendships = await prisma.friendRequest.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ senderId: userId }, { receiverId: userId }]
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } }
        }
      });

      for (const friendship of friendships) {
        const friendId = friendship.senderId === userId ? friendship.receiverId : friendship.senderId;
        
        emitToUser(friendId, 'friend:online', { userId, name: userName, timestamp: connectedAt });
        emitToUser(friendId, 'user_online', { userId, name: userName, timestamp: connectedAt });
      }

      const friendsList = friendships.map(friendship => {
        const friendId = friendship.senderId === userId ? friendship.receiverId : friendship.senderId;
        const friendInfo = friendship.senderId === userId ? friendship.receiver : friendship.sender;
        
        const a = String(userId);
        const b = String(friendId);
        const conversationId = [a, b].sort().join(':');

        return {
          _id: friendId,
          name: friendInfo.name,
          email: friendInfo.email,
          online: userSockets.has(friendId),
          conversationId
        };
      });

      socket.emit('friends:list', { friends: friendsList });

      const unreadNotifications = await prisma.notification.count({
        where: { userId, read: false }
      });

      if (unreadNotifications > 0) {
        socket.emit('notifications:count', { count: unreadNotifications });
      }

      const handleMessageSend = async (data) => {
        try {
          const { receiverId, content, noteId, tempId } = data;
          if (!content?.trim() && !noteId) throw new Error('Message content is required');

          const resolved = await resolveFriendshipOrPair(userId, receiverId);
          if (!resolved) throw new Error('Can only send messages to friends');

          let msgContent = content ? content.trim() : '';

          if (noteId) {
            const originalNote = await prisma.note.findUnique({ where: { id: noteId } });
            if (originalNote) {
              await prisma.note.create({
                 data: {
                   userId: receiverId,
                   title: originalNote.title,
                   content: originalNote.content,
                   color: originalNote.color,
                   tags: originalNote.tags,
                   videoUrl: originalNote.videoUrl,
                   videoTitle: originalNote.videoTitle,
                   sharedWith: { connect: { id: userId } }
                 }
              });
              msgContent = msgContent ? msgContent + " [Attached Note]" : "[Attached Note]";
            }
          }

          const message = await prisma.message.create({
            data: {
              senderId: userId,
              receiverId,
              content: msgContent
            },
            include: {
              sender: { select: { id: true, name: true } },
              receiver: { select: { id: true, name: true } }
            }
          });

          const formattedMessage = { ...message, _id: message.id };

          const notification = await createNotification(receiverId, 'message', {
            senderId: userId,
            senderName: userName,
            messageId: message.id,
            messagePreview: msgContent.substring(0, 50) + (msgContent.length > 50 ? '...' : '')
          });

          emitToUser(receiverId, 'message:received', { message: formattedMessage, notification });
          emitToUser(receiverId, 'receive_message', { conversationId: resolved.conversationId, message: formattedMessage });

          socket.emit('message:sent', { tempId, message: formattedMessage });
          socket.emit('message_sent', { tempId, conversationId: resolved.conversationId, message: formattedMessage });

        } catch (err) {
          console.error('Message send error:', err);
          socket.emit('message:error', { tempId, error: err.message });
        }
      };
      
      socket.on('message:send', handleMessageSend);
      socket.on('send_message', handleMessageSend);

      const handleMessagesFetchByConversation = async ({ conversationId }) => {
        try {
          const parts = String(conversationId).split(':');
          if (parts.length !== 2) throw new Error('Invalid conversationId');
          const [u1, u2] = parts;
          
          if (u1 !== userId && u2 !== userId) throw new Error('Unauthorized');

          const userId2 = u1 === userId ? u2 : u1;

          const messages = await prisma.message.findMany({
            where: {
              OR: [
                { senderId: userId, receiverId: userId2 },
                { senderId: userId2, receiverId: userId }
              ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, name: true } },
              receiver: { select: { id: true, name: true } }
            }
          });
          
          const formatted = messages.map(m => ({ ...m, _id: m.id }));
          
          socket.emit('messages:history', { conversationId, messages: formatted });
          socket.emit('messages_history', { conversationId, messages: formatted });

        } catch (err) {
          console.error('Message fetch error:', err);
          socket.emit('messages:error', { error: err.message });
        }
      };
      
      socket.on('messages:fetch', handleMessagesFetchByConversation);
      
      socket.on('fetch_messages', async ({ friendId }) => {
        try {
          const resolved = await resolveFriendshipOrPair(userId, friendId);
          if (!resolved) return socket.emit('messages_history', { success: false, error: 'No friendship' });
          await handleMessagesFetchByConversation({ conversationId: resolved.conversationId });
        } catch (err) {
          socket.emit('messages_history', { success: false, error: 'Server error' });
        }
      });

      socket.on('message:read', async ({ messageId }) => {
        try {
          const message = await prisma.message.findUnique({ where: { id: messageId } });
          if (!message || message.receiverId !== userId) throw new Error('Unauthorized');

          await prisma.message.update({ where: { id: messageId }, data: { read: true } });
          
          emitToUser(message.senderId, 'message:status', { messageId, status: 'read', readAt: new Date() });
        } catch (err) {
          console.error('Message read error:', err);
        }
      });

      socket.on('typing:start', async ({ receiverId }) => {
        try {
          if (!receiverId) throw new Error('receiverId required');
          const resolved = await resolveFriendshipOrPair(userId, receiverId);
          if (!resolved) throw new Error('Not friends');
          emitToUser(receiverId, 'user_typing', { userId, typing: true });
        } catch (err) {
          console.error('typing:start error:', err.message || err);
        }
      });

      socket.on('typing:stop', async ({ receiverId }) => {
        try {
          if (!receiverId) throw new Error('receiverId required');
          const resolved = await resolveFriendshipOrPair(userId, receiverId);
          if (!resolved) throw new Error('Not friends');
          emitToUser(receiverId, 'user_typing', { userId, typing: false });
        } catch (err) {
          console.error('typing:stop error:', err.message || err);
        }
      });

      socket.on('call_user', async ({ receiverId, callType }) => {
        try {
          if (!receiverId) throw new Error('receiverId required');
          const resolved = await resolveFriendshipOrPair(userId, receiverId);
          if (!resolved) throw new Error('Not friends');
          emitToUser(receiverId, 'incoming_call', { from: userId, callType });
        } catch (err) {
          console.error('call_user error:', err.message || err);
        }
      });

      socket.on('accept_call', async ({ callerId }) => {
        try {
          if (!callerId) throw new Error('callerId required');
          const resolved = await resolveFriendshipOrPair(userId, callerId);
          if (!resolved) throw new Error('Not friends');
          emitToUser(callerId, 'call_accepted', { from: userId });
        } catch (err) {
          console.error('accept_call error:', err.message || err);
        }
      });

      socket.on('reject_call', async ({ callerId }) => {
        try {
          if (!callerId) throw new Error('callerId required');
          emitToUser(callerId, 'call_rejected', {});
        } catch (err) {
          console.error('reject_call error:', err.message || err);
        }
      });

      socket.on('end_call', async ({ peerId }) => {
        try {
          if (!peerId) throw new Error('peerId required');
          emitToUser(peerId, 'call_ended', {});
        } catch (err) {
          console.error('end_call error:', err.message || err);
        }
      });

      socket.on('webrtc_offer', async ({ sdp, peerId }) => {
        try {
          if (!peerId || !sdp) throw new Error('peerId and sdp required');
          emitToUser(peerId, 'webrtc_offer', { sdp });
        } catch (err) {
          console.error('webrtc_offer error:', err.message || err);
        }
      });

      socket.on('webrtc_answer', async ({ sdp, peerId }) => {
        try {
          if (!peerId || !sdp) throw new Error('peerId and sdp required');
          emitToUser(peerId, 'webrtc_answer', { sdp });
        } catch (err) {
          console.error('webrtc_answer error:', err.message || err);
        }
      });

      socket.on('webrtc_ice', async ({ candidate, peerId }) => {
        try {
          if (!peerId || !candidate) throw new Error('peerId and candidate required');
          emitToUser(peerId, 'webrtc_ice', { candidate });
        } catch (err) {
          console.error('webrtc_ice error:', err.message || err);
        }
      });

      socket.on('disconnect', async () => {
        console.log(`✗ User disconnected: ${userName} (${socket.id})`);

        onlineUsers.delete(socket.id);
        const userSocketSet = userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            userSockets.delete(userId);
            const disconnectedAt = new Date();

            await prisma.user.update({
              where: { id: userId },
              data: {
                online: false,
                lastLogin: disconnectedAt
              }
            });
            
            const friendships = await prisma.friendRequest.findMany({
              where: {
                status: 'ACCEPTED',
                OR: [{ senderId: userId }, { receiverId: userId }]
              }
            });

            for (const friendship of friendships) {
              const friendId = friendship.senderId === userId ? friendship.receiverId : friendship.senderId;
              emitToUser(friendId, 'friend:offline', { userId, timestamp: disconnectedAt });
              emitToUser(friendId, 'user_offline', { userId, timestamp: disconnectedAt });
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
