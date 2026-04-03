import { prisma } from '../lib/prisma.js';
import { deleteCacheKeys, notificationCacheKeys } from '../lib/cache.js';

export default {
  async sendMessage(req, res) {
    try {
      const { receiverId, content, noteId } = req.body;
      const senderId = req.user.id;

      let msgContent = content;

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
               sharedWith: { connect: { id: senderId } }
             }
          });
          msgContent = msgContent + " [Attached Note]";
        }
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content: msgContent
        }
      });

      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'message',
          data: {
            text: `New message from ${req.user.name || 'someone'}`,
            senderId,
            senderName: req.user.name || 'Someone',
            senderEmail: req.user.email || '',
            messagePreview: msgContent?.slice(0, 90) || '',
          } 
        }
      });
      await deleteCacheKeys(notificationCacheKeys(receiverId));

      res.status(201).json(message);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },

  async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: userId, receiverId: req.user.id }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });
      res.json(messages);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const { messageId } = req.body;
      const message = await prisma.message.update({
        where: { id: messageId },
        data: { read: true }
      });
      res.json(message);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
