import React, { useRef, useEffect } from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessagesProps {
  messages: Message[];
  isGenerating: boolean;
}

const Messages: React.FC<MessagesProps> = ({ messages, isGenerating }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-[#1D2A4D] dark:text-white mb-2">
            Welcome to Nexius Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start a conversation to get data-driven intelligence and turn complex information into actionable insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-dark">
      {/* Date header at top if first message */}
      {messages.length > 0 && (
        <div className="flex justify-center mb-6">
          <span className="bg-[#F5F7FA] text-xs text-gray-500 px-4 py-1 rounded-full font-medium shadow-sm">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      )}
      {messages.map((message, index) => {
        // For demo: use current time for all messages. In real use, message.datetime should be used.
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
          <React.Fragment key={index}>
            {message.role === 'user' ? (
              <UserMessage message={message.content} datetime={timeString} />
            ) : (
              <AssistantMessage 
                message={message.content} 
                datetime={timeString}
                isStreaming={isGenerating && index === messages.length - 1} 
              />
            )}
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;