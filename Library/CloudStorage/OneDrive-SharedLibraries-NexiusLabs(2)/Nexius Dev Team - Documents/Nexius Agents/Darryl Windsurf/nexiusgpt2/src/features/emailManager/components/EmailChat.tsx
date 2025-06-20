import React, { useState, useEffect, useRef } from 'react';
import { useEmailChatContext } from './EmailChatContext';
import { useChat } from '../../chatCore';
import { ChatLayout } from '../../chatCore';
import EmailToolbar from './EmailToolbar';
import { Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchMessages } from '../api/fetchMessages';
import { autoReply } from '../api/emailApi';
import { useAppDispatch } from '../../../store';
import { fetchTasks } from '../../../store/slices/tasksSlice';



interface EmailChatProps {
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
}

interface EmailChatControlProps {
  setPreviewDraftReply: (draft: string) => void;
  setPreviewInitialTab: (tab: 'email' | 'reply' | 'notes') => void;
  setIsPreviewCollapsed: (collapsed: boolean) => void;
}

type Props = EmailChatProps & EmailChatControlProps;

const EmailChat: React.FC<Props> = ({ chatStarted, setChatStarted, setPreviewDraftReply, setPreviewInitialTab, setIsPreviewCollapsed }) => {
  const { messages, setMessages, conversationId, setConversationId } = useEmailChatContext()!;
  const { conversationId: routeId } = useParams<{ conversationId: string }>();
  const dispatch = useAppDispatch();

  // Local state for pending (optimistic) messages
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [messageSending, setMessageSending] = useState(false);

  // Only fetch messages when conversationId changes, and only clear if conversationId actually changed
  useEffect(() => {
    // Sync context conversationId from route if needed
    if (!conversationId && routeId) {
      setConversationId(routeId);
      return;
    }
    if (!conversationId) {
      setMessages([]);
      setPendingMessages([]);
      console.log('[EmailChat] No conversationId, cleared messages');
      return;
    }
    setLoadingHistory(true);
    console.log('[EmailChat] Fetching messages for conversationId:', conversationId);
    fetchMessages(conversationId)
      .then((msgs: any[]) => {
        setMessages(msgs);
        // Remove any pending messages that are now confirmed by backend (by id or content)
        setPendingMessages((pending) => pending.filter(
          (pmsg) => !msgs.some(
            (msg: any) => msg.id === pmsg.id || (msg.role === pmsg.role && msg.content === pmsg.content)
          )
        ));
        console.log('[EmailChat] Processed messages (after set):', msgs);
      })
      .catch((err) => {
        setMessages([]);
        setPendingMessages([]);
        console.error('[EmailChat] Failed to fetch messages:', err);
      })
      .finally(() => setLoadingHistory(false));
  }, [conversationId, routeId, setConversationId, setMessages]);

  // Initialize chat with email agent type
  const { 
    stopGeneration, 
    isGenerating, 
    conversationId: chatConversationId 
  } = useChat({ 
    agentType: 'email',
    conversationId: conversationId?.toString()
  });

  // Local state for loading history
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check for task-related messages and refresh tasks
  useEffect(() => {
    const mergedMsgs = [...messages, ...pendingMessages];
    if (mergedMsgs.length === 0) return;
    
    // Check the last message
    const lastMsg = mergedMsgs[mergedMsgs.length - 1];
    
    // If it's a bot message and contains "task" keyword, refresh tasks
    if (lastMsg && lastMsg.role === 'assistant' && 
        lastMsg.content.toLowerCase().includes('task')) {
      dispatch(fetchTasks());
    }
  }, [messages, pendingMessages, dispatch]);

  // Handle sending a message (user)
  const handleSendMessage = async (content: string) => {
    setChatStarted(true);
    setMessageSending(true);
    
    try {
      const optimisticUserMsg = {
        id: `${Date.now()}-user-${Math.random().toString(36).substring(2, 9)}`,
        role: 'user',
        content,
        datetime: new Date().toISOString(),
        pending: true
      };
      setPendingMessages((prev) => [...prev, optimisticUserMsg]);
      
      const apiResponse = await autoReply(
        conversationId ?? '',
        localStorage.getItem('email') ?? '',
        content,
        []
      );
      // Handle different API response types
      if (apiResponse.type === 'email_sent' && apiResponse.answer) {
        // Post assistant message in chat panel using 'answer' as content
        const emailSentMsg = {
          id: `${Date.now()}-assistant-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: apiResponse.answer,
          datetime: new Date().toISOString(),
          pending: false
        };
        setMessages((prev) => [...prev, emailSentMsg]);
      } else if (apiResponse.type === 'email_written' && apiResponse.answer) {
        // If the response is an email draft, open PreviewPanel, select 'reply', and set draft
        setPreviewDraftReply(apiResponse.answer);
        setPreviewInitialTab('reply');
        setIsPreviewCollapsed(false);
        // Also post the draft as an assistant message in chat panel
        const draftMsg = {
          id: `${Date.now()}-assistant-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: apiResponse.answer,
          datetime: new Date().toISOString(),
          pending: false
        };
        setMessages((prev) => [...prev, draftMsg]);
      } else if (apiResponse.answer) {
        // Fallback: just post the answer
        const fallbackMsg = {
          id: `${Date.now()}-assistant-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: apiResponse.answer,
          datetime: new Date().toISOString(),
          pending: false
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (error) {
      const optimisticAssistantMsg = {
        id: `${Date.now()}-assistant-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: 'Sorry, I was unable to generate a reply. Please try again.',
        datetime: new Date().toISOString(),
        pending: false
      };
      setMessages((prev) => [...prev, optimisticAssistantMsg]);
    } finally {
      setMessageSending(false);
    }
  };

  // Merge context messages (from backend) with pendingMessages (optimistic)
  const mergedMessages = [...messages, ...pendingMessages];



  // Debug: Log mergedMessages before rendering
  console.log('[EmailChat] mergedMessages:', mergedMessages);

  const emailConfig = {
    agent: {
      id: 'email',
      type: 'email',
      name: 'Email Assistant',
      description: 'Help with drafting, replying to, and analyzing emails',
      icon: <Mail size={20} />,
      capabilities: ['email drafting', 'reply suggestions', 'tone analysis'],
      placeholderText: 'Ask me to draft, reply to, or analyze emails...',
      emptyStateContent: (
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-primary-500 dark:text-white mb-2">
            Welcome to the Email Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            I can help you draft professional emails, suggest replies, analyze tone, and more. Try asking:
          </p>
          <ul className="mt-4 text-left text-gray-600 dark:text-gray-400 space-y-2">
            <li>"Draft an email to schedule a meeting with the marketing team"</li>
            <li>"Help me reply to this client feedback"</li>
            <li>"Analyze the tone of this email"</li>
          </ul>
        </div>
      )
    },
    toolbar: <EmailToolbar />,
    attachmentsEnabled: true,
    enhancePromptEnabled: true,
    maxMessageLength: 4000
  };

  return (
    <div className="relative h-screen w-full flex flex-col">
      {loadingHistory && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00CABA]" />
        </div>
      )}
      {/* Banner and Toolbar (sticky at top) */}

      {/* Scrollable message area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#F5F7FA] dark:bg-dark-secondary dark:border-gray-700">
        <ChatLayout
          config={emailConfig}
          chatStarted={chatStarted}
          setChatStarted={setChatStarted}
          conversationId={conversationId || chatConversationId}
          onSendMessage={handleSendMessage}
          onStopGeneration={stopGeneration}
          isGenerating={isGenerating}
          messages={mergedMessages}
          addMessageToPanel={(msg: any) => setMessages((prev: any[]) => [...prev, msg])}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default EmailChat;