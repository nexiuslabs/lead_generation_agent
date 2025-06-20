import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface ChatState {
  threads: Record<string, Message[]>;
}

const initialState: ChatState = {
  threads: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (
      state,
      action: PayloadAction<{ threadId: string; messages: Message[] }>
    ) => {
      const { threadId, messages } = action.payload;
      state.threads[threadId] = messages;
    },
    addMessage: (
      state,
      action: PayloadAction<{ threadId: string; message: Message }>
    ) => {
      const { threadId, message } = action.payload;
      if (!state.threads[threadId]) {
        state.threads[threadId] = [];
      }
      state.threads[threadId].push(message);
    }
  }
});

export const { setMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
