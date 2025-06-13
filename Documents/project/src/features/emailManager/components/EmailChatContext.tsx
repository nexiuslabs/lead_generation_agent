import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmailChatContextType {
  conversationId: string | null;
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

const EmailChatContext = createContext<EmailChatContextType | undefined>(undefined);

export const useEmailChatContext = () => useContext(EmailChatContext);

export const EmailChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  return (
    <EmailChatContext.Provider value={{ conversationId, setConversationId, messages, setMessages }}>
      {children}
    </EmailChatContext.Provider>
  );
}; // setConversationId and setMessages now allow updater functions

export default EmailChatContext;
