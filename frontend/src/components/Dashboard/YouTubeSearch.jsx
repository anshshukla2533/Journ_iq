
import React, { useState, useRef, useEffect } from 'react';
import { searchYouTube } from '../../services/youtubeService';
import useAuth from '../../hooks/useAuth';

const YouTubeSearch = () => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const searchInputRef = useRef(null);
  
  
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

  // Note saving is handled via the draggable Save Note widget on the Dashboard

  return (
    <div className="bg-white shadow-lg rounded-xl w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900">YouTube Search</h2>
          </div>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <input
            ref={searchInputRef}
            type="text"
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            placeholder="Search YouTube videos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Searching
              </span>
            ) : 'Search'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 mx-6 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player and Thumbnails */}
      <div className={fullscreen ? "fixed inset-0 z-50 bg-black" : "p-6"}>
        {selectedVideo && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                title={selectedVideo.title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {!fullscreen && (
                <button
                  onClick={() => setFullscreen(true)}
                  className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Fullscreen
                </button>
              )}
            </div>
            {selectedVideo && (
              <h3 className="text-lg font-medium text-gray-900 mt-4">{selectedVideo.title}</h3>
            )}
          </div>
        )}

        {/* Thumbnail Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(video => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className={`group relative aspect-video rounded-lg overflow-hidden transition-transform hover:scale-105 ${
                selectedVideo?.id === video.id ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-2">
                <p className="text-white text-xs line-clamp-2">{video.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Exit Button */}
      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="fixed top-4 right-4 z-50 bg-white/90 text-black px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Fullscreen
        </button>
      )}
    </div>
  );
};

export default YouTubeSearch;
