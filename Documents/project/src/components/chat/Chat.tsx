import React, { useState } from 'react';
import Messages, { Message } from './Messages';
import ChatInput from './ChatInput';

interface ChatProps {
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
}

const Chat: React.FC<ChatProps> = ({ chatStarted, setChatStarted }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', content: message };
    setMessages([...messages, userMessage]);
    
    // Set chat as started if this is the first message
    if (!chatStarted) {
      setChatStarted(true);
    }
    

    // Fetch assistant response from API
    setIsGenerating(true);
    (async () => {
      try {
        const response = await fetch('https://api.agentdev.nexiuslabs.com/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: message, sender_email: localStorage.getItem('email') }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch assistant response');
        }
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer || 'Sorry, I could not generate a response.',
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, there was an error fetching the assistant response.',
          },
        ]);
      } finally {
        setIsGenerating(false);
      }
    })();

  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
  };

  const handleEnhancePrompt = () => {
    setIsEnhancing(true);
    // Simulate enhancement process
    setTimeout(() => {
      setIsEnhancing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark">
      <Messages messages={messages} isGenerating={isGenerating} />
      <ChatInput 
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        onEnhancePrompt={handleEnhancePrompt}
        isGenerating={isGenerating}
        isEnhancing={isEnhancing}
        chatStarted={chatStarted}
      />
    </div>
  );
};

export default Chat;