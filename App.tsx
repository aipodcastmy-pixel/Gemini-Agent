import { GoogleGenAI, Chat, FunctionDeclaration, Part } from '@google/genai';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import CodeEditor from './components/CodeEditor';
import FileExplorer from './components/FileExplorer';
import { useFileSystem } from './hooks/useFileSystem';
import { ChatMessage, MessageAuthor, SendMessagePayload } from './types';
import { SYSTEM_INSTRUCTION, listFilesTool, readFileTool, runJavascriptTool, writeFileTool, readUrlTool } from './constants';

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


    const { files, listFiles, readFile, writeFile, getFileContent, setFiles } = useFileSystem([
        { name: 'instructions.txt', content: 'Welcome! Ask the AI to read this file.'}
    ]);

    const chatRef = useRef<Chat | null>(null);

    const initializeChat = useCallback(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY is not set.");
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                author: MessageAuthor.AGENT,
                text: "错误：API_KEY 未配置。请设置环境变量。",
            }]);
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const customTools: FunctionDeclaration[] = [listFilesTool, readFileTool, writeFileTool, runJavascriptTool, readUrlTool];
        
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
            return `错误: ${error.message}`;
        }
    };
    
    const readUrl = async (url: string): Promise<string> => {
        try {
            setAgentActivity(`正在读取 ${url} 的内容...`);
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                return `错误：无法获取 URL。服务器响应状态为 ${response.status}。网站可能已关闭或阻止访问。`;
            }
    
            const htmlContent = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            doc.querySelectorAll('script, style').forEach(el => el.remove());
            
            let mainContent = doc.body.textContent || '';
    
            mainContent = mainContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s\s+/g, ' ').trim();
            
            if (!mainContent) {
                return `错误：无法从 URL 提取任何可读内容。它可能是视频、图像或严重依赖 JavaScript 的页面。`;
            }
            
            const summary = mainContent.substring(0, 4000) + (mainContent.length > 4000 ? '...' : '');
            return `成功从 ${url} 提取内容：\n\n${summary}`;
    
        } catch (e) {
            const error = e as Error;
            console.error(`获取 URL ${url} 时出错:`, error);
            return `错误：尝试获取 URL 内容时发生异常。消息: ${error.message}`;
        }
    };

    const handleFileSelect = async (fileName: string) => {
        setActiveFile(fileName);
        const content = await getFileContent(fileName);
        setEditorContent(content || '');
    };
    
    const handleSaveFile = async (fileName: string, content: string) => {
        await writeFile(fileName, content);
        setEditorContent(content);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            author: MessageAuthor.TOOL,
            text: `文件 '${fileName}' 已保存。`,
            toolName: 'editor',
            toolArgs: { fileName },
            toolResult: '保存成功'
        }]);
    };

    const handleNewFile = () => {
        const fileName = prompt("输入新文件名:");
        if (fileName && !files.includes(fileName)) {
            writeFile(fileName, '');
            handleFileSelect(fileName);
        } else if (fileName) {
            alert("同名文件已存在。");
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
                return `未知工具: ${name}`;
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
        setAgentActivity('思考中...');
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
                    console.groupCollapsed(`处理用户输入: "${payload.text}"`);
                    console.log("当前会话历史:", messages);
                    if (!chatRef.current) throw new Error("聊天未初始化");

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
                            console.log("模型返回最终文本，无工具调用。");
                            break;
                        }
                        
                        console.log("模型请求工具调用:", functionCalls);

                        const functionResponseParts: any[] = [];
                        const toolMessages: ChatMessage[] = [];

                        for (const call of functionCalls) {
                            const activityText = call.name === 'googleSearch' 
                                ? '正在搜索网页...' 
                                : `正在使用工具: ${call.name}...`;
                            setAgentActivity(activityText);

                            let result;
                            if (call.name === 'googleSearch') {
                                result = "好的，搜索结果可供模型使用。";
                                console.log("确认 googleSearch。");
                            } else {
                                console.log(`执行自定义工具: ${call.name}`, call.args);
                                toolMessages.push({
                                    id: `${Date.now()}-${call.name}`,
                                    author: MessageAuthor.TOOL,
                                    text: `正在执行工具 ${call.name}...`,
                                    toolName: call.name,
                                    toolArgs: call.args
                                });
                                result = await executeTool(call.name, call.args);
                                console.log(`工具 ${call.name} 结果:`, result);
                            }
                            
                            functionResponseParts.push({
                                functionResponse: { name: call.name, response: { result } },
                            });
                        }

                        if (toolMessages.length > 0) {
                            setMessages(prev => [...prev, ...toolMessages]);
                        }

                        setAgentActivity('正在处理工具结果...');
                        console.log("将工具响应发送回模型:", functionResponseParts);
                        currentResponse = await chatRef.current.sendMessage({ message: functionResponseParts });
                    }

                    const finalText = currentResponse?.text ?? "抱歉，我无法处理该请求。";
                    console.log("最终代理响应:", finalText);
                    const agentMessage: ChatMessage = { id: Date.now().toString() + '-agent', author: MessageAuthor.AGENT, text: finalText };
                    setMessages(prev => [...prev, agentMessage]);

                } catch (error) {
                    console.error("对话期间出错:", error);
                    console.groupCollapsed("错误详情");
                    console.log("最后的用户输入:", payload);
                    console.log("出错时的会话历史:", messages);
                    console.error("原始错误对象:", error);
                    console.groupEnd();

                    const errorMessage: ChatMessage = { id: Date.now().toString() + '-error', author: MessageAuthor.AGENT, text: "发生错误。请检查开发者控制台以获取详细信息。" };
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
                <FileExplorer files={files} activeFile={activeFile} onFileSelect={handleFileSelect} onNewFile={handleNewFile} />
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
