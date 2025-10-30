import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `You are an expert AI agent designed to solve complex user requests by acting as a planner and an executor.
You have access to a set of powerful tools, a virtual file system, a short-term working memory (scratchpad), and a long-term persistent memory (IndexedDB).

Your Core Logic: Plan-Execute-Check Loop
You operate in a continuous loop to fulfill user requests. For every request, you must follow these steps:

1.  **Parse Intent & Plan:**
    *   Analyze the user's request to understand their primary goal.
    *   Break down the goal into a sequence of executable steps (a task plan).
    *   **Memory Strategy:** Decide if you need to remember information.
        *   For temporary info within the current task (like file content you're about to process), use the 'updateScratchpad' tool. This is your short-term memory and is cleared after the session.
        *   For information the user wants you to remember across conversations (like user preferences, notes, or data that should persist), use the 'indexedDBWrite' tool. This is your long-term memory.
    *   Example Plan: To save a user's favorite color and then use it.
        1. Call 'indexedDBWrite' with key 'user_favorite_color' and value 'blue'.
        2. Acknowledge that the preference has been saved for future sessions.

2.  **Execute & Gather Evidence:**
    *   Execute the first step of your plan by calling the chosen tool.
    *   I will execute the tool for you and return the result, which you should treat as "evidence".

3.  **Check & Adapt (Crucial for Error Handling):**
    *   After each tool execution, check the result.
    *   **If the tool succeeded:** Continue with your plan.
    *   **If the tool failed (returned an error):** DO NOT STOP. You must adapt.
        *   Announce the failure and formulate a new plan. For example, if 'readUrl' fails, use 'duckduckgoSearch' to find an alternative.

4.  **Respond:**
    *   After executing a "silent" tool (like updateScratchpad, writeFile, indexedDBWrite), provide a brief, natural confirmation (e.g., "Okay, I've noted that for later." or "I've saved that information permanently.").
    *   Once all steps are complete, provide a comprehensive final answer.

Your Dynamic Update Strategy (Handling Goal Changes)
Users may change their minds. Adapt your plan accordingly using "Hard Pivots" for new goals or "Soft Merges" for related sub-tasks.

Available Tools:
- **Long-Term Memory (Persistent):**
    - indexedDBWrite: To save or update a key-value pair in your permanent memory.
    - indexedDBRead: To retrieve data from your permanent memory.
    - indexedDBDelete: To delete data from your permanent memory.
    - indexedDBKeys: To list all keys available in your permanent memory.
- **Short-Term Memory (Session only):**
    - updateScratchpad: To save key-value pairs to your session's scratchpad.
    - readScratchpad: To read the content of your session's scratchpad.
- **File System:**
    - listFiles: To see the files in the current directory.
    - readFile: To read the content of a specific file.
    - writeFile: To create a new file or overwrite an existing one.
- **Web Access:**
    - duckduckgoSearch: For searching the web for real-time information.
    - readUrl: To fetch the content of a web page.
- **Execution & System:**
    - runJavascript: To execute JavaScript code in a sandboxed environment.
    - runTerminalCommand: To execute a shell command in a simulated terminal.
    - updateSystemInstruction: To modify your own core logic when requested by the user.

IMPORTANT:
- Always respond in the user's original language.
- Don't ask for permission to use tools; just use them as part of your plan.
`;


const listFilesTool: FunctionDeclaration = {
    name: "listFiles",
    description: "Lists all files in the virtual file system.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

const readFileTool: FunctionDeclaration = {
    name: "readFile",
    description: "Reads the content of a specific file from the virtual file system.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            fileName: {
                type: Type.STRING,
                description: "The name of the file to read."
            },
        },
        required: ["fileName"],
    }
};

const writeFileTool: FunctionDeclaration = {
    name: "writeFile",
    description: "Writes content to a specific file in the virtual file system. Creates the file if it doesn't exist, otherwise overwrites it.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            fileName: {
                type: Type.STRING,
                description: "The name of the file to write to."
            },
            content: {
                type: Type.STRING,
                description: "The content to write to the file."
            },
        },
        required: ["fileName", "content"],
    }
};

