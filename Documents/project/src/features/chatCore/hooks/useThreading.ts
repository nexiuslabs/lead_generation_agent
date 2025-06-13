import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { 
  addMessage, 
  selectThreadedMessages 
} from '../../../store/slices/messagesSlice';
import { v4 as uuidv4 } from 'uuid';

interface UseThreadingOptions {
  conversationId: string;
  agentType: string;
}

const useThreading = ({ conversationId, agentType }: UseThreadingOptions) => {
  const dispatch = useAppDispatch();

  // Reply to a specific message
  const replyToMessage = useCallback((parentId: string, content: string) => {
    dispatch(addMessage({
      id: uuidv4(),
      conversationId,
      content,
      role: 'user',
      timestamp: Date.now(),
      parentId, // This links the reply to the parent message
      agentType,
      status: 'sent'
    }));
    
    // In a real implementation, you'd make an API call to get the assistant's response
    setTimeout(() => {
      dispatch(addMessage({
        id: uuidv4(),
        conversationId,
        content: `I'm replying specifically to your message about "${content.slice(0, 20)}..."`,
        role: 'assistant',
        timestamp: Date.now(),
        parentId, // Keep the same parent ID to maintain the thread
        agentType,
        status: 'sent'
      }));
    }, 1500);
  }, [conversationId, agentType, dispatch]);

  // Get all replies to a specific message
  const getThreadReplies = useCallback((parentId: string) => {
    return useAppSelector(state => selectThreadedMessages(state, parentId));
  }, []);

  return {
    replyToMessage,
    getThreadReplies
  };
};

export default useThreading;