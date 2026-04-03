import React from 'react';
import ToDoSidebar from '../components/todo/ToDoSidebar';

export default function TodoPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Todo List</h2>
          <p className="text-indigo-200">Organize your tasks and crush your goals.</p>
        </div>
      </div>
      <div className="glass-panel shadow-xl min-h-[600px] flex">
        <div className="w-full">
           <ToDoSidebar showAsMainContent={true} />
        </div>
      </div>
    </div>
  );
}
