import { createSlice, createEntityAdapter, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Define message type
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  parentId?: string; // For threaded replies
  agentType?: string; // 'email' | 'procurement' | etc.
  metadata?: Record<string, any>; // Flexible metadata for agent-specific details
  status?: 'sending' | 'sent' | 'failed';
}

// Create the entity adapter
const messagesAdapter = createEntityAdapter<Message>({
  // Sort messages by timestamp
  sortComparer: (a, b) => a.timestamp - b.timestamp,
});

// Define the initial state using the adapter
const initialState = messagesAdapter.getInitialState({
  loading: false,
  error: null as string | null,
});

// Create the slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Add a new message (used for both sending and receiving)
    addMessage: messagesAdapter.addOne,

    // Add multiple messages (used for loading conversation history)
    addMessages: messagesAdapter.addMany,

    // Update a message (e.g., to change status from 'sending' to 'sent')
    updateMessage: messagesAdapter.updateOne,

    // Remove a message
    removeMessage: messagesAdapter.removeOne,

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
  addMessage,
  addMessages,
  updateMessage,
  removeMessage,
  setLoading,
  setError,
} = messagesSlice.actions;

// Export selectors
export const {
  selectAll: selectAllMessages,
  selectById: selectMessageById,
  selectIds: selectMessageIds,
} = messagesAdapter.getSelectors<RootState>((state) => state.messages);

// Custom selectors
export const selectMessagesByConversation = createSelector(
  [selectAllMessages, (state, conversationId: string) => conversationId],
  (messages, conversationId) => messages.filter(message => message.conversationId === conversationId)
);

export const selectMessagesByAgent = createSelector(
  [selectAllMessages, (state, agentType: string) => agentType],
  (messages, agentType) => messages.filter(message => message.agentType === agentType)
);

export const selectThreadedMessages = createSelector(
  [selectAllMessages, (state, parentId: string) => parentId],
  (messages, parentId) => messages.filter(message => message.parentId === parentId)
);

export default messagesSlice.reducer;