const runJavascriptTool: FunctionDeclaration = {
    name: "runJavascript",
    description: "Executes a string of JavaScript code in a sandboxed environment and returns the output or error.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            code: {
                type: Type.STRING,
                description: "The JavaScript code to execute."
            },
        },
        required: ["code"],
    }
};

const duckduckgoSearchTool: FunctionDeclaration = {
    name: "duckduckgoSearch",
    description: "Performs a web search using DuckDuckGo to get real-time information, news, or discover URLs. Returns a list of search results with titles, links, and snippets.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: "The search query."
            },
        },
        required: ["query"],
    }
};

const readUrlTool: FunctionDeclaration = {
    name: "readUrl",
    description: "Fetches and returns the text content of a given URL. Useful for reading articles or web pages found via web search.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            url: {
                type: Type.STRING,
                description: "The URL of the page to read."
            },
        },
        required: ["url"],
    }
};

const updateSystemInstructionTool: FunctionDeclaration = {
    name: "updateSystemInstruction",
    description: "Updates your core system instructions. Use this ONLY when the user explicitly asks you to change your behavior, logic, or personality. This is a powerful tool for self-improvement.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            newInstruction: {
                type: Type.STRING,
                description: "The new, complete system instruction string that will define your behavior going forward."
            },
        },
        required: ["newInstruction"],
    }
};

const runTerminalCommandTool: FunctionDeclaration = {
    name: "runTerminalCommand",
    description: "Executes a shell command in a simulated terminal environment. Supports basic commands like 'ls' (list files), 'cat [fileName]' (read file), 'echo [text]' (print text), and 'pwd' (print working directory).",
    parameters: {
        type: Type.OBJECT,
        properties: {
            command: {
                type: Type.STRING,
                description: "The shell command to execute, e.g., 'ls' or 'cat myFile.txt'."
            },
        },
        required: ["command"],
    }
};

const updateScratchpadTool: FunctionDeclaration = {
    name: "updateScratchpad",
    description: "Updates a key-value pair in your short-term memory (scratchpad). Use this to store and recall information within a single session, like file contents, user preferences, or intermediate results. Overwrites existing keys.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            key: {
                type: Type.STRING,
                description: "The unique key to store the information under."
            },
            value: {
                type: Type.STRING,
                description: "The string value to store. Can be simple text or a JSON stringified object."
            },
        },
        required: ["key", "value"],
    }
};

const readScratchpadTool: FunctionDeclaration = {
    name: "readScratchpad",
    description: "Reads the entire content of your short-term memory (scratchpad). Use this to review what you've stored before making your next move.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

const indexedDBWriteTool: FunctionDeclaration = {
    name: "indexedDBWrite",
    description: "Writes or updates a key-value pair in your long-term, persistent memory (IndexedDB). Use this to remember information across sessions, like user preferences or important data.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            key: {
                type: Type.STRING,
                description: "The unique key to store the data under."
            },
            value: {
                type: Type.STRING,
                description: "The JSON stringified value to store permanently."
            },
        },
        required: ["key", "value"],
    }
};

const indexedDBReadTool: FunctionDeclaration = {
    name: "indexedDBRead",
    description: "Reads a value from your long-term memory (IndexedDB) using its key.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            key: {
                type: Type.STRING,
                description: "The key of the data to retrieve."
            },
        },
        required: ["key"],
    }
};

const indexedDBDeleteTool: FunctionDeclaration = {
    name: "indexedDBDelete",
    description: "Deletes a key-value pair from your long-term memory (IndexedDB).",
    parameters: {
        type: Type.OBJECT,
        properties: {
            key: {
                type: Type.STRING,
                description: "The key of the data to delete."
            },
        },
        required: ["key"],
    }
};

const indexedDBKeysTool: FunctionDeclaration = {
    name: "indexedDBKeys",
    description: "Lists all the keys currently stored in your long-term memory (IndexedDB), allowing you to know what information you have stored.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};


export const customTools: FunctionDeclaration[] = [
    listFilesTool,
    readFileTool,
    writeFileTool,
    runJavascriptTool,
    readUrlTool,
    updateSystemInstructionTool,
    runTerminalCommandTool,
    updateScratchpadTool,
    readScratchpadTool,
    duckduckgoSearchTool,
    indexedDBWriteTool,
    indexedDBReadTool,
    indexedDBDeleteTool,
    indexedDBKeysTool,
];