import { validationResult } from 'express-validator'
import Note from '../models/Note.js'

// @desc    Get all notes for logged in user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, priority, search } = req.query
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        msg: 'User not authenticated'
      });
    }

    // Build query for user's own notes and notes shared with them
    const query = {
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id }
      ]
    };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$and = [{
        $or: [
          { text: { $regex: search, $options: 'i' } }
        ]
      }];
    }

    // Execute query with pagination
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'name email _id')
      .populate('sharedWith', 'name email _id');

    const total = await Note.countDocuments(query);

    // Transform notes to include ownership info
    const transformedNotes = notes.map(note => ({
      ...note.toObject(),
      isOwner: note.owner._id.toString() === req.user._id.toString(),
      sharedWithMe: note.sharedWith.some(user => user._id.toString() === req.user._id.toString())
    }));

    res.json({
      success: true,
      data: transformedNotes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get notes error:', error.message)
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching notes'
    })
  }
}


export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('owner', 'name email')

    if (!note) {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }

    res.json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('Get note error:', error.message)
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching note'
    })
  }
}


export const createNote = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        msg: 'User not authenticated'
      });
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      })
    }

    const { title, content, category, priority, tags, reminderDate } = req.body

    const note = new Note({
      text: content.trim(),
      owner: req.user._id,
      title: title?.trim(),
      category,
      priority,
      tags: tags?.map(tag => tag.trim()).filter(Boolean),
      reminderDate,
      sharedWith: [] // Initialize empty shared users array
    })
    
    await note.save()
    await note.populate('owner', 'name email _id')
    
    const noteWithOwnership = {
      ...note.toObject(),
      isOwner: true,
      sharedWithMe: false
    };

    res.status(201).json({
      success: true,
      msg: 'Note created successfully',
      data: noteWithOwnership
    })
  } catch (error) {
    console.error('Create note error:', error.message)
    res.status(500).json({
      success: false,
      msg: 'Server error while creating note'
    })
  }
}


export const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      })
    }

    const { title, content, category, priority, tags, reminderDate } = req.body

    let note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!note) {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }

    // Update fields
    if (title !== undefined) note.title = title.trim()
    if (content !== undefined) note.content = content.trim()
    if (category !== undefined) note.category = category
    if (priority !== undefined) note.priority = priority
    if (tags !== undefined) note.tags = tags.map(tag => tag.trim()).filter(tag => tag)
    if (reminderDate !== undefined) note.reminderDate = reminderDate

    await note.save()
    await note.populate('user', 'name email')

    res.json({
      success: true,
      msg: 'Note updated successfully',
      data: note
    })
  } catch (error) {
    console.error('Update note error:', error.message)
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error while updating note'
    })
  }
}

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!note) {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }

    await Note.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      msg: 'Note deleted successfully'
    })
  } catch (error) {
    console.error('Delete note error:', error.message)
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error while deleting note'
    })
  }
}


export const toggleArchiveNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!note) {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }

    note.isArchived = !note.isArchived
    await note.save()

    res.json({
      success: true,
      msg: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      data: note
    })
  } catch (error) {
    console.error('Archive note error:', error.message)
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        msg: 'Note not found'
      })
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error while archiving note'
    })
  }
}