# Gemini AI Agent Chatbox

## 1. Goals & Principles

This is an advanced AI agent chatbot project built on the following core principles:

*   **Tool-first**: The AI Large Language Model (LLM) is primarily responsible for decision-making, planning, and interpretation, while all fact-finding and concrete operations are delegated to specialized tools.
*   **Zero Hard-coding**: The agent should not have any hard-coded logic for specific tasks (e.g., SQL templates, API paths). All its actions should be driven by "evidence" it gathers at runtime using its tools.
*   **Explainable**: Every step the agent takes should be clearly and structurally logged, making it easy to debug and understand its "thought" process.

## 2. Features

*   **Interactive Chat Interface**: A smooth and aesthetically pleasing chat window.
*   **Non-blocking UI**: Continue typing your next message while the agent is processing the current one.
*   **Gemini AI Agent**: Powered by Google's latest `gemini-2.5-pro` model.
*   **Powerful Toolset**:
    *   **Web Search (`googleSearch`)**: Real-time access to internet information.
    *   **Web Page Reading (`readUrl`)**: Extracts and understands content from web pages.
    *   **Local File System Integration**: Create, read, write, and list files from a user-selected folder on your local machine (`writeFile`, `readFile`, `listFiles`). (Requires a modern browser like Chrome or Edge).
    *   **Code Executor (`runJavascript`)**: Executes JavaScript code in a sandboxed environment for calculations, data processing, etc.
    *   **Self-Amendment (`updateSystemInstruction`)**: The agent can dynamically update its own core instructions based on user feedback, allowing for on-the-fly behavioral changes.
*   **IDE-like Interface**:
    *   Side panel with a file explorer and code editor.
    *   **Load a local folder** to manage its contents.
    *   Create, view, and save files directly within the UI, with changes reflected on your local disk.
*   **Real-time Status Feedback**: Clearly displays the agent's current task (e.g., "Thinking...", "Searching the web...").
*   **Command History**: Use the up/down arrow keys in the input box to quickly cycle through previously sent commands.
*   **Markdown Rendering**: The agent's responses are rendered as formatted Markdown for improved readability.

## 3. Agent Core Logic: Plan-Execute-Check

The agent operates on a sophisticated event-driven loop, functioning as a planner and an executor to solve user requests. Every decision is explainable and based on evidence gathered from its tools.

1.  **Parse Intent**
    *   When the user sends a message, the agent's first step is to parse the user's intent, identify their primary goal, and note any constraints or preferences.

2.  **Reconcile Goals & Plan**
    *   The agent updates its current goal. If the new request conflicts with a previous one, it may ask clarifying questions.
    *   It then formulates a **Task Graph**: a step-by-step plan to achieve the goal. This involves creating, deleting, or reordering a to-do list of actions and identifying dependencies between them.

3.  **Select Next Move**
    *   From the list of currently executable tasks in its plan, the agent selects the next move based on factors like potential value, risk, and dependencies.

4.  **Execute**
    *   The application executes the selected move by calling the appropriate tool (e.g., `googleSearch`, `readFile`).
    *   The result from the tool is considered "evidence" and is sent back to the agent.

5.  **Check & Adapt**
    *   The agent runs an internal "assertion" to check if the evidence brings it closer to its goal.
        *   **On Success**: If the step was successful, it proceeds to the next step in its plan.
        *   **On Failure**: If the tool returned an error, the agent generates a "fine-tuning strategy." It adapts its plan by finding an alternative route—for example, if `readUrl` fails, it might try `googleSearch` to find a different article. It does not give up.

6.  **Stop or Continue**
    *   If all success criteria for the main goal are met, the agent will provide a final, comprehensive answer to the user.
    *   Otherwise, it returns to step 3 to select the next move in its revised plan.

This entire process is logged, making every decision (why a specific tool was chosen, what evidence was used) fully transparent and debuggable.

## 4. Dynamic Update Strategy

The agent is designed to handle situations where the user changes their mind or adds new requirements mid-task.

*   **Hard Pivot**: When the user's new request completely replaces the old one (e.g., "Never mind the summary, can you write a function to sort an array instead?"), the agent is instructed to discard its old plan and create a new one from scratch for the new goal.

*   **Soft Merge**: When the user adds a related sub-task or constraint (e.g., "While you're writing the code, please add comments explaining each line."), the agent will intelligently merge the new requirement into its existing plan without starting over. It will determine the most logical point to perform the new action.

This allows for a more natural and flexible conversational flow, where the agent can adapt to evolving user needs.

## 5. Self-Amendment

A key feature of this agent is its ability to modify its own behavior during a conversation.

Using the `updateSystemInstruction` tool, the agent can rewrite its core system prompt. This allows a user to dynamically change the agent's personality, update its rules, or provide new context that alters its planning and execution logic for all subsequent turns in the conversation. This enables a powerful feedback loop where the agent can learn and adapt without requiring a code change and redeployment.