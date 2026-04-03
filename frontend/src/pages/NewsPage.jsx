import React from 'react';
import { useOutletContext } from 'react-router-dom';
import NewsSection from '../components/news/NewsSection';
import DraggableSaveNote from '../components/notes/DraggableSaveNote';
import useNews from '../hooks/useNews';

export default function NewsPage() {
  const { news } = useNews();
  
  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Daily Insight</h2>
          <p className="text-indigo-200">Curated headlines and trends to fuel your thoughts.</p>
        </div>
      </div>
      <div className="glass-panel p-6 shadow-xl">
        <NewsSection news={news} />
      </div>
      <DraggableSaveNote />
    </div>
  );
}
