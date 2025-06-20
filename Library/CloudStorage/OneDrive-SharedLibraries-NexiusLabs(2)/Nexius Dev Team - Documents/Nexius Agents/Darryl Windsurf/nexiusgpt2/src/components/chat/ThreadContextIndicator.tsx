import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectConversationById } from '../../store/slices/conversationsSlice';
import { MessageSquare, Clock, Users } from 'lucide-react';

/**
 * Component to display current thread context information
 * Shows thread ID, title, and metadata to help users understand which conversation they're in
 */
const ThreadContextIndicator: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const conversation = useAppSelector(state => 
    conversationId ? selectConversationById(state, conversationId) : null
  );

  if (!conversationId || !conversation) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1D2A4D]/5 to-[#00CABA]/5 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageSquare size={16} className="text-[#1D2A4D] dark:text-[#00CABA]" />
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {conversation.title}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} />
            <span>Updated {formatDate(conversation.updatedAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md font-mono">
            {conversationId.slice(-8)}
          </span>
          {conversation.status && (
            <span className={`px-2 py-1 rounded-md capitalize ${
              conversation.status === 'active' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {conversation.status}
            </span>
          )}
        </div>
      </div>
      
      {/* Thread persistence indicator */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Thread context preserved</span>
        </div>
        <span>
          ID: {conversationId}
        </span>
      </div>
    </div>
  );
};

export default ThreadContextIndicator;