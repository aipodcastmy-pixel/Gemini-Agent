

import React from 'react';
import { FileIcon, PlusIcon, FolderIcon } from './Icons';

interface FileExplorerProps {
  files: string[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onNewFile: () => void;
  onLoadFolder: () => void;
  isFolderLoaded: boolean;
  isApiSupported: boolean;
  fsError: string | null;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  activeFile, 
  onFileSelect, 
  onNewFile, 
  onLoadFolder, 
  isFolderLoaded,
  isApiSupported,
  fsError,
}) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-bold text-slate-200">File System</h2>
        <div className="flex gap-2">
          {isApiSupported && (
             <button
              onClick={onLoadFolder}
              className="flex items-center px-3 py-1.5 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm"
            >
              <FolderIcon />
              Load
            </button>
          )}
          <button
            onClick={onNewFile}
            disabled={!isFolderLoaded}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon />
            New
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        {!isApiSupported ? (
            <p className="text-amber-400 text-sm mt-2">Your browser doesn't support the File System Access API. Please use Chrome or Edge.</p>
        ) : fsError ? (
            <p className="text-red-400 text-sm mt-2">{fsError}</p>
        ) : !isFolderLoaded ? (
            <p className="text-slate-400 text-sm mt-2">Click "Load" to select a folder from your PC to manage its files.</p>
        ) : files.length === 0 ? (
          <p className="text-slate-400 text-sm mt-2">The selected folder is empty.</p>
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