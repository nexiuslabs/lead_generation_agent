import { ReactNode } from 'react';

// Base message type
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  parentId?: string; // For threaded replies
  status?: 'sending' | 'sent' | 'failed';
  metadata?: Record<string, any>; // Flexible metadata
}

// Conversation type
export interface Conversation {
  id: string;
  title: string;
  agentType: string;
  createdAt: number;
  updatedAt: number;
  lastMessagePreview?: string;
  unreadCount: number;
  status: 'active' | 'archived' | 'completed';
  participants?: string[];
  metadata?: Record<string, any>;
}

// Agent configuration type
export interface AgentConfig {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: ReactNode;
  capabilities: string[];
  placeholderText: string;
  emptyStateContent?: ReactNode;
  apiEndpoint?: string;
  promptTemplates?: Record<string, string>;
}

// Chat layout configuration
export interface ChatLayoutConfig {
  agent: AgentConfig;
  toolbar?: ReactNode;
  sidePanel?: ReactNode;
  attachmentsEnabled?: boolean;
  enhancePromptEnabled?: boolean;
  maxMessageLength?: number;
}