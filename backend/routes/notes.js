import express from 'express';
import protect from '../middleware/protectRoute.js';
import { getNotes, getNote, createNote, updateNote, deleteNote } from '../controllers/notesController.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

router.route('/:id')
  .get(protect, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

export default router;
