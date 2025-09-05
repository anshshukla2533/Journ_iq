

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';

const onlineUsers = new Map(); // userId -> socketId

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Video/Audio Call Signaling Events
    socket.on('call_user', ({ receiverId, callType }) => {
      // callType: 'video' | 'audio'
      io.to(receiverId).emit('incoming_call', {
        from: socket.user._id,
        callType
      });
    });

    socket.on('accept_call', ({ callerId }) => {
      io.to(callerId).emit('call_accepted', { from: socket.user._id });
    });

    socket.on('reject_call', ({ callerId }) => {
      io.to(callerId).emit('call_rejected', { from: socket.user._id });
    });

    socket.on('end_call', ({ peerId }) => {
      io.to(peerId).emit('call_ended', { from: socket.user._id });
    });
    // Mark user online
    onlineUsers.set(socket.user._id.toString(), socket.id);
    User.findByIdAndUpdate(socket.user._id, { online: true }).exec();
    io.emit('user_online', { userId: socket.user._id });

    // Join user room
    socket.join(socket.user._id.toString());

    // Handle sending a message (with image support)
    socket.on('send_message', async ({ receiverId, content, noteId, image }) => {
      try {
        let message = await Message.create({
          sender: socket.user._id,
          receiver: receiverId,
          content,
          note: noteId || null,
          image: image || undefined
        });
        // If receiver is online, mark as delivered
        if (onlineUsers.has(receiverId)) {
          message.status = 'delivered';
          await message.save();
        }
        // Emit to receiver
        io.to(receiverId).emit('receive_message', message);
        // Emit to sender (for confirmation)
        socket.emit('message_sent', message);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    // Handle read receipt
    socket.on('read_message', async ({ messageId }) => {
      const message = await Message.findByIdAndUpdate(messageId, { status: 'read' }, { new: true });
      if (message) {
        io.to(message.sender.toString()).emit('message_read', { messageId });
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(socket.user._id.toString());
      await User.findByIdAndUpdate(socket.user._id, { online: false, lastLogin: new Date() });
      io.emit('user_offline', { userId: socket.user._id, lastSeen: new Date() });
    });
  });

  return io;
}
