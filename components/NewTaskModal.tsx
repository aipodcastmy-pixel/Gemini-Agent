import React, { useState } from 'react';
import { XIcon } from './Icons';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTask: (task: { title: string; description: string }) => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onStartTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onStartTask({ title, description });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100">Create New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-slate-300 mb-1">
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 'Research Q3 market trends'"
                required
              />
            </div>
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium text-slate-300 mb-1">
                Task Description (Optional)
              </label>
              <textarea
                id="task-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Provide a detailed description or the initial prompt for the agent..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
