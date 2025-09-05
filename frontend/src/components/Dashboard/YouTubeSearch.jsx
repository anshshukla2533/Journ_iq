
import React, { useState, useRef, useEffect } from 'react';
import { searchYouTube } from '../../services/youtubeService';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';

const YouTubeSearch = () => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [note, setNote] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight - 200 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);


  useEffect(() => {
    const handleMouseMove = e => {
      if (dragging) {
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - 180, e.clientY - dragOffset.current.y)),
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setError(null);
    setSelectedVideo(null);
    try {
      const videos = await searchYouTube(query);
      setResults(videos);
      if (videos.length === 0) {
        setError('No videos found. Try a different search or check your connection.');
      } else {
        setSelectedVideo(videos[0]);
      }
    } catch (err) {
      setError('Failed to fetch YouTube videos. Please try again.');
    }
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!note.trim() || !selectedVideo) return;
    setSaveMsg('');
    try {
      const res = await notesService.createNote(token, { text: note + ` (YouTube: ${selectedVideo.title})` });
      if (!res.success) throw new Error('Failed to save note');
      setSaveMsg('Note saved!');
      setNote('');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch {
      setSaveMsg('Failed to save note.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-100 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl p-4 md:p-8 w-full max-w-6xl mx-auto mt-10 border border-red-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">📺</span>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">YouTube Search</h2>
      </div>
      <form onSubmit={handleSearch} className="flex mb-8 gap-0.5">
        <input
          type="text"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-l-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none text-lg shadow-sm"
          placeholder="Search YouTube videos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-8 py-3 bg-red-600 text-white rounded-r-2xl text-lg font-semibold hover:bg-red-700 transition shadow-sm"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && (
        <div className="text-red-500 text-center py-8 text-lg">{error}</div>
      )}
      <div className={fullscreen ? "fixed inset-0 z-30 flex flex-col items-center justify-center bg-black" : "relative w-full flex flex-col md:flex-row gap-8 items-start justify-center"}>
        {selectedVideo && (
          <div className={fullscreen ? "w-full h-full flex items-center justify-center" : "flex-1 flex flex-col items-center"}>
            <div className={fullscreen ? "w-full h-full" : "w-full aspect-video max-h-[60vh] mb-4"} style={fullscreen ? {minHeight: '100vh', minWidth: '100vw'} : {}}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={fullscreen ? "w-full h-full" : "w-full h-full rounded-2xl"}
                style={fullscreen ? {minHeight: '100vh', minWidth: '100vw'} : {}}
              ></iframe>
              {!fullscreen && (
                <button
                  className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded shadow hover:bg-black z-20"
                  style={{zIndex: 20}}
                  onClick={() => setFullscreen(true)}
                >
                  Fullscreen
                </button>
              )}
              {fullscreen && (
                <button
                  className="fixed top-4 right-4 bg-white/80 text-black px-4 py-2 rounded shadow hover:bg-white z-50"
                  style={{zIndex: 50}}
                  onClick={() => setFullscreen(false)}
                >
                  Exit Fullscreen
                </button>
              )}
            </div>
          </div>
        )}
        {/* Thumbnails below video */}
        <div className={fullscreen ? "absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-4 justify-center z-40" : "flex flex-wrap gap-4 justify-center mt-6"}>
          {results.map(video => (
            <img
              key={video.id}
              src={video.thumbnail}
              alt={video.title}
              className={`w-32 h-20 object-cover rounded-lg cursor-pointer border-2 ${selectedVideo && selectedVideo.id === video.id ? 'border-red-600' : 'border-transparent'}`}
              onClick={() => setSelectedVideo(video)}
              title={video.title}
            />
          ))}
        </div>
        {/* Removed draggable floating note input to avoid duplicate note widgets. */}
      </div>
    </div>
  );
};

export default YouTubeSearch;
