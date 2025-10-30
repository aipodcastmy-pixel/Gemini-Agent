

import React, { useEffect, useState, useRef } from 'react';
import { FileIcon } from './Icons';

interface CodeEditorProps {
  fileName: string | null;
  fileContent: string | undefined;
  onSave: (fileName: string, content: string) => Promise<void>;
}

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

const CodeEditor: React.FC<CodeEditorProps> = ({ fileName, fileContent, onSave }) => {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  
  const debounceTimeout = useRef<number | null>(null);
  const statusTimeout = useRef<number | null>(null);

  useEffect(() => {
    setContent(fileContent || '');
    setSaveStatus('idle');
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (statusTimeout.current) clearTimeout(statusTimeout.current);
  }, [fileName, fileContent]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (statusTimeout.current) clearTimeout(statusTimeout.current);
    
    const hasUnsavedChanges = content !== fileContent && fileName !== null;

    if (!hasUnsavedChanges) {
      if (saveStatus !== 'saved') {
        setSaveStatus('idle');
      }
      return;
    }
    
    setSaveStatus('unsaved');

    debounceTimeout.current = window.setTimeout(async () => {
      if (fileName) {
        setSaveStatus('saving');
        await onSave(fileName, content);
        setSaveStatus('saved');

        statusTimeout.current = window.setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }
    }, 1500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      if (statusTimeout.current) clearTimeout(statusTimeout.current);
    };
  }, [content, fileName, fileContent, onSave]);

  const handleManualSave = async () => {
    if (fileName && saveStatus === 'unsaved') {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      if (statusTimeout.current) clearTimeout(statusTimeout.current);
      
      setSaveStatus('saving');
      await onSave(fileName, content);
      setSaveStatus('saved');
      
      statusTimeout.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };
  
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'unsaved':
        return <span className="text-xs text-amber-400">Unsaved</span>;
      case 'saving':
        return <span className="text-xs text-slate-400 animate-pulse">Saving...</span>;
      case 'saved':
        return <span className="text-xs text-green-400">Saved</span>;
      default:
        return <span className="text-xs w-14">&nbsp;</span>; // Placeholder for alignment
    }
  };

  if (!fileName) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col h-full items-center justify-center">
        <p className="text-slate-400">Select a file to view or edit.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b border-slate-700">
        <div className="flex items-center font-mono text-sm">
          <FileIcon />
          <span className="ml-1 text-slate-200">{fileName}</span>
        </div>
        <div className="flex items-center gap-4">
          {renderSaveStatus()}
          <button
            onClick={handleManualSave}
            disabled={saveStatus !== 'unsaved'}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex-grow p-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent text-slate-200 font-mono resize-none focus:outline-none p-3 text-sm leading-relaxed"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeEditor;