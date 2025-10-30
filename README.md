# Gemini AI Agent IDE

This is an advanced, IDE-like web application featuring a powerful AI agent powered by Google's Gemini models. The agent is designed to understand complex user requests and utilize a rich set of tools to accomplish tasks, from writing code and searching the web to managing files and remembering information across conversations.

## Core Features

*   **Advanced AI Agent**: Powered by Google's latest Gemini models, with a sophisticated core logic for planning and execution.
*   **Dual-Memory System**:
    *   **Short-Term Memory (Scratchpad)**: A temporary workspace for the agent to store and recall information within a single task.
    *   **Long-Term Memory (IndexedDB)**: Persistent storage that allows the agent to remember user preferences and key information across multiple sessions.
*   **Interactive IDE Environment**:
    *   **Resizable Three-Panel Layout**: A flexible interface with a file explorer, code editor, and chat window.
    *   **Collapsible Panels**: Hide and show side panels to customize your workspace.
*   **Hybrid File System**:
    *   **Local Folder Integration**: Securely load a folder from your local machine for the agent to read from and write to.
    *   **Virtual Mode Fallback**: If local access is unavailable, the agent seamlessly switches to an in-memory virtual file system for uninterrupted operation.
*   **Powerful & Extensible Toolset**:
    *   **Web Search**: Uses DuckDuckGo for reliable, real-time access to web information.
    *   **Code Execution**: A sandboxed JavaScript runtime for calculations, data manipulation, and more.
    *   **File & Terminal Management**: Tools to read, write, and list files, plus a simulated terminal for common commands.
*   **Multi-LLM Provider Support**: A settings panel allows you to configure the agent to use different models from Gemini, OpenAI, or custom endpoints (e.g., Ollama).
*   **Modern & Responsive UI**: A non-blocking chat interface that allows you to type while the agent is working, with a clean design and full Markdown rendering for agent responses.

## The Agent's "Brain": Core Logic & Capabilities

The agent operates on a sophisticated loop, functioning as an intelligent planner and a reliable executor.

1.  **Plan-Execute-Check Loop**: For any user request, the agent first creates a multi-step plan. It then executes each step using its tools, checks the result ("evidence"), and adapts its plan based on the outcome. If a tool fails, it doesn't give up; it formulates a new strategy to achieve the goal.

2.  **Parallel Tool Execution**: To maximize efficiency, the agent can execute multiple independent tool calls concurrently. For complex research tasks, this allows it to gather information from various sources simultaneously, leading to significantly faster response times.

3.  **Strategic Memory Use**: The agent has been taught to differentiate between its two memory systems. It uses the short-term **scratchpad** for temporary data needed for the current task and the long-term **IndexedDB** for information that needs to be permanently remembered.

4.  **Long-Term Conversation Management**: The agent is designed for extended conversations. It can recognize when a conversation is becoming too long for the model's context window and will request a summary of the history, allowing it to "remember" key details from the beginning of a long discussion while managing token costs.

5.  **Dynamic Goal Adaptation**: The agent can adapt to a user's changing goals mid-conversation, either by completely pivoting to a new task ("Hard Pivot") or by seamlessly integrating a new requirement into its current plan ("Soft Merge").

6.  **Self-Amendment**: A key feature is the agent's ability to modify its own core behavior. Using the `updateSystemInstruction` tool, a user can dynamically change the agent's personality, rules, or logic for the remainder of the session.

## Full Tool Reference

The agent has access to the following tools, grouped by category:

| Category          | Tool Name                 | Description                                                                          |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| **Long-Term Memory** | `indexedDBWrite`          | Saves or updates a key-value pair in permanent memory.                               |
|                   | `indexedDBRead`           | Retrieves a value from permanent memory by its key.                                  |
|                   | `indexedDBDelete`         | Deletes a value from permanent memory by its key.                                    |
|                   | `indexedDBKeys`           | Lists all keys currently stored in permanent memory.                                 |
| **Short-Term Memory** | `updateScratchpad`        | Saves a key-value pair to the temporary session scratchpad.                          |
|                   | `readScratchpad`          | Reads the entire content of the temporary scratchpad.                                |
| **File System**   | `listFiles`               | Lists all files in the current directory (local or virtual).                         |
|                   | `readFile`                | Reads the content of a specified file.                                               |
|                   | `writeFile`               | Creates or overwrites a file with new content.                                       |
| **Web Access**    | `duckduckgoSearch`        | Performs a web search to get real-time information.                                  |
|                   | `readUrl`                 | Fetches and returns the text content of a given URL.                                 |
| **Execution**     | `runJavascript`           | Executes JavaScript code in a sandboxed environment.                                 |
|                   | `runTerminalCommand`      | Executes basic shell commands (`ls`, `cat`, `echo`, `pwd`) in a simulated terminal. |
| **System**        | `updateSystemInstruction` | Modifies the agent's own core system instructions based on user commands.            |
|                   | `requestConversationSummary` | Signals the system to summarize the conversation history to manage context.         |
