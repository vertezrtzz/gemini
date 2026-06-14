export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  // Parameter settings stored at chat-level as defaults, but can be overridden
  modelId: string;
  temperature: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  systemInstruction?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  recommendedTask: string;
  tag: 'Recommended' | 'Ultra-Fast' | 'Reasoning';
}

export interface ModelParameters {
  modelId: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
  systemInstruction: string;
}
