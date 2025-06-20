import React from 'react';
import { useChat } from '../../chatCore';
import { ChatLayout } from '../../chatCore';
import ProcurementToolbar from './ProcurementToolbar';
import { ShoppingCart } from 'lucide-react';

interface ProcurementChatProps {
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
}

const ProcurementChat: React.FC<ProcurementChatProps> = ({ chatStarted, setChatStarted }) => {
  // Initialize chat with procurement agent type
  const { 
    sendMessage, 
    stopGeneration, 
    isGenerating, 
    conversationId 
  } = useChat({ 
    agentType: 'procurement'
  });

  const procurementConfig = {
    agent: {
      id: 'procurement',
      type: 'procurement',
      name: 'Procurement Assistant',
      description: 'Help with sourcing, buying, and managing inventory',
      icon: <ShoppingCart size={20} />,
      capabilities: ['procurement planning', 'vendor management', 'inventory tracking'],
      placeholderText: 'Ask me about procurement, suppliers, or inventory...',
      emptyStateContent: (
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-primary-500 dark:text-white mb-2">
            Welcome to the Procurement Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            I can help you source products, manage vendors, analyze costs, and optimize your supply chain. Try asking:
          </p>
          <ul className="mt-4 text-left text-gray-600 dark:text-gray-400 space-y-2">
            <li>"Find suppliers for office furniture"</li>
            <li>"Compare quotes from these three vendors"</li>
            <li>"Create a purchase order for 50 laptops"</li>
          </ul>
        </div>
      )
    },
    toolbar: <ProcurementToolbar />,
    attachmentsEnabled: true,
    enhancePromptEnabled: true,
    maxMessageLength: 4000
  };

  return (
    <ChatLayout
      config={procurementConfig}
      chatStarted={chatStarted}
      setChatStarted={setChatStarted}
      conversationId={conversationId}
      onSendMessage={sendMessage}
      onStopGeneration={stopGeneration}
      isGenerating={isGenerating}
    />
  );
};

export default ProcurementChat;