import React from 'react';
import { FileIcon, PlusIcon, FolderIcon, ChevronLeftIcon } from './Icons';

interface FileExplorerProps {
  files: string[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onNewFile: () => void;
  onLoadFolder: () => void;
  isFolderLoaded: boolean;
  isApiSupported: boolean;
  fsError: string | null;
  onToggleVisibility: () => void;
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
  onToggleVisibility
}) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-bold text-slate-200">File System</h2>
        <div className="flex gap-1 items-center">
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
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <PlusIcon />
            New
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-1.5 text-slate-400 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
            title="Hide File Explorer"
          >
            <ChevronLeftIcon />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        {fsError ? (
            <p className="text-red-400 text-sm mt-2">{fsError}</p>
        ) : files.length > 0 ? (
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
        ) : isFolderLoaded ? (
          <p className="text-slate-400 text-sm mt-2">The selected folder is empty.</p>
        ) : !isApiSupported ? (
          <p className="text-amber-400 text-sm mt-2">Virtual mode: Local folder access is not supported. Click "New" to create a temporary file.</p>
        ) : (
          <p className="text-slate-400 text-sm mt-2">Click "Load" to select a folder, or "New" to create a temporary virtual file.</p>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;