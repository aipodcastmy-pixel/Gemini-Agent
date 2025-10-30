
import React, { useEffect, useState } from 'react';
import { FileIcon } from './Icons';

interface CodeEditorProps {
  fileName: string | null;
  fileContent: string | undefined;
  onSave: (fileName: string, content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ fileName, fileContent, onSave }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(fileContent || '');
  }, [fileContent]);

  const handleSave = () => {
    if (fileName) {
      onSave(fileName, content);
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
        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
        >
          Save
        </button>
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
