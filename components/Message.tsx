import React from 'react';
import { ChatMessage, MessageAuthor, ToolMessage, UserMessage } from '../types';
import { BotIcon, UserIcon, ToolIcon } from './Icons';

interface MessageProps {
  message: ChatMessage;
}

// Add global declarations for CDN-loaded libraries
declare global {
  interface Window {
    marked: {
      parse: (markdown: string, options?: any) => string;
    };
    DOMPurify: {
      sanitize: (html: string) => string;
    };
  }
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isAgent = message.author === MessageAuthor.AGENT;
  const isUser = message.author === MessageAuthor.USER;
  const isTool = message.author === MessageAuthor.TOOL;

  const authorName = isAgent ? 'Agent' : isUser ? 'You' : 'Tool';
  const AuthorIcon = isAgent ? BotIcon : isUser ? UserIcon : ToolIcon;
  const userMessage = message as UserMessage;

  const createMarkup = (text: string) => {
    if (message.author === MessageAuthor.USER) {
      // Sanitize user text to prevent any potential HTML injection, though we render it as text.
      // A simple text replacement is safer.
      const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return { __html: sanitizedText.replace(/\n/g, '<br />') };
    }

    if (window.marked && window.DOMPurify) {
      const rawMarkup = window.marked.parse(text, { gfm: true, breaks: true });
      const sanitizedMarkup = window.DOMPurify.sanitize(rawMarkup);
      return { __html: sanitizedMarkup };
    }
    
    return { __html: text.replace(/\n/g, '<br />') };
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isAgent ? 'bg-indigo-500' : isUser ? 'bg-slate-600' : 'bg-amber-500'
        }`}>
        <AuthorIcon />
      </div>
      <div className={`w-full max-w-[80%] rounded-lg p-3 ${isUser ? 'bg-indigo-600' : 'bg-slate-700'}`}>
        <div className="font-bold text-sm mb-2">{authorName}</div>
        
        {isUser && userMessage.images && userMessage.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {userMessage.images.map((img, index) => (
              <img key={index} src={img} alt={`user upload ${index}`} className="rounded-md object-cover w-full h-auto" />
            ))}
          </div>
        )}

        {isTool && (
            <div className="mb-2">
                <p className="text-xs font-mono text-slate-400">
                    Using tool: <span className="font-bold text-amber-300">{(message as ToolMessage).toolName}</span>
                </p>
                <pre className="text-xs font-mono bg-slate-800 p-2 rounded-md mt-1 overflow-x-auto text-slate-300">
                    {JSON.stringify((message as ToolMessage).toolArgs, null, 2)}
                </pre>
            </div>
        )}

        {message.text && (
          <div
            className="prose prose-sm prose-invert text-slate-200 max-w-full"
            dangerouslySetInnerHTML={createMarkup(message.text)}
          />
        )}
         
         {isTool && (message as ToolMessage).toolResult && (
            <div className="mt-2 pt-2 border-t border-slate-600">
                <p className="text-xs font-mono text-slate-400 mb-1">Tool result:</p>
                <pre className="text-xs font-mono bg-slate-800 p-2 rounded-md mt-1 overflow-x-auto text-slate-300">
                    {(message as ToolMessage).toolResult}
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};

export default Message;
