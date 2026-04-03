import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SavedNotes from '../components/notes/SavedNotes';
import useAuth from '../hooks/useAuth';
import { api, setAuthToken } from '../services/api';

export default function NotesPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [noteToShare, setNoteToShare] = useState(null);
  const [friends, setFriends] = useState([]);
  const [sharingToId, setSharingToId] = useState('');
  const [shareState, setShareState] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (!token) return;

    const loadFriends = async () => {
      try {
        setAuthToken(token);
        const response = await api.get('/friends/list');
        setFriends(Array.isArray(response.data) ? response.data : []);
      } catch {
        setFriends([]);
      }
    };

    loadFriends();
  }, [token]);

  const shareNoteId = useMemo(() => noteToShare?.id || noteToShare?._id || null, [noteToShare]);

  const handleShareSavedNote = async () => {
    if (!token || !shareNoteId || !sharingToId) return;

    setShareState({ type: 'loading', message: '' });
    try {
      setAuthToken(token);
      await api.post('/noteShare/share', { noteId: shareNoteId, userId: sharingToId });
      const friend =
        friends.find((item) => (item.id || item._id) === sharingToId) || {
          id: sharingToId,
          _id: sharingToId,
          name: 'Shared friend',
          email: '',
        };

      setShareState({
        type: 'success',
        message: `Shared with ${friend?.name || friend?.email || 'your friend'}.`,
      });

      navigate('/dashboard/chat', {
        state: {
          chatFriend: friend,
          sharedNoteId: shareNoteId,
          sharedNoteTitle: noteToShare?.title || 'Shared note',
          draftMessage: 'I just shared a personal note with you.',
          sharedNoteAlreadyShared: true,
        },
      });
    } catch (error) {
      setShareState({
        type: 'error',
        message: error.response?.data?.msg || error.response?.data?.error || 'Sharing failed. Please try again.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 font-['Sora'] text-3xl font-semibold text-[#2f2720]">My Notes</h2>
          <p className="text-[#776d62]">Capture personal ideas, refine them, and share any saved note with a friend when you want.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.75fr]">
        <div className="glass-panel p-6 shadow-2xl">
          <SavedNotes
            onSelectForShare={(note) => {
              setShareState({ type: 'idle', message: '' });
              setSharingToId('');
              setNoteToShare(note);
            }}
          />
        </div>

        <div className="h-fit rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_50px_rgba(87,66,43,0.06)]">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Share Saved Note</p>
            <h3 className="mt-1 font-['Sora'] text-lg font-semibold text-[#2f2720]">Send a personal note</h3>
          </div>

          {noteToShare ? (
            <div className="mb-4 rounded-2xl border border-[#f0e6d8] bg-[#fffcf8] p-4">
              <p className="text-sm font-semibold text-[#2f2720]">{noteToShare.title || 'Quick note'}</p>
              <p className="mt-1 line-clamp-4 text-sm leading-6 text-[#72675c]">{noteToShare.content || noteToShare.text || ''}</p>
              {noteToShare.captions ? (
                <div className="mt-3 rounded-xl border border-[#eadfce] bg-[#fff8ef] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b7651]">Saved Captions</p>
                  <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-[#72675c]">{noteToShare.captions}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mb-4 rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf9] p-4 text-sm text-[#8e8275]">
              Pick a note from the left using its share button.
            </div>
          )}

          <div className="space-y-4">
            <select
              value={sharingToId}
              onChange={(event) => {
                setShareState({ type: 'idle', message: '' });
                setSharingToId(event.target.value);
              }}
              className="w-full rounded-2xl border border-[#e7dac7] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
            >
              <option value="">Choose a friend</option>
              {friends.map((friend) => (
                <option key={friend.id || friend._id} value={friend.id || friend._id}>
                  {friend.name || friend.email}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleShareSavedNote}
              disabled={!shareNoteId || !sharingToId || shareState.type === 'loading'}
              className="w-full rounded-2xl border border-[#d7c7b4] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-[#8d6948] transition hover:border-[#c49a6c] hover:bg-[#fff3e2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {shareState.type === 'loading'
                ? 'Sharing...'
                : shareNoteId
                  ? 'Share selected note'
                  : 'Select a note first'}
            </button>

            {shareState.message ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  shareState.type === 'success'
                    ? 'border border-[#dbe6cf] bg-[#f5faef] text-[#5f8750]'
                    : 'border border-[#f0d4d4] bg-[#fff5f5] text-[#a35d5d]'
                }`}
              >
                {shareState.message}
              </div>
            ) : null}

            {!friends.length ? (
              <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf9] p-4 text-sm text-[#8e8275]">
                Add friends first to share personal notes.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
