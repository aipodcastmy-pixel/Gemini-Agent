import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChatMessage, SendMessagePayload } from '../types';
import Message from './Message';
import { SendIcon, BotIcon, PaperclipIcon, XIcon, SettingsIcon, PlusSquareIcon } from './Icons';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (payload: SendMessagePayload) => void;
  isLoading: boolean;
  agentActivity: string | null;
  commandHistory: string[];
  onNewTaskClick: () => void;
  onSettingsClick: () => void;
  isChatDisabled: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, agentActivity, commandHistory, onNewTaskClick, onSettingsClick, isChatDisabled }) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistoryIndex(commandHistory.length);
  }, [commandHistory.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const maxHeight = 200; // pixels
      textarea.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  // FIX: Refactored message sending logic to improve type safety and remove an `any` cast.
  const sendMessage = () => {
    if ((input.trim() || images.length > 0) && !isLoading && !isChatDisabled) {
      onSendMessage({ text: input.trim(), images });
      setInput('');
      setImages([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // FIX: Explicitly type `file` as `File` to fix a type error where it was inferred as 'unknown'.
      const imagePromises = files.map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(imagePromises).then(base64Images => {
        setImages(prev => [...prev, ...base64Images]);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }

    const isCursorAtStart = e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0;
    const isCursorAtEnd = e.currentTarget.selectionStart === input.length && e.currentTarget.selectionEnd === input.length;
    const hasMultipleLines = input.includes('\n');

    if (commandHistory.length > 0 && images.length === 0) {
      if (e.key === 'ArrowUp' && (!hasMultipleLines || isCursorAtStart)) {
        e.preventDefault();
        const newIndex = Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || '');
      } else if (e.key === 'ArrowDown' && (!hasMultipleLines || isCursorAtEnd)) {
        e.preventDefault();
        const newIndex = Math.min(commandHistory.length, historyIndex + 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] ?? '');
      }
    }
  };
  
  const placeholderText = isChatDisabled 
    ? "Chat is disabled. Open settings and select a Gemini model to continue."
    : "Ask the agent to do something...";


  return (
    <div className="bg-slate-800/50 rounded-lg flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BotIcon />
            <span>AI Agent</span>
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={onNewTaskClick} className="text-slate-400 hover:text-white transition-colors" title="New Task">
                <PlusSquareIcon />
            </button>
            <button onClick={onSettingsClick} className="text-slate-400 hover:text-white transition-colors" title="Settings">
                <SettingsIcon />
            </button>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <BotIcon />
            <h1 className="text-2xl font-bold mt-4">Gemini AI Agent</h1>
            <p className="mt-2 text-center">I can write code, search the web, and manage files. What can I help you with?</p>
          </div>
        )}
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 my-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-indigo-500">
                <BotIcon />
              </div>
              <div className="w-full max-w-[80%] rounded-lg p-3 bg-slate-700 flex items-center">
                 {agentActivity ? (
                    <p className="text-sm text-slate-300 animate-pulse">{agentActivity}</p>
                 ) : (
                    <>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse mr-2"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse mr-2 delay-150"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                    </>
                 )}
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700">
        {isChatDisabled && (
          <div className="text-center text-xs text-amber-400 mb-2 p-2 bg-amber-500/10 rounded-md">
            The current agent logic only supports Gemini models. Please open settings and select a Gemini model to enable chat.
          </div>
        )}
        <div className="bg-slate-700 rounded-xl border border-transparent focus-within:border-indigo-500 transition-colors">
            {images.length > 0 && (
                <div className="p-2 grid grid-cols-4 gap-2 border-b border-slate-600">
                    {images.map((img, index) => (
                        <div key={index} className="relative group">
                            <img src={img} alt={`preview ${index}`} className="w-full h-16 object-cover rounded-md"/>
                            <button 
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <XIcon />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-indigo-400 transition-colors"
              disabled={isChatDisabled}
            >
              <PaperclipIcon />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </button>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                className="flex-grow bg-transparent resize-none focus:outline-none text-slate-100 placeholder-slate-400 text-sm px-1"
                rows={1}
            />
            <button
                type="submit"
                disabled={isLoading || (!input.trim() && images.length === 0) || isChatDisabled}
                className="bg-indigo-600 rounded-full h-8 w-8 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
                <SendIcon />
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;