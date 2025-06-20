import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../store';
import { setMessages, addMessage, Message as ChatMessage } from '../../store/slices/chatSlice';
import MessageInput from './MessageInput';

const ChatThread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.threads[threadId || ''] || []);

  useEffect(() => {
    if (!threadId) return;
    axios.get<ChatMessage[]>(`/api/chat/${threadId}/history`)
      .then(res => dispatch(setMessages({ threadId, messages: res.data })))
      .catch(() => {
        const sample: ChatMessage[] = [
          { sender: 'bot', text: 'Hello, how can I assist you today?', timestamp: new Date().toISOString() },
          { sender: 'user', text: 'I need help with my account.', timestamp: new Date().toISOString() }
        ];
        dispatch(setMessages({ threadId, messages: sample }));
      });
  }, [threadId, dispatch]);

  const handleSend = (text: string) => {
    if (!threadId) return;
    const userMsg: ChatMessage = { sender: 'user', text, timestamp: new Date().toISOString() };
    dispatch(addMessage({ threadId, message: userMsg }));
    axios.post(`/api/chat/${threadId}/message`, { text })
      .then(() => {
        const botMsg: ChatMessage = { sender: 'bot', text: `You said: "${text}"`, timestamp: new Date().toISOString() };
        dispatch(addMessage({ threadId, message: botMsg }));
      })
      .catch(err => console.error('Message send failed:', err));
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="p-4 text-xl font-bold">Chat Thread: {threadId}</h2>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg max-w-xs text-sm ${
              msg.sender === 'user'
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-300 text-gray-900 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-300 bg-white">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatThread;
