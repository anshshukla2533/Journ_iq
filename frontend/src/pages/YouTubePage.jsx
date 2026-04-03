import React from 'react';
import YouTubeSearch from '../components/youtube/YouTubeSearch';
import DraggableSaveNote from '../components/notes/DraggableSaveNote';

export default function YouTubePage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">YouTube Search</h2>
          <p className="text-indigo-200">Find videos. Take notes. Learn faster.</p>
        </div>
      </div>
      <div className="glass-panel p-6 shadow-xl min-h-[500px]">
        <YouTubeSearch />
      </div>
      <DraggableSaveNote />
    </div>
  );
}
