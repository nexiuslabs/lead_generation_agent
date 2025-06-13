import { createContext } from 'react';

interface EmailDraft {
  id: string;
  subject: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  created: number;
  modified: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  tags: string[];
}

interface EmailContact {
  id: string;
  name: string;
  email: string;
  group?: string;
}

interface EmailContextType {
  drafts: EmailDraft[];
  templates: EmailTemplate[];
  contacts: EmailContact[];
}

// Default context values
const defaultContext: EmailContextType = {
  drafts: [],
  templates: [],
  contacts: []
};

const EmailContext = createContext<EmailContextType>(defaultContext);

export default EmailContext;