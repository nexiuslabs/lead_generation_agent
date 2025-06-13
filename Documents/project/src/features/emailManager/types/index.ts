// Email-specific types

export interface EmailDraft {
  id: string;
  subject: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  created: number;
  modified: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  tags: string[];
}

export interface EmailContact {
  id: string;
  name: string;
  email: string;
  group?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface EmailPromptRequest {
  type: 'draft' | 'reply' | 'analyze';
  context?: string;
  recipients?: string[];
  subject?: string;
  originalEmail?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  additionalInstructions?: string;
}