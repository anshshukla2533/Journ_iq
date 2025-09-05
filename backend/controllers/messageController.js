import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Note from '../models/Note.js';

export default {
 
  async sendMessage(req, res) {
    try {
      const { receiverId, content, noteId, image } = req.body;
      const senderId = req.user._id;
      let noteToAttach = noteId;

      if (noteId) {
        const originalNote = await Note.findById(noteId);
        if (originalNote) {
          
          const newNote = new Note({
            owner: receiverId,
            text: originalNote.text,
            date: originalNote.date,
            todos: originalNote.todos,
            images: originalNote.images,
            timelineTag: originalNote.timelineTag,
            sharedWith: [senderId],
            reminder: originalNote.reminder
          });
          await newNote.save();
          noteToAttach = newNote._id;
        }
      }
      const message = await Message.create({ 
        sender: senderId, 
        receiver: receiverId, 
        content, 
        note: noteToAttach,
        image: image || undefined
      });
      await Notification.create({ 
        user: receiverId, 
        type: 'message', 
        message: `New message from ${req.user.name}` 
      });
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },


  async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const messages = await Message.find({
        $or: [
          { sender: req.user._id, receiver: userId },
          { sender: userId, receiver: req.user._id }
        ]
      })
      .sort({ createdAt: 1 })
      .populate('note', 'text');
      res.json(messages);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  
  async markAsRead(req, res) {
    try {
      const { messageId } = req.body;
      const message = await Message.findByIdAndUpdate(
        messageId, 
        { status: 'read' }, 
        { new: true }
      );
      
      res.json(message);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};