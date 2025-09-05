import Note from '../models/Note.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const noteShareController = {
  
  async shareNote(req, res) {
    try {
      const { noteId, userId } = req.body;
      
    
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