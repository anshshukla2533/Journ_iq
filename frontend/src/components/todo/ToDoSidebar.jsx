import React, { useState } from 'react';

const LOCAL_STORAGE_KEY = 'todoList';

const ToDoSidebar = ({ showAsMainContent = false }) => {
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState('');
  const [reminder, setReminder] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTodos = [
      { id: Date.now(), text: input.trim(), completed: false, reminder: reminder || null },
      ...todos,
    ];
    setTodos(newTodos);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTodos));
    setInput('');
    setReminder('');
  };

  const toggleTodo = (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTodos));
  };

  const deleteTodo = (id) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTodos));
  };

  return (
    <div className={`flex flex-col h-full w-full ${showAsMainContent ? 'p-8' : 'p-6 bg-[#0a0f1e]/80 backdrop-blur-md border-l border-white/5'}`}>
      {!showAsMainContent && (
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          Tasks
        </h2>
      )}

      <form onSubmit={addTodo} className="flex flex-col gap-3 mb-8">
        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            placeholder="What needs to be done?"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim()}
          >
            Add
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="datetime-local"
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-colors"
              value={reminder}
              onChange={e => setReminder(e.target.value)}
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {todos.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-3 text-white/5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map(todo => (
              <li 
                key={todo.id} 
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  todo.completed 
                    ? 'bg-white/5 border-transparent opacity-50' 
                    : 'bg-[#12182b] border-white/10 shadow-lg hover:border-indigo-500/30'
                }`}
              >
                <div className="pt-0.5">
                  <label className="relative flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors">
                      <svg className={`w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </label>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm md:text-base break-words ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                    {todo.text}
                  </p>
                  {todo.reminder && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${todo.completed ? 'text-gray-600' : 'text-orange-400'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(todo.reminder).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                
                <button
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ToDoSidebar;
