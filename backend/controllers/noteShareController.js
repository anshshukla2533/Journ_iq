import Note from '../models/Note.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const noteShareController = {
  
  async shareNote(req, res) {
    try {
      const { noteId, userId } = req.body;
      
      if (!noteId || !userId) {
        return res.status(400).json({ success: false, msg: 'noteId and userId required' });
      }
      
      // Ensure the authenticated user is the owner of the note before sharing
      const note = await Note.findById(noteId);
      if (!note) return res.status(404).json({ success: false, msg: 'Note not found' });
      if (note.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, msg: 'Not authorized to share this note' });
      }

      // Check if already shared
      const alreadyShared = note.sharedWith.some(share => share.user.toString() === userId.toString());
      if (alreadyShared) {
        return res.status(400).json({ success: false, msg: 'Note already shared with this user' });
      }

      // Share the note
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { 
          $addToSet: { sharedWith: { user: userId, accessLevel: 'read', sharedAt: new Date() } } 
        },
        { new: true }
      );
      
      // Add to user's sharedNotes
      await User.findByIdAndUpdate(userId, { 
        $addToSet: { sharedNotes: noteId } 
      });
      
      // Get the sender's info for notification
      const sender = await User.findById(req.user._id).select('name email');
      
      // Create notification
      await Notification.create({ 
        user: userId, 
        type: 'note_share', 
        message: `${sender.name || sender.email} shared a note with you.`,
        relatedNote: noteId,
        relatedUser: req.user._id
      });
      
      res.json({ success: true, msg: 'Note shared successfully', data: { noteId, userId } });
    } catch (err) {
      console.error('Error sharing note:', err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

export default noteShareController;