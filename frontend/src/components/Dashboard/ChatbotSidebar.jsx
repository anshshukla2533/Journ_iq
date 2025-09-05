import React, { useState } from 'react';
import axios from 'axios';

const SEARCH_API_URL = '/api/notes/search';

const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';

const ChatbotSidebar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [webResults, setWebResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('notes'); // 'notes' or 'web'
  const [webModal, setWebModal] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setWebResults([]);
    try {
      if (mode === 'notes') {
        const res = await axios.get(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}`);
        setResults(Array.isArray(res.data) ? res.data : []);
      } else {
        // Wikipedia search API fallback
        try {
          const res = await axios.get(WIKI_API_URL, {
            params: {
              action: 'query',
              list: 'search',
              srsearch: query,
              format: 'json',
              origin: '*',
            },
          });
          const results = res.data.query && res.data.query.search ? res.data.query.search : [];
          setWebResults(results);
        } catch (err) {
          setWebResults([]);
        }
      }
    } catch (err) {
      setResults([]);
      setWebResults([]);
    }
    setLoading(false);
  };

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-screen flex flex-col p-4 shadow-lg fixed right-0 top-0 z-40" style={{ minHeight: '100vh', pointerEvents: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chatbot Assistant</h2>
        {onClose && (
          <button
            className="ml-2 px-2 py-1 text-gray-500 hover:text-red-600 text-lg font-bold rounded transition"
            onClick={onClose}
            aria-label="Close Chatbot"
          >
            ×
          </button>
        )}
      </div>
      <div className="flex mb-2">
        <button
          className={`flex-1 px-2 py-1 rounded-l ${mode === 'notes' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setMode('notes')}
        >
          Notes
        </button>
        <button
          className={`flex-1 px-2 py-1 rounded-r ${mode === 'web' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setMode('web')}
        >
          Web
        </button>
      </div>
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
          placeholder={mode === 'notes' ? 'Search your notes...' : 'Search the web...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition"
          disabled={loading || !query.trim()}
        >
          {loading ? '...' : 'Go'}
        </button>
      </form>
      <div className="flex-1 overflow-y-auto">
        {mode === 'notes' && !loading && results.length === 0 && query.trim() && (
          <div className="text-gray-500 text-center">No notes found.</div>
        )}
        {mode === 'notes' && results.length > 0 && (
          <ul>
            {results.map(note => (
              <li key={note._id} className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded shadow">
                <div className="text-gray-900 dark:text-gray-100">{note.text}</div>
                <div className="text-xs text-gray-500 mt-1">{note.date || note.createdAt}</div>
              </li>
            ))}
          </ul>
        )}
        {mode === 'web' && !loading && webResults.length === 0 && query.trim() && (
          <div className="text-red-500 text-center">No web results found or search failed.</div>
        )}
        {mode === 'web' && webResults.length > 0 && (
          <ul>
            {webResults.map((item, idx) => (
              <li key={idx} className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded shadow">
                <div className="text-blue-700 dark:text-blue-300 font-medium hover:underline cursor-pointer" onClick={() => setWebModal({ title: item.title, snippet: item.snippet && item.snippet.replace(/<[^>]+>/g, '') })}>
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">{item.snippet && item.snippet.replace(/<[^>]+>/g, '')}</div>
              </li>
            ))}
          </ul>
        )}
        {/* Web search modal overlay */}
        {webModal && (
          <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xl w-full relative">
              <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600" onClick={() => setWebModal(null)}>×</button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{webModal.title}</h2>
              <div className="text-gray-700 dark:text-gray-200">{webModal.snippet}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatbotSidebar;
