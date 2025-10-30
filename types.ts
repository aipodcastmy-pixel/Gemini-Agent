export enum MessageAuthor {
  USER = 'user',
  AGENT = 'agent',
  TOOL = 'tool',
}

export interface BaseMessage {
  author: MessageAuthor;
  id: string;
}

export interface UserMessage extends BaseMessage {
  author: MessageAuthor.USER;
  text: string;
  images?: string[]; // Array of base64 encoded images
}

export interface AgentMessage extends BaseMessage {
  author: MessageAuthor.AGENT;
  text: string;
}

export interface ToolMessage extends BaseMessage {
    author: MessageAuthor.TOOL;
    text: string;
    toolName: string;
    toolArgs: Record<string, any>;
    toolResult?: string;
}

export type ChatMessage = UserMessage | AgentMessage | ToolMessage;

export interface FileNode {
  name: string;
  content: string;
}

export interface SendMessagePayload {
  text: string;
  images?: string[];
}
