import React, { useRef, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useAppSelector } from '../../../store';
import { selectMessagesByConversation } from '../../../store/slices/messagesSlice';
import MessageItem from './MessageItem';
import { Loading } from '../../../components/ui';

interface MessageListProps {
  conversationId: string;
  messages?: any[];
  isGenerating?: boolean;
  className?: string;
  onReplyToMessage?: (messageId: string) => void;
  onMessageFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  emptyStateContent?: React.ReactNode;
}

const MessageList: React.FC<MessageListProps> = ({ 
  conversationId, 
  messages: propMessages,
  isGenerating = false,
  className = '',
  onReplyToMessage,
  onMessageFeedback,
  emptyStateContent
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Use prop messages if provided, fallback to Redux otherwise
  const reduxMessages = useAppSelector(state => selectMessagesByConversation(state, conversationId));
  const messages = propMessages ?? reduxMessages;
  const isEmpty = messages.length === 0;
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Group messages by date
  const messagesByDate = messages.reduce<Record<string, typeof messages>>((acc, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  // Calculate date groups for rendering date separators
  const dateGroups = Object.keys(messagesByDate).map(date => ({
    date,
    index: messages.findIndex(m => new Date(m.timestamp).toLocaleDateString() === date)
  }));

  // Handle scroll behavior
  const handleScroll = ({ scrollOffset, scrollUpdateWasRequested }: { scrollOffset: number, scrollUpdateWasRequested: boolean }) => {
    if (!scrollUpdateWasRequested && containerHeight) {
      const listHeight = messages.length * 100; // Approximate height
      const isAtBottom = scrollOffset >= listHeight - containerHeight - 50;
      setIsScrolledToBottom(isAtBottom);
      setShowScrollToBottom(!isAtBottom);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (listRef.current && !isEmpty) {
      listRef.current.scrollToItem(messages.length - 1);
      setIsScrolledToBottom(true);
      setShowScrollToBottom(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive if already at bottom
  useEffect(() => {
    if (isScrolledToBottom && listRef.current && !isEmpty) {
      listRef.current.scrollToItem(messages.length - 1);
    } else if (!isScrolledToBottom && isGenerating) {
      // Show scroll to bottom button when generating a response
      setShowScrollToBottom(true);
    }
  }, [messages.length, isScrolledToBottom, isEmpty, isGenerating]);

  // Calculate the height of the container for the virtualized list
  useEffect(() => {
    if (containerRef.current) {
      const updateHeight = () => {
        setContainerHeight(containerRef.current?.clientHeight || 0);
      };
      
      // Set height initially
      updateHeight();
      
      // Update height on window resize
      window.addEventListener('resize', updateHeight);
      
      // Cleanup
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Custom empty state
  if (isEmpty) {
    return (
      <div className={`flex-1 flex items-center justify-center p-4 ${className}`}>
        {emptyStateContent || (
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-primary-500 dark:text-white mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Send a message to begin. I'll help you turn complex information into actionable insights.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Custom message row renderer
  const MessageRow = ({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
    const message = data.messages[index];
    const isDateSeparator = dateGroups.some(group => group.index === index);
    const date = isDateSeparator 
      ? new Date(message.timestamp).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : null;
    
    return (
      <div style={{
        ...style,
        height: 'auto', // Override fixed height with auto
      }}>
        {isDateSeparator && (
          <div className="">
            <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-full text-xs text-gray-600 dark:text-gray-400">
              {date}
            </div>
          </div>
        )}
        <MessageItem 
          message={message} 
          isStreaming={data.isGenerating && data.isLastMessage(index)}
          onReply={onReplyToMessage}
          onFeedback={onMessageFeedback}
        />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-hidden relative ${className}`}
      role="log"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 w-full p-4">
        {messages.map((message, idx) => {
          const isDateSeparator = dateGroups.some(group => group.index === idx);
          const date = isDateSeparator
            ? new Date(message.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : null;
          return (
            <React.Fragment key={message.id || idx}>
              {isDateSeparator && (
                <div className="w-full flex justify-center">
                  <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-full text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {date}
                  </div>
                </div>
              )}
              <MessageItem
                message={message}
                isStreaming={isGenerating && idx === messages.length - 1}
                onReply={onReplyToMessage}
                onFeedback={onMessageFeedback}
              />
              {/* Add a ref to the last message for auto-scroll */}
              {idx === messages.length - 1 && <div ref={bottomRef} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-primary-500 text-white rounded-full p-2 shadow-md hover:bg-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;