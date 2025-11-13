import React, { useState } from 'react';

const LOCAL_STORAGE_KEY = 'todoList';

const ToDoSidebar = ({ showAsMainContent = true }) => {
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState('');

  const [reminder, setReminder] = useState('');

  const addTodo = () => {
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
    <div className="bg-white dark:bg-gray-900 flex flex-col p-4 w-full h-full rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage Your Tasks</h2>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          addTodo();
        }}
        className="flex flex-col gap-2 mb-4"
      >
        <div className="flex">
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            placeholder="Add a new task..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-1 bg-green-600 text-white rounded-r hover:bg-green-700 transition"
            disabled={!input.trim()}
          >
            Add
          </button>
        </div>
        <input
          type="datetime-local"
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
          value={reminder}
          onChange={e => setReminder(e.target.value)}
          placeholder="Set reminder (optional)"
        />
      </form>
      <div className="flex-1 overflow-y-auto">
        {todos.length === 0 && (
          <div className="text-gray-500 text-center">No tasks yet.</div>
        )}
        <ul>
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded shadow">
              <div className="flex-1 flex flex-col">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="form-checkbox h-5 w-5 text-green-600"
                  />
                  <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                    {todo.text}
                  </span>
                </label>
                {todo.reminder && (
                  <span className="text-xs text-blue-500 mt-1">⏰ Reminder: {new Date(todo.reminder).toLocaleString()}</span>
                )}
              </div>
              <button
                className="ml-2 px-2 py-1 text-red-500 hover:text-red-700 text-lg font-bold rounded transition"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ToDoSidebar;
