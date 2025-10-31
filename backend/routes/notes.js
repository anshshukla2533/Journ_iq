// backend/routes/notes.js
import express from 'express';
import Note from '../models/Note.js';
import protect from '../middleware/protectRoute.js';
const router = express.Router();
// GET /api/notes/search - Search notes by keyword
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Search query is required', 
        data: [] 
      });
    } // <-- closing brace added here

    const notes = await Note.find({
      owner: req.user._id,
      text: { $regex: q, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.json({ success: true, msg: 'Notes found', data: notes });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while searching notes', 
      data: [] 
    });
  }
});


// GET /api/notes - Get all notes
// Get all notes for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, msg: 'Notes fetched', data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, msg: 'Server error while fetching notes', data: [] });
  }
});

// POST /api/notes - Create a new note

// Create a new note with support for reminders, todos, images, timelineTag
// Create a new note for the logged-in user
router.post('/', protect, async (req, res) => {
  try {
    const { text, reminder, todos, images, timelineTag } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, msg: 'Note text is required', data: null });
    }
    const newNote = new Note({
      owner: req.user._id,
      text: text.trim(),
      reminder: reminder || null,
      todos: Array.isArray(todos) ? todos : [],
      images: Array.isArray(images) ? images : [],
      timelineTag: timelineTag || ''
    });
    const savedNote = await newNote.save();
    res.status(201).json({ success: true, msg: 'Note created', data: savedNote });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, msg: 'Server error while creating note', data: null });
  }
});

// PUT /api/notes/:id - Update a note

// Update a note with support for reminders, todos, images, timelineTag
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, reminder, todos, images, timelineTag } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, msg: 'Note text is required', data: null });
    }
    const updateFields = {
      text: text.trim(),
      updatedAt: new Date(),
      reminder: reminder || null,
      todos: Array.isArray(todos) ? todos : [],
      images: Array.isArray(images) ? images : [],
      timelineTag: timelineTag || ''
    };
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ success: false, msg: 'Note not found', data: null });
    }
    res.json({ success: true, msg: 'Note updated', data: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, msg: 'Invalid note ID', data: null });
    }
    res.status(500).json({ success: false, msg: 'Server error while updating note', data: null });
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!deletedNote) {
      return res.status(404).json({ success: false, msg: 'Note not found', data: null });
    }
    res.json({ success: true, msg: 'Note deleted successfully', data: deletedNote });
  } catch (error) {
    console.error('Error deleting note:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, msg: 'Invalid note ID', data: null });
    }
    res.status(500).json({ success: false, msg: 'Server error while deleting note', data: null });
  }
});

export default router;