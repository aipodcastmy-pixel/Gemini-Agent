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

const HelperText: React.FC<{ title?: string, children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`flex flex-col items-center justify-center h-full text-center text-slate-400 px-4 ${className}`}>
        <div className="text-sm">
            {title && <h3 className="font-bold text-amber-400 mb-2 text-base">{title}</h3>}
            <div className="text-slate-400 leading-relaxed">{children}</div>
        </div>
    </div>
);


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
  
  const renderContent = () => {
    if (fsError) {
        return <HelperText className="text-red-400">{fsError}</HelperText>;
    }
    
    if (files.length > 0) {
        return (
            <ul className="overflow-y-auto -mr-2 pr-2 h-full">
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
        );
    }
    
    if (isFolderLoaded) {
        return <HelperText>The selected folder is empty.</HelperText>;
    }
    
    if (!isApiSupported) {
        return (
            <HelperText title="Virtual Mode">
                <p>
                    Local folder access is not supported.
                </p>
                <p className="mt-1">
                    Click "New" to create a temporary file.
                </p>
            </HelperText>
        );
    }
    
    return (
        <HelperText>
            <p>Click "Load" to select a folder, or "New" to create a temporary virtual file.</p>
        </HelperText>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 gap-2 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-200 truncate">File System</h2>
        </div>
        <div className="flex gap-1 items-center flex-shrink-0">
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
      <div className="flex-grow min-h-0 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default FileExplorer;