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
  const [fullscreen, setFullscreen] = useState(false);

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
        setError('No videos found. Try a different search.');
      } else {
        setSelectedVideo(videos[0]);
      }
    } catch (err) {
      setError('Failed to fetch YouTube videos. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-[#12182b]/80 backdrop-blur-xl border border-red-500/20 shadow-lg shadow-red-500/10 rounded-3xl p-6 md:p-8 mb-8 sticky top-6 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">YouTube Search</h2>
              <p className="text-red-300/80 text-sm mt-1">Discover, learn, and capture notes</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity duration-300 -z-10"></div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-6 py-4 bg-[#0a0f1e] text-white border border-white/10 rounded-2xl pl-14 pr-32 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all placeholder-gray-500 font-medium"
              placeholder="Search for tutorials, music, podcasts..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-5 top-1/2 transform -translate-y-1/2 group-focus-within:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching</span>
                </>
              ) : 'Search'}
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full animate-fade-in">
        
        {error && (
          <div className="glass-panel border-red-500/30 bg-red-500/10 text-red-400 p-6 rounded-2xl mb-8 flex items-center justify-center gap-4 animate-slide-up mx-auto max-w-2xl">
            <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="font-semibold text-lg">{error}</p>
          </div>
        )}

        {!selectedVideo && !loading && !error && results.length === 0 && (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 mt-20">
            <div className="w-32 h-32 bg-[#12182b] border-2 border-dashed border-white/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-2">Explore the Web</h3>
            <p className="text-lg text-gray-400 max-w-md">Search for any topic and watch videos seamlessly within your workspace. Ideal for note-taking.</p>
          </div>
        )}

        <div className={`transition-all duration-500 ${fullscreen ? 'fixed inset-0 z-[100] bg-black' : 'flex flex-col xl:flex-row gap-8 w-full'}`}>
          
          {selectedVideo && (
            <div className={`xl:w-[70%] xl:shrink-0 flex flex-col space-y-6 ${fullscreen ? 'h-full p-4' : ''}`}>
              <div className="glass-card p-2 md:p-3 overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative">
                <div className={`bg-black rounded-2xl overflow-hidden relative ${fullscreen ? 'h-[calc(100vh-150px)]' : 'aspect-video'}`}>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                    title={selectedVideo.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  
                  {!fullscreen && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setFullscreen(true)}
                        className="bg-black/60 backdrop-blur-md text-white p-3 rounded-xl hover:bg-red-600 transition-colors tooltip shadow-lg"
                        title="Fullscreen mode"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {fullscreen && (
                  <div className="mt-4 flex justify-between items-center px-4">
                    <h3 className="text-xl font-bold text-white truncate max-w-4xl">{selectedVideo.title}</h3>
                    <button
                      onClick={() => setFullscreen(false)}
                      className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      Exit Fullscreen
                    </button>
                  </div>
                )}
              </div>
              
              {!fullscreen && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl mb-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 font-semibold text-xs uppercase tracking-widest rounded-full mb-4 border border-red-500/20">Now Playing</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{selectedVideo.title}</h3>
                  </div>
                  <div className="shrink-0">
                    <button className="btn-primary bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2" onClick={() => {
                      alert('Use the floating quick capture widget to save notes about this video!');
                    }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Take Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!fullscreen && results.length > 0 && (
            <div className={`xl:w-[30%] flex flex-col ${selectedVideo ? 'border-l border-white/5 pl-8 max-h-[1000px] overflow-y-auto custom-scrollbar pr-4' : 'w-full pb-20'}`}>
              <h3 className="text-xl font-bold text-white mb-6 sticky top-0 bg-[#0a0f1e] pt-2 pb-4 border-b border-white/10 z-10 flex items-center justify-between">
                <span>Recommendations</span>
                <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">{results.length} results</span>
              </h3>
              
              <div className={selectedVideo ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
                {results.map(video => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`group flex ${selectedVideo ? 'flex-row items-center gap-4' : 'flex-col'} text-left glass-card p-3 rounded-2xl transition-all duration-300 ${
                      selectedVideo?.id === video.id ? 'bg-white/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50 scale-[1.02]' : 'hover:scale-[1.02] hover:border-white/20'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden shrink-0 ${selectedVideo ? 'w-32 sm:w-40 aspect-video' : 'w-full aspect-video mb-4'} shadow-lg`}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${selectedVideo?.id === video.id ? 'scale-105' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
                        <div className="w-12 h-12 rounded-full bg-red-600 shadow-lg shadow-red-600/50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                      {selectedVideo?.id === video.id && (
                        <div className="absolute top-2 right-2 flex gap-1 items-center bg-black/60 px-2 py-1 rounded-md">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Playing</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className={`font-bold leading-tight group-hover:text-red-400 transition-colors ${selectedVideo ? 'text-sm line-clamp-3 text-white' : 'text-lg line-clamp-2 text-white mb-2'}`}>
                        {video.title}
                      </h4>
                      {selectedVideo && (
                         <p className="text-xs text-gray-500 mt-2 line-clamp-1">YouTube Video</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearch;
