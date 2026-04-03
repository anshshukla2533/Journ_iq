import React, { useState } from 'react';

const NewsSection = ({ news = [], loading, error }) => {
  const [modalArticle, setModalArticle] = useState(null);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center justify-center text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {news?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div 
              key={index} 
              className="glass-card flex flex-col p-6 group cursor-pointer hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => setModalArticle(article)}
            >
              <div className="mb-4">
                <span className="px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/10 inline-block mb-3">Technology</span>
                <h3 className="text-lg font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-3">
                  {article.title}
                </h3>
              </div>
              <p className="text-gray-400 text-sm line-clamp-3 mb-6 mt-auto">
                {article.description || 'No description available for this article. Read the full story by clicking here.'}
              </p>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Recent</span>
                </div>
                <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 text-center border-dashed border-2 border-white/10 rounded-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No News Available</h3>
          <p className="text-gray-400 max-w-sm">We couldn't fetch the latest updates. Please check your connection or try again later.</p>
        </div>
      )}

      {modalArticle && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setModalArticle(null)}>
          <div className="bg-[#12182b] border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/20 rounded-full p-2 transition-colors" 
              onClick={() => setModalArticle(null)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-4 inline-block px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/20">
              Technology News
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white leading-tight">{modalArticle.title}</h2>
            {modalArticle.description && (
              <p className="text-gray-300 text-lg leading-relaxed mb-8">{modalArticle.description}</p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              {modalArticle.link && (
                <a 
                  href={modalArticle.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Read Full Article
                </a>
              )}
              <button 
                onClick={() => setModalArticle(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
              <div className="text-indigo-400 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-sm text-indigo-200/80 leading-relaxed font-medium">
                Want to save a quick thought about this? Use the <strong className="text-indigo-300">Quick Capture</strong> widget floating on your screen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
