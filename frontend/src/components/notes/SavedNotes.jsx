import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';

const SavedNotes = ({ onSelectForShare }) => {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editCaptions, setEditCaptions] = useState('');
  const [selectedForShareId, setSelectedForShareId] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});

  const getNoteId = (note) => note?._id || note?.id;
  const getNoteText = (note) => note?.content || note?.text || '';
  const getNoteCaptions = (note) => note?.captions || '';
  const getNoteTitle = (note) => note?.title || 'Quick note';

  useEffect(() => {
    if (token) {
      loadNotes();
    }
  }, [token]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notesService.getNotes(token);
      if (res.success) {
        setNotes(res.data || []);
      } else {
        setError(res.message || 'Failed to load notes.');
      }
    } catch {
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      setAddingNote(true);
      const res = await notesService.createNote(token, {
        title: newNoteText.trim().slice(0, 60) || 'Quick note',
        content: newNoteText,
      });
      if (res.success) {
        setNotes((prev) => [res.data, ...prev]);
        setNewNoteText('');
      } else {
        setError(res.message || 'Failed to save note.');
      }
    } catch {
      setError('Failed to save note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (note) => {
    const id = getNoteId(note);
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await notesService.deleteNote(token, id);
      if (res.success) {
        setNotes((prev) => prev.filter((item) => getNoteId(item) !== id));
        if (selectedForShareId === id) {
          setSelectedForShareId(null);
          onSelectForShare?.(null);
        }
      } else {
        setError(res.message || 'Failed to delete note.');
      }
    } catch {
      setError('Failed to delete note.');
    }
  };

  const handleEditNote = (note) => {
    setEditingId(getNoteId(note));
    setEditText(getNoteText(note));
    setEditCaptions(getNoteCaptions(note));
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const res = await notesService.updateNote(token, editingId, {
        title: editText.trim().slice(0, 60) || 'Quick note',
        content: editText,
        captions: editCaptions.trim() || null,
      });
      if (res.success) {
        setNotes((prev) => prev.map((note) => (getNoteId(note) === editingId ? res.data : note)));
        setEditingId(null);
        setEditText('');
        setEditCaptions('');
      } else {
        setError(res.message || 'Failed to update note.');
      }
    } catch {
      setError('Failed to update note.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-[1.75rem] bg-[#f6efe4]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-[1.5rem] bg-[#fbf6ee]" />
          <div className="h-48 animate-pulse rounded-[1.5rem] bg-[#fbf6ee]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {error ? (
        <div className="flex items-center justify-between rounded-2xl border border-[#f0d4d4] bg-[#fff5f5] px-4 py-3 text-sm text-[#a35d5d]">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-semibold text-[#a35d5d]">
            x
          </button>
        </div>
      ) : null}

      <div className="rounded-[1.85rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdf9_0%,#f8f1e6_52%,#f5edde_100%)] p-6 shadow-[0_18px_50px_rgba(87,66,43,0.06)]">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Quick Capture</p>
          <h2 className="mt-1 font-['Sora'] text-xl font-semibold text-[#2f2720]">Write a personal note</h2>
          <p className="mt-2 text-sm leading-6 text-[#756a5e]">
            Save private thoughts, study reflections, or drafts, then share any of them when you are ready.
          </p>
        </div>

        <textarea
          value={newNoteText}
          onChange={(event) => setNewNoteText(event.target.value)}
          placeholder="Write anything you want to remember..."
          className="min-h-[120px] w-full rounded-[1.5rem] border border-[#e7dac7] bg-white/90 px-4 py-4 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#8a7d70]">{newNoteText.length} characters</span>
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!newNoteText.trim() || addingNote}
            className="rounded-2xl bg-[#b88455] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(184,132,85,0.28)] transition hover:bg-[#a97546] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {addingNote ? 'Saving...' : 'Save note'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Saved Notes</p>
          <h3 className="mt-1 font-['Sora'] text-xl font-semibold text-[#2f2720]">Your collection</h3>
        </div>
        <span className="rounded-full bg-[#f7f1e7] px-3 py-1 text-xs font-semibold text-[#8b7257]">
          {notes.length} notes
        </span>
      </div>

      {notes.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {notes.map((note) => {
            const id = getNoteId(note);
            const isEditing = editingId === id;
            const isSelected = selectedForShareId === id;
            const isExpanded = Boolean(expandedNotes[id]);
            const noteText = getNoteText(note);
            const noteCaptions = getNoteCaptions(note);
            const hasLongBody = noteText.length > 220 || noteCaptions.length > 180;

            return (
              <div
                key={id}
                className={`group flex min-h-[220px] flex-col rounded-[1.5rem] border bg-white p-5 shadow-[0_12px_35px_rgba(87,66,43,0.05)] transition ${
                  isSelected ? 'border-[#c49a6c] bg-[#fffaf3]' : 'border-[#eadfce]'
                }`}
              >
                {isEditing ? (
                  <div className="flex h-full flex-1 flex-col">
                    <textarea
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="min-h-[150px] w-full flex-1 rounded-[1.25rem] border border-[#e7dac7] bg-[#fffdf9] px-4 py-4 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
                      autoFocus
                    />
                    <textarea
                      value={editCaptions}
                      onChange={(event) => setEditCaptions(event.target.value)}
                      placeholder="Saved captions or transcript headings..."
                      className="mt-3 min-h-[110px] w-full rounded-[1.25rem] border border-[#e7dac7] bg-[#fffdf9] px-4 py-4 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditCaptions('');
                        }}
                        className="rounded-2xl border border-[#e5d8c6] bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-[#866f59]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={!editText.trim()}
                        className="rounded-2xl bg-[#7f9a5c] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[#2f2720]">{getNoteTitle(note)}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9d8467]">
                          {formatDate(note.updatedAt || note.createdAt)}
                        </p>
                        {note.videoTitle ? (
                          <p className="mt-2 inline-flex rounded-full bg-[#f7f1e7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7257]">
                            {note.videoTitle}
                          </p>
                        ) : null}
                      </div>
                      {isSelected ? (
                        <span className="rounded-full bg-[#fff0da] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b6d3d]">
                          Selected
                        </span>
                      ) : null}
                    </div>

                    <p className={`mt-4 flex-1 whitespace-pre-wrap text-sm leading-7 text-[#6f6459] ${isExpanded ? '' : 'line-clamp-5'}`}>
                      {noteText}
                    </p>

                    {noteCaptions ? (
                      <div className="mt-4 rounded-[1.2rem] border border-[#e9dcc9] bg-[#fffaf2] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b7651]">Saved Captions</p>
                        <p className={`mt-2 whitespace-pre-wrap text-sm leading-7 text-[#6f6459] ${isExpanded ? '' : 'line-clamp-4'}`}>
                          {noteCaptions}
                        </p>
                      </div>
                    ) : null}

                    {hasLongBody ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedNotes((prev) => ({
                            ...prev,
                            [id]: !prev[id],
                          }))
                        }
                        className="mt-4 self-start rounded-full border border-[#e5d8c6] bg-[#fffdf9] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d6948] transition hover:border-[#c49a6c] hover:bg-[#fff8ef]"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedForShareId(null);
                            onSelectForShare?.(null);
                          } else {
                            setSelectedForShareId(id);
                            onSelectForShare?.(note);
                          }
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          isSelected
                            ? 'bg-[#b88455] text-white shadow-[0_10px_24px_rgba(184,132,85,0.24)]'
                            : 'border border-[#e4d6c3] bg-[#fff8ef] text-[#8d6948] hover:border-[#c49a6c]'
                        }`}
                      >
                        {isSelected ? 'Selected to share' : 'Share'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditNote(note)}
                        className="rounded-2xl border border-[#e5d8c6] bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-[#866f59]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note)}
                        className="rounded-2xl border border-[#efd7d7] bg-[#fff8f8] px-4 py-2 text-sm font-semibold text-[#ae6666]"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-[#eadfce] bg-[#fffdf9] px-6 py-14 text-center">
          <h3 className="font-['Sora'] text-xl font-semibold text-[#2f2720]">No saved notes yet</h3>
          <p className="mt-2 text-sm leading-7 text-[#7b7064]">
            Use the quick capture card above to create your first personal note, then share it with a friend whenever you like.
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedNotes;
