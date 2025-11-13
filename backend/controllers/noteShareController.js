import Note from '../models/Note.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const noteShareController = {
  
  async shareNote(req, res) {
    try {
      const { noteId, userId } = req.body;
      // Ensure the authenticated user is the owner of the note before sharing
      const note = await Note.findById(noteId);
      if (!note) return res.status(404).json({ success: false, msg: 'Note not found' });
      if (note.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, msg: 'Not authorized to share this note' });
      }

      await Note.findByIdAndUpdate(noteId, { 
        $addToSet: { sharedWith: userId } 
      });
      
     
      await User.findByIdAndUpdate(userId, { 
        $addToSet: { sharedNotes: noteId } 
      });
      
    
      await Notification.create({ 
        user: userId, 
        type: 'note_share', 
        message: `A note was shared with you.` 
      });
      
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

export default noteShareController;