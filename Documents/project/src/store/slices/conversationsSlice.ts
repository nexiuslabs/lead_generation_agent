import { createSlice, createEntityAdapter, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Define conversation type
export interface Conversation {
  id: string;
  title: string;
  agentType: string; // 'email' | 'procurement' | etc.
  createdAt: number;
  updatedAt: number;
  lastMessagePreview?: string;
  unreadCount: number;
  status: 'active' | 'archived' | 'completed';
  participants?: string[]; // User IDs or email addresses for threads
  metadata?: Record<string, any>; // Additional data like email subject, thread ID, etc.
}

// Create the entity adapter
const conversationsAdapter = createEntityAdapter<Conversation>({
  // Sort conversations by most recently updated
  sortComparer: (a, b) => b.updatedAt - a.updatedAt,
});

// Define the initial state using the adapter
const initialState = conversationsAdapter.getInitialState({
  activeConversationId: null as string | null,
  loading: false,
  error: null as string | null,
});

// Create the slice
const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    // Add a new conversation
    addConversation: conversationsAdapter.addOne,

    // Add multiple conversations (used for loading conversation history)
    addConversations: conversationsAdapter.addMany,

    // Update a conversation
    updateConversation: conversationsAdapter.updateOne,

    // Remove a conversation
    removeConversation: conversationsAdapter.removeOne,

    // Set active conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },

    // Increment unread count for a conversation
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversation = state.entities[action.payload];
      if (conversation) {
        conversation.unreadCount += 1;
      }
    },

    // Reset unread count for a conversation
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const conversation = state.entities[action.payload];
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },

    // Update last message preview
    updateLastMessagePreview: (
      state,
      action: PayloadAction<{ conversationId: string; preview: string }>
    ) => {
      const { conversationId, preview } = action.payload;
      const conversation = state.entities[conversationId];
      if (conversation) {
        conversation.lastMessagePreview = preview;
        conversation.updatedAt = Date.now();
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  addConversation,
  addConversations,
  updateConversation,
  removeConversation,
  setActiveConversation,
  incrementUnreadCount,
  resetUnreadCount,
  updateLastMessagePreview,
  setLoading,
  setError,
} = conversationsSlice.actions;

// Export selectors
export const {
  selectAll: selectAllConversations,
  selectById: selectConversationById,
  selectIds: selectConversationIds,
} = conversationsAdapter.getSelectors<RootState>((state) => state.conversations);

// Custom selectors
export const selectActiveConversation = (state: RootState) => {
  const activeId = state.conversations.activeConversationId;
  return activeId ? state.conversations.entities[activeId] : null;
};

export const selectConversationsByAgent = createSelector(
  [selectAllConversations, (state, agentType: string) => agentType],
  (conversations, agentType) => conversations.filter(conversation => conversation.agentType === agentType)
);

export const selectConversationsByDate = createSelector(
  [selectAllConversations],
  (conversations) => {
    const grouped: Record<string, Conversation[]> = {};
    
    // Helper to get date key
    const getDateKey = (timestamp: number) => {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      // Check if it's yesterday
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // Current week
      const dayDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
      if (dayDiff < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
      }
      
      // This month
      if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        return 'This Month';
      }
      
      // Default to the month and year
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    // Group conversations by date
    conversations.forEach(conversation => {
      const dateKey = getDateKey(conversation.updatedAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(conversation);
    });
    
    return grouped;
  }
);

export default conversationsSlice.reducer;