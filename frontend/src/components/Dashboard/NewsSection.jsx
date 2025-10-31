import React, { useState } from 'react'
import useAuth from '../../hooks/useAuth';


const NewsSection = ({ news }) => {
  const { token } = useAuth();
  const [modalArticle, setModalArticle] = useState(null);
  // Note saving is handled via the draggable Save Note widget on the Dashboard

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Latest Education News</h2>
      {news.length > 0 ? (
        <ul className="space-y-3">
          {news.map((article, index) => (
            <li key={index} className="border-b pb-3 last:border-b-0">
              <div
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 cursor-pointer"
                onClick={() => setModalArticle(article)}
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter') setModalArticle(article); }}
              >
                {article.title}
              </div>
              {article.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {article.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No news articles found.</p>
        </div>
      )}

      {/* Modal overlay for news article */}
      {modalArticle && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xl w-full relative">
            <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600" onClick={() => { setModalArticle(null); setNote(''); setSaveMsg(''); }}>×</button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{modalArticle.title}</h2>
            {modalArticle.description && (
              <div className="text-gray-700 dark:text-gray-200 mb-4">{modalArticle.description}</div>
            )}
            {modalArticle.link && (
              <a href={modalArticle.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Read full article ↗</a>
            )}
            <div className="mt-6">
              <div className="text-sm text-gray-600">To save a note about this article, use the draggable "Save a Note" widget on the dashboard (drag it where you like) — it will attach the article title automatically when you save.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsSection