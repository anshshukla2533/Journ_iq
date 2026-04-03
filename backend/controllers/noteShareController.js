import { prisma } from '../lib/prisma.js';
import { deleteCacheKeys, notificationCacheKeys } from '../lib/cache.js';

const noteShareController = {
  async shareNote(req, res) {
    try {
      const { noteId, userId } = req.body;
      if (!noteId || !userId) {
        return res.status(400).json({ success: false, msg: 'noteId and userId are required' });
      }
      
      const note = await prisma.note.findUnique({ where: { id: noteId } });
      if (!note) return res.status(404).json({ success: false, msg: 'Note not found' });
      
      if (note.userId !== req.user.id) {
        return res.status(403).json({ success: false, msg: 'Not authorized to share this note' });
      }

      await prisma.note.update({
        where: { id: noteId },
        data: {
          sharedWith: {
            connect: { id: userId }
          }
        }
      });
      
      await prisma.notification.create({ 
        data: {
          userId: userId, 
          type: 'note_share', 
          data: {
            text: `${req.user.name || 'Someone'} shared "${note.title || 'a note'}" with you.`,
            noteId: note.id,
            noteTitle: note.title || 'a note',
            senderId: req.user.id,
            senderName: req.user.name || 'Someone',
            senderEmail: req.user.email || '',
          }
        }
      });
      await deleteCacheKeys(notificationCacheKeys(userId));
      
      res.json({
        success: true,
        msg: 'Note shared successfully',
        data: {
          noteId: note.id,
          sharedWithUserId: userId,
          title: note.title,
        }
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

export default noteShareController;
