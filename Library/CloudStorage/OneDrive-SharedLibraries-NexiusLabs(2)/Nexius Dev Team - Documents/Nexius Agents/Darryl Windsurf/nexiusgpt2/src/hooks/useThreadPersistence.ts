import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { setActiveConversation } from '../store/slices/conversationsSlice';

/**
 * Custom hook to manage thread context persistence across page reloads and navigation
 * Ensures conversation state is maintained when users switch threads or reload the page
 */
export const useThreadPersistence = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Store the current thread ID in localStorage for session persistence
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('lastConversationId', conversationId);
      localStorage.setItem('lastChatRoute', location.pathname);
      dispatch(setActiveConversation(conversationId));
    }
  }, [conversationId, location.pathname, dispatch]);

  // Restore the last conversation on app initialization (after login/reload)
  useEffect(() => {
    // Only run once on mount when there's no conversationId in URL
    if (!conversationId && location.pathname === '/chat') {
      const lastConversationId = localStorage.getItem('lastConversationId');
      const lastChatRoute = localStorage.getItem('lastChatRoute');
      
      // If we have a stored conversation ID and we're on a general chat route
      if (lastConversationId && lastChatRoute && lastChatRoute.startsWith('/chat/')) {
        // Restore the exact route if it was a specific conversation
        navigate(lastChatRoute, { replace: true });
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Clean up stored thread ID on logout
  const clearPersistedThread = () => {
    localStorage.removeItem('lastConversationId');
    localStorage.removeItem('lastChatRoute');
  };

  return {
    currentThreadId: conversationId,
    clearPersistedThread
  };
};

/**
 * Hook to handle thread switching with proper state management
 */
export const useThreadSwitching = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const switchToThread = (threadId: string) => {
    dispatch(setActiveConversation(threadId));
    navigate(`/chat/${threadId}`);
  };

  const createNewThread = () => {
    // Navigate to base chat route, which will create a new thread
    navigate('/chat');
  };

  return {
    switchToThread,
    createNewThread
  };
};