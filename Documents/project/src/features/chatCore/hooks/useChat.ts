import { useState, useCallback } from 'react';
import { useAppDispatch } from '../../../store';
import { addMessage, updateMessage } from '../../../store/slices/messagesSlice';
import { 
  addConversation, 
  updateLastMessagePreview, 
  setActiveConversation 
} from '../../../store/slices/conversationsSlice';
import { showToast } from '../../../store/slices/uiSlice';
import { v4 as uuidv4 } from 'uuid';

interface UseChatOptions {
  agentType: string;
  conversationId?: string;
  onError?: (error: Error) => void;
  maxMessageLength?: number;
}

const useChat = ({ 
  agentType, 
  conversationId, 
  onError,
  maxMessageLength = 4000
}: UseChatOptions) => {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>(conversationId || '');
  const [error, setError] = useState<string | null>(null);

  // Helper to truncate content for preview
  const truncateForPreview = (content: string, maxLength = 50) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  // Generate a placeholder title for a new conversation
  const generateTitle = (content: string) => {
    const truncated = truncateForPreview(content, 30);
    // Remove any special characters that might look bad in a title
    return truncated.replace(/[^\w\s.,!?-]/g, '').trim();
  };

  // Helper to detect user typing
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    
    // Clear typing indicator after a short delay
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Send a message and get a response
  const sendMessage = useCallback(async (content: string) => {
    // Validate content
    if (!content.trim()) {
      setError('Message cannot be empty');
      dispatch(showToast({ 
        message: 'Message cannot be empty', 
        type: 'error' 
      }));
      return;
    }
    
    if (content.length > maxMessageLength) {
      setError(`Message is too long (maximum ${maxMessageLength} characters)`);
      dispatch(showToast({ 
        message: `Message is too long (maximum ${maxMessageLength} characters)`, 
        type: 'error' 
      }));
      return;
    }
    
    setError(null);
    
    try {
      let activeConversationId = currentConversationId;
      
      // If no conversation exists, create one
      if (!activeConversationId) {
        activeConversationId = uuidv4();
        setCurrentConversationId(activeConversationId);
        
        // Create a new conversation in the store
        dispatch(addConversation({
          id: activeConversationId,
          title: generateTitle(content),
          agentType,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          unreadCount: 0,
          status: 'active'
        }));
        
        // Set this as the active conversation
        dispatch(setActiveConversation(activeConversationId));
      }
      
      // Generate a unique ID for this message
      const messageId = uuidv4();
      
      // Add the user message to the store
      dispatch(addMessage({
        id: messageId,
        conversationId: activeConversationId,
        content: content.trim(),
        role: 'user',
        timestamp: Date.now(),
        agentType,
        status: 'sent'
      }));
      
      // Update the conversation's last message preview
      dispatch(updateLastMessagePreview({
        conversationId: activeConversationId,
        preview: truncateForPreview(content)
      }));
      
      // Set generating state to true
      setIsGenerating(true);
      
      // Make API call for the assistant's response (auto-reply)
      if (agentType === 'email') {
        try {
          // Dynamically import to avoid circular dependency if any
          const { autoReply } = await import('../../emailManager/api/emailApi');
          const response = await autoReply(
  activeConversationId ?? '',
  localStorage.getItem('email') ?? '',
  content.trim(),
  []
);
          const assistantMessageId = uuidv4();
          const responseText = response.answer || response.reply || 'Sorry, I could not generate a response.';

          dispatch(addMessage({
            id: assistantMessageId,
            conversationId: activeConversationId,
            content: responseText,
            role: 'assistant',
            timestamp: Date.now(),
            agentType,
            status: 'sent'
          }));

          dispatch(updateLastMessagePreview({
            conversationId: activeConversationId,
            preview: truncateForPreview(responseText)
          }));
          setIsGenerating(false);
        } catch (err) {
          setIsGenerating(false);
          setError('Failed to generate auto-reply.');
          dispatch(showToast({ message: 'Failed to generate auto-reply.', type: 'error' }));
        }
      } else {
        // fallback or other agent types...
        setTimeout(() => {
          const assistantMessageId = uuidv4();
          const response = `I've analyzed your request: "${truncateForPreview(content, 40)}". Based on the data, here are some actionable insights you can use to make strategic decisions.`;
          
          // Add the assistant's response to the store
          dispatch(addMessage({
            id: assistantMessageId,
            conversationId: activeConversationId,
            content: response,
            role: 'assistant',
            timestamp: Date.now(),
            agentType,
            status: 'sent'
          }));
          
          // Update the conversation's last message preview with the assistant's response
          dispatch(updateLastMessagePreview({
            conversationId: activeConversationId,
            preview: truncateForPreview(response)
          }));
          setIsGenerating(false);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsGenerating(false);
      setError('Failed to send message. Please try again.');
      
      dispatch(showToast({ 
        message: 'Failed to send message. Please try again.', 
        type: 'error' 
      }));
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [agentType, currentConversationId, dispatch, onError, maxMessageLength]);

  // Stop the generation process
  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    dispatch(showToast({ 
      message: 'Message generation stopped', 
      type: 'info' 
    }));
    // In a real implementation, this would cancel any ongoing requests
  }, [dispatch]);

  // Handle enhanced prompts
  const enhancePrompt = useCallback((originalPrompt: string) => {
    // This is a placeholder for prompt enhancement
    // In a real implementation, it would call an API to enhance the prompt
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        const enhanced = `${originalPrompt}\n\nPlease provide comprehensive analysis with specific data points and actionable recommendations.`;
        resolve(enhanced);
      }, 1500);
    });
  }, []);

  return {
    sendMessage,
    stopGeneration,
    enhancePrompt,
    isGenerating,
    isTyping,
    handleTyping,
    conversationId: currentConversationId,
    error
  };
};

export default useChat;