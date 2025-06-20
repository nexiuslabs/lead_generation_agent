import { createAsyncThunk } from '@reduxjs/toolkit';
import { addMessage, updateMessage } from './messagesSlice';
import { sendMessageWithFiles } from "../../features/chatCore/api/chatApi";

interface SendMessageParams {
  conversationId: string;
  content: string;
  files?: File[];
}

export const sendMessageAsync = createAsyncThunk<any, SendMessageParams, { rejectValue: string }>(
  'messages/sendMessage',
  async ({ conversationId, content, files = [] }, { dispatch, rejectWithValue }) => {
    const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMsg = {
      id: tempId,
      conversationId,
      content,
      role: 'user' as const,
      timestamp: Date.now(),
      status: 'sending' as const,
    };
    dispatch(addMessage(userMsg));
    try {
      const senderEmail = localStorage.getItem('email') || '';
      const response = await sendMessageWithFiles(conversationId, senderEmail, content, files);
      dispatch(updateMessage({ id: tempId, changes: { status: 'sent' } }));
      const assistantId = response.id || `assistant-${Date.now()}`;
      const assistantContent = response.answer || response.message || '';
      const assistantMsg = {
        id: assistantId,
        conversationId,
        content: assistantContent,
        role: 'assistant' as const,
        timestamp: Date.now(),
        status: 'sent' as const,
      };
      dispatch(addMessage(assistantMsg));
      return response;
    } catch (err: any) {
      dispatch(updateMessage({ id: tempId, changes: { status: 'failed' } }));
      return rejectWithValue(err.message);
    }
  }
);
