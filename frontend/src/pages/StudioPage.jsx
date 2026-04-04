import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { fetchYouTubeTranscript, searchYouTube } from '../services/youtubeService';
import notesService from '../services/notesService';
import aiService from '../services/aiService';
import { api, setAuthToken } from '../services/api';

const YOUTUBE_SCRIPT_ID = 'youtube-iframe-api';

function formatTimestamp(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  }

  return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function normalizeTranscriptOffset(offset) {
  if (!offset) return 0;
  return offset > 1000 ? offset / 1000 : offset;
}

function uniqueTranscriptSegments(segments = []) {
  const seen = new Set();
  return segments.filter((segment) => {
    const text = segment?.text?.replace(/\s+/g, ' ').trim();
    if (!text) return false;
    const key = `${Math.round(normalizeTranscriptOffset(segment.offset || 0))}:${text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sentenceCase(text) {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function titleFromSegment(text, fallback) {
  const cleaned = sentenceCase(String(text || '').replace(/[.?!,:;]+$/g, ''));
  if (!cleaned) return fallback;

  const words = cleaned.split(' ').filter(Boolean).slice(0, 6);
  if (!words.length) return fallback;
  const heading = words.join(' ');
  return heading.length > 56 ? `${heading.slice(0, 53)}...` : heading;
}

function formatTranscriptOutline(segments = []) {
  const cleaned = uniqueTranscriptSegments(segments);
  if (!cleaned.length) return '';

  const topicSize = 8;
  const subtopicSize = 4;
  const lines = [];

  for (let topicIndex = 0; topicIndex < cleaned.length; topicIndex += topicSize) {
    const topicSegments = cleaned.slice(topicIndex, topicIndex + topicSize);
    lines.push(`Topic ${Math.floor(topicIndex / topicSize) + 1}: ${titleFromSegment(topicSegments[0]?.text, 'Key idea')}`);

    for (let subIndex = 0; subIndex < topicSegments.length; subIndex += subtopicSize) {
      const subSegments = topicSegments.slice(subIndex, subIndex + subtopicSize);
      lines.push(`Subtopic ${Math.floor(topicIndex / topicSize) + 1}.${Math.floor(subIndex / subtopicSize) + 1}: ${titleFromSegment(subSegments[0]?.text, 'Supporting point')}`);
      subSegments.forEach((segment) => {
        lines.push(`- ${sentenceCase(segment.text)}`);
      });
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

function useYouTubePlayer(videoId, onTimeUpdate) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoId) {
      return undefined;
    }

    const setupPlayer = () => {
      if (!containerRef.current || !window.YT?.Player) {
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            const player = playerRef.current;
            if (!player) return;

            const interval = window.setInterval(() => {
              try {
                onTimeUpdate(player.getCurrentTime?.() || 0);
              } catch (_) {}
            }, 1000);

            player.__journiqInterval = interval;
          },
          onStateChange: () => {
            try {
              onTimeUpdate(playerRef.current?.getCurrentTime?.() || 0);
            } catch (_) {}
          },
        },
      });
    };

    if (window.YT?.Player) {
      setupPlayer();
    } else {
      const existingScript = document.getElementById(YOUTUBE_SCRIPT_ID);
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = YOUTUBE_SCRIPT_ID;
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }

      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        setupPlayer();
      };
    }

    return () => {
      const player = playerRef.current;
      if (player?.__journiqInterval) {
        clearInterval(player.__journiqInterval);
      }
      try {
        player?.destroy?.();
      } catch (_) {}
    };
  }, [videoId, onTimeUpdate]);

  const getCurrentTime = () => {
    try {
      return playerRef.current?.getCurrentTime?.() || 0;
    } catch {
      return 0;
    }
  };

  return { containerRef, getCurrentTime };
}

export default function StudioPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [query, setQuery] = useState('productivity techniques');
  const [results, setResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [noteId, setNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCaptions, setNoteCaptions] = useState('');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [captionsStatus, setCaptionsStatus] = useState('idle');
  const [noteTags, setNoteTags] = useState('');
  const [hasUserEditedNote, setHasUserEditedNote] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [studioNotes, setStudioNotes] = useState([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [friends, setFriends] = useState([]);
  const [sharingToId, setSharingToId] = useState('');
  const [shareState, setShareState] = useState({ type: 'idle', message: '' });
  const lastSavedPayloadRef = useRef('');
  const transcriptRequestedForRef = useRef('');
  const captionsPreferenceRef = useRef({});

  const { containerRef, getCurrentTime } = useYouTubePlayer(selectedVideo?.id, setCurrentTime);

  const currentTags = useMemo(
    () =>
      noteTags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [noteTags]
  );

  const recentStudioNotes = useMemo(
    () =>
      studioNotes.filter((note) =>
        selectedVideo?.title ? note.videoTitle === selectedVideo.title : true
      ),
    [selectedVideo?.title, studioNotes]
  );

  const runSearch = async (nextQuery = query) => {
    if (!nextQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const videos = await searchYouTube(nextQuery);
      setResults(videos);
      setSelectedVideo(videos[0] || null);
      if (!videos.length) {
        setSearchError('No videos found for that topic. Try a broader phrase.');
      }
    } catch (error) {
      setSearchError('Video search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    runSearch('productivity techniques');
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadNotes = async () => {
      const response = await notesService.getNotes(token, { limit: 20 });
      if (response.success) {
        setStudioNotes(response.data || []);
      }
    };

    const loadFriends = async () => {
      try {
        setAuthToken(token);
        const response = await api.get('/friends/list');
        setFriends(Array.isArray(response.data) ? response.data : []);
      } catch {
        setFriends([]);
      }
    };

    loadNotes();
    loadFriends();
  }, [token]);

  useEffect(() => {
    if (!selectedVideo) {
      setNoteId(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteCaptions('');
      setCaptionsEnabled(false);
      setCaptionsOpen(false);
      setCaptionsStatus('idle');
      setNoteTags('');
      setHasUserEditedNote(false);
      setSaveState('idle');
      return;
    }

    const matchingNote = studioNotes.find((note) => {
      const noteUrl = note.videoUrl || '';
      return noteUrl.includes(selectedVideo.id);
    });

    if (matchingNote) {
      const resolvedTags = Array.isArray(matchingNote.tags) ? matchingNote.tags.join(', ') : '';
      const rememberedCaptionsPreference = captionsPreferenceRef.current[selectedVideo.id];
      const resolvedCaptionsEnabled =
        typeof rememberedCaptionsPreference === 'boolean'
          ? rememberedCaptionsPreference
          : Boolean(matchingNote.captions);
      setNoteId(matchingNote.id || matchingNote._id || null);
      setNoteTitle(matchingNote.title || selectedVideo.title.slice(0, 72));
      setNoteContent(matchingNote.content || matchingNote.text || '');
      setNoteCaptions(matchingNote.captions || '');
      setCaptionsEnabled(resolvedCaptionsEnabled);
      setCaptionsOpen(Boolean(matchingNote.captions));
      setCaptionsStatus(matchingNote.captions ? 'saved' : 'idle');
      setNoteTags(resolvedTags);
      setHasUserEditedNote(false);
      setSaveState('saved');
      lastSavedPayloadRef.current = JSON.stringify({
          noteTitle: matchingNote.title || selectedVideo.title.slice(0, 72),
          noteContent: matchingNote.content || matchingNote.text || '',
          noteCaptions: matchingNote.captions || '',
          captionsEnabled: resolvedCaptionsEnabled,
          noteTags: resolvedTags,
          videoId: selectedVideo.id,
          videoTitle: selectedVideo.title,
        });
      return;
    }

    setNoteId(null);
    setNoteTitle(`${selectedVideo.title.slice(0, 72)}`);
    setNoteContent('');
    setNoteCaptions('');
    setCaptionsEnabled(false);
    setCaptionsOpen(false);
    setCaptionsStatus('idle');
    setNoteTags('');
    setHasUserEditedNote(false);
    setSaveState('idle');
    lastSavedPayloadRef.current = '';
  }, [selectedVideo, studioNotes]);

  const loadTranscriptForVideo = async (videoId, { force = false } = {}) => {
    if (!videoId) return;
    if (!force && noteCaptions.trim()) return;
    if (!force && transcriptRequestedForRef.current === videoId) return;

    transcriptRequestedForRef.current = videoId;
    setCaptionsStatus('loading');
    const transcriptData = await fetchYouTubeTranscript(videoId);
    const formattedTranscript = formatTranscriptOutline(transcriptData?.segments || []);

    if (formattedTranscript.trim()) {
      setNoteCaptions(formattedTranscript);
      setCaptionsOpen(true);
      setCaptionsStatus('fetched');
      return;
    }

    setCaptionsStatus('unavailable');
  };

  useEffect(() => {
    if (!selectedVideo?.id) {
      transcriptRequestedForRef.current = '';
      return;
    }

    loadTranscriptForVideo(selectedVideo.id);
  }, [selectedVideo?.id]);

  useEffect(() => {
    if (!token || !selectedVideo) return;
    if (!hasUserEditedNote && !noteId) return;
    const captionsForSave = captionsEnabled ? noteCaptions.trim() : '';
    if (!noteTitle.trim() && !noteContent.trim() && !captionsForSave) return;

    const payload = JSON.stringify({
      noteTitle,
      noteContent,
      noteCaptions: captionsForSave,
      captionsEnabled,
      noteTags,
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
    });

    if (payload === lastSavedPayloadRef.current) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSaveState('saving');

      const notePayload = {
        title: noteTitle.trim() || selectedVideo.title,
        content: noteContent.trim() || '',
        captions: captionsForSave || null,
        videoUrl: `https://www.youtube.com/watch?v=${selectedVideo.id}`,
        videoTitle: selectedVideo.title,
        tags: currentTags,
      };

      const response = noteId
        ? await notesService.updateNote(token, noteId, notePayload)
        : await notesService.createNote(token, notePayload);

      if (response.success && response.data) {
        const saved = response.data;
        setNoteId(saved.id || saved._id);
        setSaveState('saved');
        captionsPreferenceRef.current[selectedVideo.id] = captionsEnabled;
        lastSavedPayloadRef.current = payload;
        setStudioNotes((prev) => {
          const savedId = saved.id || saved._id;
          const next = prev.filter((item) => (item.id || item._id) !== savedId);
          return [saved, ...next];
        });
        if (captionsEnabled && captionsForSave) {
          setCaptionsStatus('saved');
        }
      } else {
        setSaveState('error');
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [token, selectedVideo, noteTitle, noteContent, noteCaptions, captionsEnabled, noteTags, noteId, currentTags, hasUserEditedNote]);

  const handleInsertTimestamp = () => {
    const stamp = formatTimestamp(getCurrentTime() || currentTime);
    const insertion = `[${stamp}] `;
    setHasUserEditedNote(true);
    setNoteContent((prev) => (prev ? `${prev}\n${insertion}` : insertion));
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiError('');
    try {
      const prompt = `
Video title: ${selectedVideo?.title || 'Unknown'}
Current timestamp: ${formatTimestamp(currentTime)}
Current notes:
${noteContent || 'No notes yet.'}

Question:
${aiQuestion}
      `.trim();

      const response = await aiService.sendMessage(prompt, token);
      const answer =
        response?.reply ||
        response?.message ||
        response?.data?.message ||
        response?.data?.reply ||
        'AI response received.';
      setAiAnswer(answer);
    } catch (error) {
      setAiError('AI help is not available right now. Check the backend AI route or provider key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleShareNote = async () => {
    if (!token || !noteId || !sharingToId) return;

    setShareState({ type: 'loading', message: '' });
    try {
      setAuthToken(token);
      await api.post('/noteShare/share', { noteId, userId: sharingToId });
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
          sharedNoteId: noteId,
          sharedNoteTitle: noteTitle || selectedVideo?.title || 'Study note',
          draftMessage: `I just shared my notes on ${selectedVideo?.title || 'this video'}.`,
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
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6 text-[var(--text-primary)]">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdf9_0%,#f8f1e6_48%,#f5edde_100%)] p-5 shadow-[0_18px_60px_rgba(122,92,56,0.08)] md:p-6">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#d9b88c]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#b7c39a]/18 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-xl space-y-2">
            <span className="inline-flex items-center rounded-full border border-[#dfc7a8] bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9b7651]">
              Watch Studio
            </span>
            <h1 className="font-['Sora'] text-2xl font-semibold leading-tight text-[#2f2720] md:text-3xl">
              Learn without the clutter.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-[#6b6258]">
              Search, watch, take notes, and share. Nothing extra in the way.
            </p>
          </div>

          <form
            className="flex w-full max-w-2xl flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch();
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tutorials, lectures, explainers..."
              className="min-w-0 flex-1 rounded-2xl border border-[#e7dac7] bg-white/90 px-5 py-4 text-sm text-[#2f2720] shadow-sm outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-2xl bg-[#b88455] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(184,132,85,0.28)] transition hover:bg-[#a97546] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSearching ? 'Searching...' : 'Search videos'}
            </button>
          </form>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.92fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_18px_50px_rgba(87,66,43,0.08)]">
            <div className="border-b border-[#f0e6d8] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Now Playing</p>
                  <h2 className="mt-1 font-['Sora'] text-xl font-semibold text-[#2f2720]">
                    {selectedVideo?.title || 'Pick a video to begin'}
                  </h2>
                </div>
                <div className="rounded-full bg-[#f7f1e7] px-4 py-2 text-sm font-medium text-[#7c6a56]">
                  {formatTimestamp(currentTime)}
                </div>
              </div>
            </div>

            <div className="aspect-video bg-[#f8f2e8]">
              {selectedVideo ? (
                <div ref={containerRef} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-[#7e7468]">
                  Search for a video and it will open here.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <p className="text-sm font-medium text-[#5d544a]">
                {selectedVideo?.channel || 'Your selected creator will appear here'}
              </p>
              <button
                type="button"
                onClick={handleInsertTimestamp}
                disabled={!selectedVideo}
                className="rounded-2xl border border-[#e4d6c3] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold text-[#8d6948] transition hover:border-[#c49a6c] hover:bg-[#fff6eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Insert timestamp
              </button>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_50px_rgba(87,66,43,0.08)]">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Live Notes</p>
                <h3 className="mt-1 font-['Sora'] text-lg font-semibold text-[#2f2720]">Autosaving workspace</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  saveState === 'saving'
                    ? 'bg-[#fff0da] text-[#a96c24]'
                    : saveState === 'saved'
                      ? 'bg-[#eef7ea] text-[#5f8750]'
                      : saveState === 'error'
                        ? 'bg-[#fff1f1] text-[#b15f5f]'
                        : 'bg-[#f4efe7] text-[#8e7961]'
                }`}
              >
                {saveState === 'saving'
                  ? 'Saving...'
                  : saveState === 'saved'
                    ? 'Saved'
                    : saveState === 'error'
                      ? 'Save failed'
                      : 'Ready'}
              </span>
            </div>

            <div className="space-y-4">
              <input
                value={noteTitle}
                onChange={(event) => {
                  setHasUserEditedNote(true);
                  setNoteTitle(event.target.value);
                }}
                placeholder="Note title"
                className="w-full rounded-2xl border border-[#e7dac7] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
              />
              <textarea
                value={noteContent}
                onChange={(event) => {
                  setHasUserEditedNote(true);
                  setNoteContent(event.target.value);
                }}
                placeholder="Capture insights while the video is playing..."
                className="min-h-[280px] w-full rounded-[1.5rem] border border-[#e7dac7] bg-[#fffdf9] px-4 py-4 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
              />
              <div className="rounded-2xl border border-[#efe3d4] bg-[#fffaf2] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#6a5a47]">Captions</p>
                    <p className="text-xs text-[#8f7d68]">
                        {captionsStatus === 'loading'
                          ? 'Fetching transcript from YouTube...'
                          : captionsStatus === 'unavailable'
                            ? 'No transcript came back for this video yet.'
                          : noteCaptions.trim()
                            ? captionsEnabled
                              ? 'Formatted transcript headings will be saved with this note.'
                              : 'Transcript is ready locally. Turn on save if you want to keep it.'
                            : 'Keep this hidden unless you need transcript lines.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadTranscriptForVideo(selectedVideo?.id, { force: true })}
                      disabled={!selectedVideo?.id || captionsStatus === 'loading'}
                      className="rounded-full border border-[#e2d2bf] px-3 py-1 text-xs font-semibold text-[#8d6948] transition hover:border-[#c49a6c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {captionsStatus === 'loading' ? 'Loading...' : 'Retry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptionsOpen((prev) => !prev)}
                      className="rounded-full border border-[#e2d2bf] px-3 py-1 text-xs font-semibold text-[#8d6948] transition hover:border-[#c49a6c]"
                    >
                      {captionsOpen ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-[1.1rem] border border-[#eadfce] bg-white/70 px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b7651]">Save captions</p>
                    <p className="mt-1 text-xs text-[#8f7d68]">Choose whether transcript headings should be stored with the note.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !captionsEnabled;
                      if (selectedVideo?.id) {
                        captionsPreferenceRef.current[selectedVideo.id] = next;
                      }
                      setCaptionsEnabled(next);
                      setHasUserEditedNote(true);
                      if (next && noteCaptions.trim()) {
                        setCaptionsStatus('fetched');
                      }
                    }}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      captionsEnabled
                        ? 'bg-[#eef7ea] text-[#5f8750]'
                        : 'bg-[#f4efe7] text-[#8e7961]'
                    }`}
                  >
                    {captionsEnabled ? 'Saving on' : 'Saving off'}
                  </button>
                </div>
                {captionsOpen ? (
                  <textarea
                    value={noteCaptions}
                    onChange={(event) => {
                      if (captionsEnabled) {
                        setHasUserEditedNote(true);
                      }
                      setNoteCaptions(event.target.value);
                      setCaptionsStatus(captionsEnabled ? 'fetched' : 'idle');
                    }}
                    placeholder="Readable transcript headings will appear here..."
                    className="mt-3 min-h-[110px] w-full rounded-[1.35rem] border border-[#e7dac7] bg-[#fffdf9] px-4 py-3 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#efe3d4] bg-[#fffaf2] px-4 py-3 text-xs font-medium text-[#8f7d68]">
                <span>{noteTags.trim() ? `Tags: ${noteTags}` : 'Add tags later if you need them.'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setHasUserEditedNote(true);
                    setNoteTags((prev) => (prev ? '' : 'study, revision'));
                  }}
                  className="rounded-full border border-[#e2d2bf] px-3 py-1 font-semibold text-[#8d6948] transition hover:border-[#c49a6c]"
                >
                  {noteTags.trim() ? 'Clear tags' : 'Add tags'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.6rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdf8_0%,#f8f1e6_100%)] p-5 shadow-[0_18px_50px_rgba(87,66,43,0.08)]">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Quick Help</p>
                <h3 className="mt-1 font-['Sora'] text-base font-semibold text-[#2f2720]">Ask AI</h3>
              </div>
              <div className="space-y-3">
                <textarea
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  placeholder="Ask only if you are stuck..."
                  className="min-h-[96px] w-full rounded-[1.25rem] border border-[#e7dac7] bg-white/80 px-4 py-3 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
                />
                <button
                  type="button"
                  onClick={handleAskAi}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="w-full rounded-2xl bg-[#7f9a5c] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(127,154,92,0.25)] transition hover:bg-[#718c4f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {aiLoading ? 'Thinking...' : 'Ask AI'}
                </button>
                {aiError ? (
                  <div className="rounded-2xl border border-[#f0d4d4] bg-[#fff5f5] px-4 py-3 text-sm text-[#a35d5d]">
                    {aiError}
                  </div>
                ) : null}
                {aiAnswer ? (
                  <div className="rounded-[1.25rem] border border-[#eadfce] bg-white/75 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#4c4339]">{aiAnswer}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_50px_rgba(87,66,43,0.06)]">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a2805c]">Share</p>
                <h3 className="mt-1 font-['Sora'] text-base font-semibold text-[#2f2720]">Send this note</h3>
              </div>

              <div className="space-y-3">
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
                  onClick={handleShareNote}
                  disabled={!noteId || !sharingToId || shareState.type === 'loading'}
                  className="w-full rounded-2xl border border-[#d7c7b4] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-[#8d6948] transition hover:border-[#c49a6c] hover:bg-[#fff3e2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {shareState.type === 'loading'
                    ? 'Sharing...'
                    : noteId
                      ? 'Share saved note'
                      : 'Save a note before sharing'}
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
                    Add friends first to share notes from the studio.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
