import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import notesService from '../services/notesService';
import { api, setAuthToken } from '../services/api';

function highlightText(text, query) {
  if (!query.trim() || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-[#fff1cf] px-1 text-[#7b5b36]">
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchState, setSearchState] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setUsers([]);
      setNotes([]);
      setSearchState('idle');
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSearchState('searching');
    setError('');

    const timeout = window.setTimeout(async () => {
      try {
        setAuthToken(token);
        const [usersResponse, notesResponse] = await Promise.all([
          api.get('/friends/search', { params: { q: trimmed } }),
          notesService.getNotes(token, { search: trimmed, limit: 12 }),
        ]);

        if (cancelled) return;

        const nextUsers = Array.isArray(usersResponse.data?.users) ? usersResponse.data.users : [];
        const nextNotes = notesResponse.success ? notesResponse.data || [] : [];

        setUsers(nextUsers);
        setNotes(nextNotes);
        setSearchState('done');
      } catch (searchError) {
        if (cancelled) return;
        setUsers([]);
        setNotes([]);
        setSearchState('error');
        setError('Search is unavailable right now. Please try again.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 320);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, token]);

  const totalResults = useMemo(() => users.length + notes.length, [users.length, notes.length]);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-8">
      <section className="rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdf9_0%,#f8f1e6_52%,#f5edde_100%)] p-6 shadow-[0_18px_60px_rgba(122,92,56,0.08)] md:p-8">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center rounded-full border border-[#dfc7a8] bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9b7651]">
            Global Search
          </span>
          <h1 className="font-['Sora'] text-3xl font-semibold leading-tight text-[#2f2720] md:text-4xl">
            Search notes and people in one place.
          </h1>
          <p className="text-sm leading-7 text-[#6b6258] md:text-base">
            Find saved notes, shared study material, and people across your JournIQ workspace.
          </p>
        </div>

        <div className="relative mt-6">
          <svg className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b38e68]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notes, names, email, username..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-[1.6rem] border border-[#e7dac7] bg-white/90 py-4 pl-14 pr-5 text-base text-[#2f2720] shadow-sm outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-white/80 px-3 py-1 font-medium text-[#7f6f5f]">
            {loading ? 'Searching...' : `${totalResults} results`}
          </span>
          <span className="text-[#8f7e6d]">Notes and people update as you type.</span>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-[#f0d4d4] bg-[#fff5f5] px-4 py-3 text-sm text-[#a35d5d]">
          {error}
        </div>
      ) : null}

      {!query.trim() ? (
        <div className="rounded-[1.75rem] border border-dashed border-[#eadfce] bg-[#fffdf9] px-6 py-14 text-center">
          <h3 className="font-['Sora'] text-xl font-semibold text-[#2f2720]">Start with a keyword</h3>
          <p className="mt-2 text-sm leading-7 text-[#7b7064]">
            Search by note title, note content, name, email, or username.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_50px_rgba(87,66,43,0.06)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Notes</p>
                <h2 className="mt-1 font-['Sora'] text-xl font-semibold text-[#2f2720]">Matching notes</h2>
              </div>
              <span className="rounded-full bg-[#f7f1e7] px-3 py-1 text-xs font-semibold text-[#8b7257]">
                {notes.length}
              </span>
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <button
                  key={note.id || note._id}
                  type="button"
                  onClick={() => navigate('/dashboard/notes')}
                  className="w-full rounded-[1.4rem] border border-[#efe3d4] bg-[#fffcf8] p-4 text-left transition hover:border-[#d7be9b] hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[#2f2720]">
                    {highlightText(note.title || 'Untitled note', query)}
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm leading-7 text-[#6f6459]">
                    {highlightText(note.content || note.text || '', query)}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-[#a08d79]">
                    {note.videoTitle ? `Video note: ${note.videoTitle}` : 'Personal note'}
                  </p>
                </button>
              ))}

              {!loading && searchState === 'done' && !notes.length ? (
                <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf9] p-5 text-sm text-[#8e8275]">
                  No notes matched this search.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_50px_rgba(87,66,43,0.06)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">People</p>
                <h2 className="mt-1 font-['Sora'] text-xl font-semibold text-[#2f2720]">Matching users</h2>
              </div>
              <span className="rounded-full bg-[#f7f1e7] px-3 py-1 text-xs font-semibold text-[#8b7257]">
                {users.length}
              </span>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id || user._id} className="rounded-[1.4rem] border border-[#efe3d4] bg-[#fffcf8] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#2f2720]">
                        {highlightText(user.name || 'Unnamed user', query)}
                      </p>
                      <p className="mt-1 text-sm text-[#6f6459]">{highlightText(user.email || '', query)}</p>
                      {user.username ? (
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#a08d79]">
                          @{highlightText(user.username, query)}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.online ? 'bg-[#eef7ea] text-[#5f8750]' : 'bg-[#f4efe7] text-[#8e7961]'
                      }`}
                    >
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}

              {!loading && searchState === 'done' && !users.length ? (
                <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf9] p-5 text-sm text-[#8e8275]">
                  No people matched this search.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
