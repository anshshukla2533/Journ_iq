

import React, { useState, useEffect } from 'react';
import Button from '../Common/Button';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';
import ShareNoteModal from './ShareNoteModal';

const DoodleAccent = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 48 24"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M2 14c6-6 10 4 20 0s14 6 22 0"
      stroke="#2563EB"
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M12 4c2-.5 3 2 5 2s3-2 5-2 3 2 5 2"
      stroke="#9333EA"
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="36" cy="9" r="3" fill="#fbbf24" />
  </svg>
);


const SavedNotes = ({ onSelectForShare }) => {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedForShareId, setSelectedForShareId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [noteToShare, setNoteToShare] = useState(null);



  useEffect(() => {
    if (token) {
      loadNotes();
    }
    // eslint-disable-next-line
  }, [token]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notesService.getNotes(token);
      if (res.success) {
        setNotes(res.data);
      } else {
        setError(res.message || 'Failed to load notes.');
        setNotes([]);
      }
    } catch (err) {
      setError('Failed to load notes. Please try again.');
      setNotes([]);
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      setAddingNote(true);
      const res = await notesService.createNote(token, { text: newNoteText });
      if (res.success) {
        setNotes(prevNotes => [res.data, ...prevNotes]);
        setNewNoteText('');
      } else {
        setError(res.message || 'Failed to save note.');
      }
    } catch (err) {
      setError('Failed to save note. Please try again.');
      console.error('Error saving note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await notesService.deleteNote(token, noteId);
      if (res.success) {
        setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      } else {
        setError(res.message || 'Failed to delete note.');
      }
    } catch (err) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', err);
    }
  };

  const handleEditNote = (note) => {
    setEditingId(note._id);
    setEditText(note.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const res = await notesService.updateNote(token, editingId, { text: editText });
      if (res.success) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note._id === editingId ? res.data : note
          )
        );
        setEditingId(null);
        setEditText('');
      } else {
        setError(res.message || 'Failed to update note.');
      }
    } catch (err) {
      setError('Failed to update note. Please try again.');
      console.error('Error updating note:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleOpenShareModal = (note) => {
    setNoteToShare(note);
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setNoteToShare(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading notes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Notes</h1>
              <div className="w-16 h-10">
                <DoodleAccent className="w-full h-full" />
              </div>
            </div>
            <p className="text-gray-600">Save and organize your thoughts</p>
          </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add New Note */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Write a New Note</h2>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
            <DoodleAccent className="w-12 h-6" />
          </div>
        </div>
        <textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {newNoteText.length}/500 characters
          </span>
          <Button
            onClick={handleAddNote}
            disabled={!newNoteText.trim() || addingNote || newNoteText.length > 500}
            className="bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
            text={addingNote ? 'Saving...' : 'Save Note'}
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Your Notes ({notes.length})
        </h2>
        
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                {editingId === note._id ? (
                  // Edit Mode
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600"
                        text="Cancel"
                      />
                      <Button
                        onClick={handleSaveEdit}
                        disabled={!editText.trim()}
                        className="bg-green-500 hover:bg-green-600"
                        text="Save"
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <p className="text-gray-800 mb-2 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                      <div className="text-sm text-gray-500">
                        <span>Created: {formatDate(note.createdAt)}</span>
                        {note.updatedAt !== note.createdAt && (
                          <span className="ml-4">
                            Updated: {formatDate(note.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 items-center flex-wrap gap-2">
                      <Button
                        onClick={() => handleEditNote(note)}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 text-sm"
                        text="Edit"
                      />
                      <Button
                        onClick={() => handleDeleteNote(note._id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm"
                        text="Delete"
                      />
                      <button
                        onClick={() => handleOpenShareModal(note)}
                        className="ml-2 px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold transition"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-semibold mb-2">No notes yet!</p>
              <p className="text-gray-400">Write your first note above to get started.</p>
            </div>
        )}

      {/* Share Note Modal */}
      <ShareNoteModal
        note={noteToShare}
        isOpen={shareModalOpen}
        onClose={handleCloseShareModal}
        onShared={() => {
          // Refresh notes after sharing
          loadNotes();
        }}
      />
      </div>
    </div>
  );
};

export default SavedNotes;