import React, { ReactNode } from 'react';
import { useAppSelector } from '../../store';
import { selectActiveConversation } from '../../store/slices/conversationsSlice';

interface ConversationWrapperProps {
  children: ReactNode;
  className?: string;
  agentType?: string;
  emptyStateContent?: ReactNode;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  children,
  className = '',
  agentType,
  emptyStateContent
}) => {
  const activeConversation = useAppSelector(selectActiveConversation);
  const hasActiveConversation = !!activeConversation;

  // If no active conversation and we have an empty state, show it
  if (!hasActiveConversation && emptyStateContent) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-dark ${className}`}>
        {emptyStateContent}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-dark ${className}`}>
      {/* Conversation header */}
      {hasActiveConversation && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-secondary">
          <h2 className="text-base font-medium truncate">
            {activeConversation.title}
          </h2>
          {agentType && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {agentType} conversation
            </div>
          )}
        </div>
      )}
      
      {/* Conversation content */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
};

export default ConversationWrapper;