
import React from 'react';
import { FileIcon, PlusIcon } from './Icons';

interface FileExplorerProps {
  files: string[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onNewFile: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onFileSelect, onNewFile }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200">File System</h2>
        <button
          onClick={onNewFile}
          className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
        >
          <PlusIcon />
          New
        </button>
      </div>
      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        {files.length === 0 ? (
          <p className="text-slate-400 text-sm mt-2">No files yet.</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file}>
                <button
                  onClick={() => onFileSelect(file)}
                  className={`w-full text-left flex items-center px-3 py-2 rounded-md transition-colors text-sm ${
                    activeFile === file
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <FileIcon />
                  <span className="truncate">{file}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
