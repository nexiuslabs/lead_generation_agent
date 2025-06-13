import React, { useState } from 'react';
import { useAppSelector } from '../../../store';
import { selectActiveConversation } from '../../../store/slices/conversationsSlice';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ChatLayoutConfig } from '../types';
import { ConversationWrapper } from '../../../components/ui';
import { Copy } from 'lucide-react';

interface ChatLayoutProps {
  config: ChatLayoutConfig;
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
  conversationId?: string;
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  isGenerating?: boolean;
  initialMessages?: Array<{
    id: number | string;
    role: 'user' | 'assistant';
    content: string;
    datetime: string;
  }>;
  messages?: Array<{
    id: number | string;
    role: 'user' | 'assistant';
    content: string;
    datetime: string;
    [key: string]: any;
  }>;
  addMessageToPanel?: (msg: any) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  config,
  chatStarted,
  setChatStarted,
  conversationId,
  onSendMessage,
  onStopGeneration,
  isGenerating = false,
  initialMessages = [],
  messages: externalMessages
}) => {
  const [messages, setMessages] = useState(initialMessages || []);
  // Always use external messages if provided, but merge with local pending (optimistic) messages
  const pendingMessages = messages.filter(
    (msg) => msg.pending && !(externalMessages || []).some((emsg) => emsg.id === msg.id)
  );
  const displayMessages = (externalMessages ?? messages).concat(pendingMessages);
  const addMessageToPanel = (msg: any) => setMessages(prev => [...prev, msg]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const activeConversation = useAppSelector(selectActiveConversation);

  // Handle enhancing the prompt
  const handleEnhancePrompt = () => {
    if (!config.enhancePromptEnabled) return;
    
    setIsEnhancing(true);
    // Simulate enhancement process
    setTimeout(() => {
      setIsEnhancing(false);
    }, 1500);
  };

  // Handle sending a message
  const handleSendMessage = (message: string) => {
    onSendMessage(message);
    
    // Set chat as started if this is the first message
    if (!chatStarted) {
      setChatStarted(true);
    }
  };

  // Always use initialMessages if provided (even if empty array)
  const shouldUseInitialMessages = Array.isArray(initialMessages);

  // Handle attachment request
  const handleAttachmentRequest = () => {
    console.log('Attachment requested in ChatLayout');
    // Implement file upload dialog or other attachment handling
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center dark:bg-dark-secondary">
        <div className="mr-2 text-secondary-500">
          {config.agent.icon}
        </div>
        <h2 className="text-lg font-medium">{config.agent.name}</h2>
      </div>
      
      {/* Agent-specific toolbar */}
      {config.toolbar}
      
      {/* Messages and Input Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages (scrollable area) */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList 
            messages={displayMessages}
            conversationId={conversationId}
            isGenerating={isGenerating}
            emptyStateContent={config.agent.emptyStateContent}
            className="flex-1"
          />
        </div>
        {/* Message input - Always at bottom */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          onStopGeneration={onStopGeneration}
          onEnhancePrompt={config.enhancePromptEnabled ? handleEnhancePrompt : undefined}
          isGenerating={isGenerating}
          isEnhancing={isEnhancing}
          chatStarted={chatStarted}
          placeholder={config.agent.placeholderText}
          onAttachmentRequest={config.attachmentsEnabled ? handleAttachmentRequest : undefined}
          addMessageToPanel={addMessageToPanel}
        />
      </div>
    </div>
  );
};

export default ChatLayout;