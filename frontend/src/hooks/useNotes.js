
import { useState, useEffect } from 'react';
import notesService from '../services/notesService';
import useAuth from './useAuth';

const useNotes = () => {
  const { token } = useAuth();
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notes from backend
  const fetchNotes = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await notesService.getNotes(token);
    if (res.success) {
      setSavedNotes(res.data || []);
    } else {
      setError(res.message || 'Failed to load notes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, [token]);

  // Save note to backend
  const saveNote = async () => {
    if (!noteText.trim() || !token) return;
    setLoading(true);
    setError(null);
    const res = await notesService.createNote(token, { text: noteText.trim() });
    if (res.success) {
      setSavedNotes(prev => [res.data, ...prev]);
      setNoteText('');
    } else {
      setError(res.message || 'Failed to save note');
    }
    setLoading(false);
  };

  // Delete note from backend
  const deleteNote = async (id) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await notesService.deleteNote(token, id);
    if (res.success) {
      setSavedNotes(prev => prev.filter(note => note._id !== id));
    } else {
      setError(res.message || 'Failed to delete note');
    }
    setLoading(false);
  };

  const clearNotes = () => {
    setSavedNotes([]);
    setNoteText('');
  };

  return {
    noteText,
    setNoteText,
    savedNotes,
    saveNote,
    deleteNote,
    clearNotes,
    loading,
    error,
    fetchNotes
  };
};

export default useNotes;