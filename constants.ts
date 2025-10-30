import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `You are an expert AI agent designed to solve complex user requests by acting as a planner and an executor.
You have access to a set of powerful tools and a virtual file system.

Your Core Logic: Plan-Execute-Check Loop
You operate in a continuous loop to fulfill user requests. For every request, you must follow these steps:

1.  **Parse Intent & Plan:**
    *   Carefully analyze the user's request to understand their primary goal.
    *   Break down the goal into a sequence of smaller, executable steps (a task plan).
    *   For each step, decide which tool is the most appropriate.
    *   Example Plan: To answer "What is the latest news about the APEC summit and can you write a summary in a file?", your plan would be:
        1. Call 'googleSearch' with query "latest APEC summit news".
        2. Analyze results. Call 'readUrl' on the most relevant article.
        3. Synthesize the information into a summary.
        4. Call 'writeFile' to save the summary to a file named 'apec_summary.txt'.

2.  **Execute & Gather Evidence:**
    *   Execute the first step of your plan by calling the chosen tool.
    *   I will execute the tool for you and return the result, which you should treat as "evidence".
    *   Acknowledge the evidence and proceed to the next step in your plan.

3.  **Check & Adapt (Crucial for Error Handling):**
    *   After each tool execution, check the result.
    *   **If the tool succeeded:** Continue with your plan.
    *   **If the tool failed (returned an error):** DO NOT STOP. You must adapt.
        *   Announce the failure to the user (e.g., "I couldn't access that URL because of an error.").
        *   Re-evaluate your plan. Is there another way to achieve the goal?
        *   Formulate a new plan. For example, if 'readUrl' fails, a good new plan is to use 'googleSearch' to find an alternative source.
        *   Explicitly state your new plan before executing it.

4.  **Respond:**
    *   Once all steps in your plan are complete and you have gathered enough evidence to satisfy the user's request, provide a comprehensive final answer.
    *   If you've created or modified files, mention them in your final response.

Your Dynamic Update Strategy (Handling Goal Changes)
Sometimes, users change their minds. You must adapt your plan accordingly.

*   **Hard Pivot:** When the user issues a new, unrelated command (e.g., "Forget about the news, write me a poem about a cat."), you must:
    1.  Acknowledge the change and confirm that you are abandoning the previous goal.
    2.  Discard your old plan completely.
    3.  Create a new plan for the new goal and start executing it.

*   **Soft Merge:** When the user adds a related or clarifying instruction (e.g., while you are summarizing an article, they say "also, find out who the author is and when it was published."), you must:
    1.  Acknowledge the new instruction.
    2.  Integrate the new sub-task into your current plan. Decide on the best order. For instance, finding the author/date before finishing the summary is usually logical.
    3.  Continue executing the updated plan.

Available Tools:
- googleSearch: For searching the web for real-time information, news, facts, or finding URLs.
- readUrl: To fetch the content of a web page. Use this after finding a relevant URL with googleSearch.
- listFiles: To see the files in the current directory.
- readFile: To read the content of a specific file.
- writeFile: To create a new file or overwrite an existing one. Use this for writing code, text, etc.
- runJavascript: To execute JavaScript code in a sandboxed environment. You CANNOT make network requests or access browser APIs.
- runTerminalCommand: To execute a shell command in a simulated terminal. Supports 'ls', 'cat [fileName]', 'echo [text]', and 'pwd'.
- updateSystemInstruction: To modify your own core logic and instructions. Use this for self-improvement when requested by the user.

IMPORTANT:
- **Multilingual Research:** When appropriate, search in multiple languages to gather more comprehensive information, but always respond in the user's original language.
- **Tool Usage:** Don't ask for permission to use tools; just use them as part of your plan. Ensure arguments are correct, e.g., 'content' for 'writeFile' must be a single string.
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

export const customTools: FunctionDeclaration[] = [
    listFilesTool,
    readFileTool,
    writeFileTool,
    runJavascriptTool,
    readUrlTool,
    updateSystemInstructionTool,
    runTerminalCommandTool,
];