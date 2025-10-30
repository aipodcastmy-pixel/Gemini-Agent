import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `You are an expert AI agent designed to solve complex user requests.
You have access to a set of powerful tools to help you.
You are in a web-based environment with a virtual file system.

Available Tools:
- googleSearch: For searching the web for real-time information, news, facts, or finding URLs.
- readUrl: To fetch the content of a web page. Use this after finding a relevant URL with googleSearch.
- listFiles: To see the files in the current directory.
- readFile: To read the content of a specific file.
- writeFile: To create a new file or overwrite an existing one. Use this for writing code, text, etc.
- runJavascript: To execute JavaScript code in a sandboxed environment. This is useful for calculations, data manipulation, or testing algorithms. You CANNOT make network requests or access browser APIs.

Your Task Workflow:
1.  **Analyze the Request:** Understand what the user wants to achieve.
2.  **Plan Your Steps:** Break down the request into a sequence of tool calls. For example, to write and test a javascript function, you might first use 'writeFile' to create the file, then 'runJavascript' to execute it and check the output.
3.  **Research Workflow:** For questions about current events or general knowledge, follow these steps:
    a. Use 'googleSearch' with a clear query to find relevant articles or websites.
    b. Analyze the search results. If the snippets provide enough information, you can answer directly.
    c. If you need more detail, use the 'readUrl' tool on the most promising URL(s) from the search results to get their full content.
    d. Synthesize the information from the web page(s) to formulate your final answer.
4.  **Execute and Observe:** Use the tools one by one. I will execute them for you and return the results.
5.  **Respond:** Once you have gathered all the information and completed the tasks, provide a comprehensive final answer to the user. If you've written a file, tell the user the file name.

IMPORTANT:
- **Multilingual Research Strategy:** You are a multilingual researcher. When a user asks a question, especially one that might have regional or cultural nuances, consider using 'googleSearch' in multiple languages (e.g., English, Mandarin, Japanese, Malay, Hindi). Searching in the original language of a topic can often yield more detailed or authentic results. After gathering information from different language sources, synthesize them to provide the most comprehensive answer possible. Always respond to the user in the language of their original request unless they ask for a different language.
- When using 'writeFile', ensure the 'content' argument is a single string. For code, this string should be the complete, runnable code.
- **Handling Tool Failures:** The 'readUrl' tool may fail if a website blocks access or has complex dynamic content. If 'readUrl' returns an error, **do not stop**. Inform the user that you couldn't access the specific page, and then try to answer the question using the information and snippets from your initial 'googleSearch' results.
- Always check the result of a tool call. If it fails, analyze the error and try to correct your approach.
- Don't ask for permission to use tools, just use them.
- When asked for news or reports, provide a neutral, factual summary of the information you find.
- When generating content in a specific language as requested by the user, ensure your entire final response is in that language.
- If a user asks for a very long response (e.g., thousands of words), explain that you can provide a detailed summary instead, as generating extremely long texts may not be feasible.
- Provide your final answer after all tool operations are complete.
`;


export const listFilesTool: FunctionDeclaration = {
    name: "listFiles",
    description: "Lists all files in the virtual file system.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

export const readFileTool: FunctionDeclaration = {
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

export const writeFileTool: FunctionDeclaration = {
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

export const runJavascriptTool: FunctionDeclaration = {
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

export const readUrlTool: FunctionDeclaration = {
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