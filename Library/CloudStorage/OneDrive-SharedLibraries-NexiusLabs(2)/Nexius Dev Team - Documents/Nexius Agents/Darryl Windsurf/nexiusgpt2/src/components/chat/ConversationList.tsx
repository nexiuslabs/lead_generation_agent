import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  selectAllConversations, 
  selectConversationsByDate,
  addConversations,
  setActiveConversation 
} from '../../store/slices/conversationsSlice';
import { showToast } from '../../store/slices/uiSlice';
import { PlusCircle, MessageSquare, Clock, Search } from 'lucide-react';
import { createNewConversation } from '../../api/chatApi';
import { v4 as uuidv4 } from 'uuid';

interface ConversationListProps {
  isCollapsed?: boolean;
  onNewChat?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  isCollapsed = false,
  onNewChat 
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { conversationId: currentConversationId } = useParams<{ conversationId?: string }>();
  
  const conversations = useAppSelector(selectAllConversations);
  const conversationsByDate = useAppSelector(selectConversationsByDate);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const handleCreateNew = async () => {
    setIsCreatingNew(true);
    try {
      // Create new conversation locally first for immediate UI feedback
      const newConversationId = uuidv4();
      
      // Navigate to new conversation
      navigate(`/chat/${newConversationId}`);
      
      if (onNewChat) {
        onNewChat();
      }
      
    } catch (error) {
      console.error('Error creating new conversation:', error);
      dispatch(showToast({
        message: 'Failed to create new conversation',
        type: 'error'
      }));
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    dispatch(setActiveConversation(conversationId));
    navigate(`/chat/${conversationId}`);
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-dark-secondary border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
        {/* New chat button */}
        <button
          onClick={handleCreateNew}
          disabled={isCreatingNew}
          className="m-2 p-3 bg-[#00CABA] hover:bg-[#008B7A] text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
          title="New Chat"
        >
          <PlusCircle size={20} />
        </button>
        
        {/* Recent conversations - just icons */}
        <div className="flex-1 overflow-y-auto px-2">
          {conversations.slice(0, 5).map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
              className={`w-full p-3 mb-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                currentConversationId === conversation.id
                  ? 'bg-[#1D2A4D] text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={conversation.title}
            >
              <MessageSquare size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-dark-secondary border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversations
          </h2>
          <button
            onClick={handleCreateNew}
            disabled={isCreatingNew}
            className="p-2 bg-[#00CABA] hover:bg-[#008B7A] text-white rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <PlusCircle size={16} />
            {!isCreatingNew && <span className="text-sm">New</span>}
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00CABA] focus:border-[#00CABA] dark:bg-dark-tertiary dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          // Filtered results
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversationId === conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    formatTime={formatRelativeTime}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Grouped by date
          <div className="p-2">
            {Object.keys(conversationsByDate).length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start your first chat above</p>
              </div>
            ) : (
              Object.entries(conversationsByDate).map(([dateGroup, groupConversations]) => (
                <div key={dateGroup} className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
                    {dateGroup}
                  </h3>
                  <div className="space-y-1">
                    {groupConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversationId === conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        formatTime={formatRelativeTime}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual conversation item component
interface ConversationItemProps {
  conversation: any;
  isActive: boolean;
  onClick: () => void;
  formatTime: (timestamp: number) => string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  formatTime
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg text-left transition-all duration-200 group ${
        isActive
          ? 'bg-[#1D2A4D] text-white shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className={`font-medium text-sm truncate pr-2 ${
          isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'
        }`}>
          {conversation.title}
        </h4>
        <div className="flex items-center gap-1 text-xs opacity-70">
          <Clock size={12} />
          <span>{formatTime(conversation.updatedAt)}</span>
        </div>
      </div>
      
      {conversation.lastMessagePreview && (
        <p className={`text-xs truncate ${
          isActive ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {conversation.lastMessagePreview}
        </p>
      )}
      
      {conversation.unreadCount > 0 && (
        <div className="mt-2 flex justify-end">
          <span className="bg-[#00CABA] text-white text-xs px-2 py-0.5 rounded-full">
            {conversation.unreadCount}
          </span>
        </div>
      )}
      
      {/* Thread ID indicator for development */}
      <div className="mt-1 text-xs font-mono opacity-50">
        ID: {conversation.id.slice(-8)}
      </div>
    </button>
  );
};

export default ConversationList;