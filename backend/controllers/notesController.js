import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { deleteCacheKeys } from '../lib/cache.js';

const noteCacheKeys = (userId) => [
  `timeline:${userId}`,
];

export const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, msg: 'User not authenticated' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = {
      OR: [
        { userId: req.user.id },
        { sharedWith: { some: { id: req.user.id } } }
      ]
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, email: true } },
          sharedWith: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.note.count({ where: whereClause })
    ]);

    const transformedNotes = notes.map(note => ({
      ...note,
      text: note.content || note.title || '',
      isOwner: note.userId === req.user.id,
      sharedWithMe: note.sharedWith.some(u => u.id === req.user.id)
    }));

    res.json({
      success: true,
      data: transformedNotes,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        page: parseInt(page),
        limit: take
      }
    });
  } catch (error) {
    console.error('Get notes error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error while fetching notes' });
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { sharedWith: { some: { id: req.user.id } } }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!note) return res.status(404).json({ success: false, msg: 'Note not found' });

    res.json({ success: true, data: { ...note, text: note.content || note.title || '' } });
  } catch (error) {
    console.error('Get note error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error while fetching note' });
  }
};

export const createNote = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, msg: 'User not authenticated' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, msg: 'Validation failed', errors: errors.array() });
    }

    const { title, content, text, captions, videoUrl, videoTitle, color, tags } = req.body;
    const normalizedContent = content ?? text ?? null;
    const normalizedTitle = title || (normalizedContent ? String(normalizedContent).slice(0, 80) : 'Untitled note');

    const note = await prisma.note.create({
      data: {
        title: normalizedTitle,
        content: normalizedContent,
        captions: captions ?? null,
        videoUrl: videoUrl || null,
        videoTitle: videoTitle || null,
        color: color || '#ffffff',
        tags: tags ? tags.map(t => t.trim()).filter(Boolean) : [],
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    await deleteCacheKeys(noteCacheKeys(req.user.id));
    res.status(201).json({
      success: true,
      msg: 'Note created successfully',
      data: { ...note, text: note.content || note.title || '', isOwner: true, sharedWithMe: false }
    });
  } catch (error) {
    console.error('Create note error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error while creating note' });
  }
};

export const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, msg: 'Validation failed', errors: errors.array() });
    }

    const { title, content, text, captions, videoUrl, videoTitle, color, tags } = req.body;
    const normalizedContent = content ?? text;

    const existingNote = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existingNote) return res.status(404).json({ success: false, msg: 'Note not found or unauthorized' });

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(normalizedContent !== undefined && { content: normalizedContent }),
        ...(captions !== undefined && { captions }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(videoTitle !== undefined && { videoTitle }),
        ...(color !== undefined && { color }),
        ...(tags !== undefined && { tags: tags.map(t => t.trim()).filter(Boolean) })
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    await deleteCacheKeys(noteCacheKeys(req.user.id));
    res.json({ success: true, msg: 'Note updated successfully', data: { ...note, text: note.content || note.title || '' } });
  } catch (error) {
    console.error('Update note error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error while updating note' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!note) return res.status(404).json({ success: false, msg: 'Note not found or unauthorized' });

    await prisma.note.delete({ where: { id: req.params.id } });
    await deleteCacheKeys(noteCacheKeys(req.user.id));

    res.json({ success: true, msg: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error while deleting note' });
  }
};
