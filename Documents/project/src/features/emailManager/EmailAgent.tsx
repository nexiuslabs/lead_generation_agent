import React from 'react';
import EmailChat from './components/EmailChat';
import { EmailChatProvider } from './components/EmailChatContext';

interface EmailAgentProps {
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
}

// This component is a wrapper for EmailChat to maintain compatibility with the existing App structure

interface EmailAgentControlProps {
  setPreviewDraftReply: (draft: string) => void;
  setPreviewInitialTab: (tab: 'email' | 'reply' | 'notes') => void;
  setIsPreviewCollapsed: (collapsed: boolean) => void;
}

type Props = EmailAgentProps & EmailAgentControlProps;

const EmailAgent: React.FC<Props> = ({ chatStarted, setChatStarted, setPreviewDraftReply, setPreviewInitialTab, setIsPreviewCollapsed }) => {
  // EmailChatProvider should be at a higher level (App/MainContent), so both Sidebar and EmailChat share the same context
  return (
    <div className="flex-1 h-full flex">
      <div className="flex-1">
        <EmailChat
          chatStarted={chatStarted}
          setChatStarted={setChatStarted}
          setPreviewDraftReply={setPreviewDraftReply}
          setPreviewInitialTab={setPreviewInitialTab}
          setIsPreviewCollapsed={setIsPreviewCollapsed}
        />
      </div>
    </div>
  );
};

export default EmailAgent;