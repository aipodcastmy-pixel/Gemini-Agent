import { GoogleGenAI, Chat, FunctionDeclaration, Part } from '@google/genai';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import CodeEditor from './components/CodeEditor';
import FileExplorer from './components/FileExplorer';
import { useFileSystem } from './hooks/useFileSystem';
import { ChatMessage, MessageAuthor, SendMessagePayload } from './types';
import { SYSTEM_INSTRUCTION, customTools } from './constants';

const Resizer: React.FC<{ onMouseDown: (event: React.MouseEvent) => void }> = ({ onMouseDown }) => (
    <div
        onMouseDown={onMouseDown}
        className="flex-shrink-0 w-2 h-full cursor-col-resize bg-slate-800 hover:bg-indigo-600 transition-colors rounded mx-1"
    />
);

// Helper to convert data URL to blob-like object for the API
const dataUrlToToolPart = (dataUrl: string): Part => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    return { inlineData: { mimeType, data: base64Data } };
};


const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [agentActivity, setAgentActivity] = useState<string | null>(null);
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState<string>('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [panelSizes, setPanelSizes] = useState([25, 50, 25]);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);


    const { 
        files, 
        listFiles, 
        readFile, 
        writeFile, 
        getFileContent,
        loadFolder,
        isFolderLoaded,
        fsError,
        isApiSupported,
    } = useFileSystem();

    const chatRef = useRef<Chat | null>(null);

    const initializeChat = useCallback(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY is not set.");
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                author: MessageAuthor.AGENT,
                text: "ERROR: API_KEY is not configured. Please set the environment variable.",
            }]);
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ googleSearch: {} }, { functionDeclarations: customTools }],
            },
        });
    }, []);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingIndex === null || !containerRef.current) return;
            
            const containerWidth = containerRef.current.offsetWidth;
            const dxPercentage = (e.movementX / containerWidth) * 100;
    
            setPanelSizes(prevSizes => {
                const newSizes = [...prevSizes];
                const leftPanelIndex = draggingIndex;
                const rightPanelIndex = draggingIndex + 1;
                
                const totalSize = newSizes[leftPanelIndex] + newSizes[rightPanelIndex];
                let newLeftSize = newSizes[leftPanelIndex] + dxPercentage;
                
                newLeftSize = Math.max(10, Math.min(newLeftSize, totalSize - 10));
    
                const newRightSize = totalSize - newLeftSize;
                
                newSizes[leftPanelIndex] = newLeftSize;
                newSizes[rightPanelIndex] = newRightSize;
    
                return newSizes;
            });
        };
    
        const handleMouseUp = () => {
            setDraggingIndex(null);
            document.body.style.userSelect = '';
        };
    
        if (draggingIndex !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
        }
    
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingIndex]);

    const handleMouseDown = (index: number) => {
        setDraggingIndex(index);
    };

    const runJavascript = async (code: string): Promise<string> => {
        try {
            const result = new Function(code)();
            const stringResult = JSON.stringify(result, null, 2);
            return stringResult === undefined ? 'undefined' : stringResult;
        } catch (e) {
            const error = e as Error;
            return `Error: ${error.message}`;
        }
    };
    
    const readUrl = async (url: string): Promise<string> => {
        try {
            setAgentActivity(`Reading content from ${url}...`);
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                return `Error: Failed to fetch URL. Server responded with status ${response.status}. The website might be down or blocking access.`;
            }
    
            const htmlContent = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            doc.querySelectorAll('script, style').forEach(el => el.remove());
            
            let mainContent = doc.body.textContent || '';
    
            mainContent = mainContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s\s+/g, ' ').trim();
            
            if (!mainContent) {
                return `Error: Could not extract any readable content from the URL. It might be a video, an image, or a page that relies heavily on JavaScript.`;
            }
            
            const summary = mainContent.substring(0, 4000) + (mainContent.length > 4000 ? '...' : '');
            return `Successfully extracted content from ${url}:\n\n${summary}`;
    
        // FIX: Corrected the catch block syntax. The typo `_message` was replaced with `{` to form a valid catch block.
        } catch (e) {
            const error = e as Error;
            console.error(`Error fetching URL ${url}:`, error);
            return `Error: An exception occurred while trying to fetch the URL content. Message: ${error.message}`;
        }
    };

    const handleFileSelect = async (fileName: string) => {
        setActiveFile(fileName);
        try {
            const content = await getFileContent(fileName);
            setEditorContent(content);
        } catch (e) {
            console.error("Error reading file content:", e);
            setEditorContent("Error: could not read this file.");
        }
    };
    
    const handleSaveFile = async (fileName: string, content: string) => {
        await writeFile(fileName, content);
        setEditorContent(content); // Optimistic update
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            author: MessageAuthor.TOOL,
            text: `File '${fileName}' has been saved to your local disk.`,
            toolName: 'editor',
            toolArgs: { fileName },
            toolResult: 'Save successful'
        }]);
    };

    const handleNewFile = async () => {
        if (!isFolderLoaded) {
            alert("Please load a folder first before creating a new file.");
            return;
        }
        const fileName = prompt("Enter new file name:");
        if (fileName && !files.includes(fileName)) {
            await writeFile(fileName, ''); // This will also refresh the file list
            setActiveFile(fileName);
            setEditorContent('');
        } else if (fileName) {
            alert("A file with the same name already exists.");
        }
    };
    
    const executeTool = async (name: string, args: any) => {
        switch (name) {
            case 'listFiles':
                return await listFiles();
            case 'readFile':
                return await readFile(args.fileName);
            case 'writeFile':
                const result = await writeFile(args.fileName, args.content);
                if(activeFile === args.fileName) {
                    setEditorContent(args.content);
                }
                return result;
            case 'runJavascript':
                return await runJavascript(args.code);
            case 'readUrl':
                return await readUrl(args.url);
            default:
                return `Unknown tool: ${name}`;
        }
    }

    const handleSendMessage = (payload: SendMessagePayload) => {
        if (!chatRef.current) {
            initializeChat();
            if (!chatRef.current) return;
        }

        if (payload.text) {
          setCommandHistory(prev => [...prev, payload.text]);
        }

        setIsLoading(true);
        setAgentActivity('Thinking...');
        const userMessage: ChatMessage = { 
            id: Date.now().toString(), 
            author: MessageAuthor.USER, 
            text: payload.text, 
            images: payload.images 
        };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const processRequest = async () => {
                try {
                    console.groupCollapsed(`Processing user input: "${payload.text}"`);
                    console.log("Current chat history:", messages);
                    if (!chatRef.current) throw new Error("Chat not initialized");

                    const messageParts: Part[] = [];
                    if (payload.text) {
                        messageParts.push({ text: payload.text });
                    }
                    if (payload.images) {
                        for (const image of payload.images) {
                            messageParts.push(dataUrlToToolPart(image));
                        }
                    }

                    let currentResponse = await chatRef.current.sendMessage({ message: messageParts });

                    while (true) {
                        const functionCalls = currentResponse.functionCalls;
                        if (!functionCalls || functionCalls.length === 0) {
                            console.log("Model returned final text, no tool calls.");
                            break;
                        }
                        
                        console.log("Model requested tool calls:", functionCalls);

                        const functionResponseParts: any[] = [];
                        const toolMessages: ChatMessage[] = [];

                        for (const call of functionCalls) {
                            const activityText = call.name === 'googleSearch' 
                                ? 'Searching the web...' 
                                : `Using tool: ${call.name}...`;
                            setAgentActivity(activityText);

                            let result;
                            if (call.name === 'googleSearch') {
                                result = "OK, search results are available to the model.";
                                console.log("Acknowledging googleSearch.");
                            } else {
                                console.log(`Executing custom tool: ${call.name}`, call.args);
                                toolMessages.push({
                                    id: `${Date.now()}-${call.name}`,
                                    author: MessageAuthor.TOOL,
                                    text: `Executing tool ${call.name}...`,
                                    toolName: call.name,
                                    toolArgs: call.args
                                });
                                result = await executeTool(call.name, call.args);
                                console.log(`Tool ${call.name} result:`, result);
                            }
                            
                            functionResponseParts.push({
                                functionResponse: { name: call.name, response: { result } },
                            });
                        }

                        if (toolMessages.length > 0) {
                            setMessages(prev => [...prev, ...toolMessages]);
                        }

                        setAgentActivity('Processing tool results...');
                        console.log("Sending tool responses back to model:", functionResponseParts);
                        currentResponse = await chatRef.current.sendMessage({ message: functionResponseParts });
                    }

                    const finalText = currentResponse?.text ?? "Sorry, I could not process that request.";
                    console.log("Final agent response:", finalText);
                    const agentMessage: ChatMessage = { id: Date.now().toString() + '-agent', author: MessageAuthor.AGENT, text: finalText };
                    setMessages(prev => [...prev, agentMessage]);

                } catch (error) {
                    console.error("Error during conversation:", error);
                    console.groupCollapsed("Error details");
                    console.log("Last user input:", payload);
                    console.log("Chat history at time of error:", messages);
                    console.error("Original error object:", error);
                    console.groupEnd();

                    const errorMessage: ChatMessage = { id: Date.now().toString() + '-error', author: MessageAuthor.AGENT, text: "An error occurred. Please check the developer console for details." };
                    setMessages(prev => [...prev, errorMessage]);
                } finally {
                    setIsLoading(false);
                    setAgentActivity(null);
                    console.groupEnd();
                }
            };
            processRequest();
        }, 0);
    };

    return (
        <div className="h-screen w-screen p-4 flex bg-slate-900 font-sans" ref={containerRef}>
            <div style={{ flex: `0 0 ${panelSizes[0]}%` }} className="h-full min-w-0">
                <FileExplorer 
                    files={files} 
                    activeFile={activeFile} 
                    onFileSelect={handleFileSelect} 
                    onNewFile={handleNewFile}
                    onLoadFolder={loadFolder}
                    isFolderLoaded={isFolderLoaded}
                    isApiSupported={isApiSupported}
                    fsError={fsError}
                />
            </div>
            <Resizer onMouseDown={() => handleMouseDown(0)} />
            <div style={{ flex: `0 0 ${panelSizes[1]}%` }} className="h-full min-w-0">
                <CodeEditor fileName={activeFile} fileContent={editorContent} onSave={handleSaveFile} />
            </div>
            <Resizer onMouseDown={() => handleMouseDown(1)} />
            <div style={{ flex: `0 0 ${panelSizes[2]}%` }} className="h-full min-w-0">
                <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} agentActivity={agentActivity} commandHistory={commandHistory} />
            </div>
        </div>
    );
};

export default App;