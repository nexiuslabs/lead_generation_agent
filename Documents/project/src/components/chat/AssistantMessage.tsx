import React from 'react';

import MessageMeta from './MessageMeta';

interface AssistantMessageProps {
  message: string;
  datetime: string;
  isStreaming?: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ 
  message, 
  datetime,
  isStreaming = false 
}) => {
  return (
    <div className="flex flex-col items-start mb-4">
      <div className="bg-[#F5F7FA] dark:bg-dark-secondary p-3 rounded-r-lg rounded-bl-lg max-w-[80%]">
        <p className="text-sm text-[#3A3A3A] dark:text-white">
          {message}
          {isStreaming && <span className="typing-animation">...</span>}
        </p>
      </div>
      <MessageMeta datetime={datetime} message={message} />
    </div>
  );
};

export default AssistantMessage;