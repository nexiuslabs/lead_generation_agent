// API functions for chat functionality

/**
 * Sends a message with files using form-data to the NexiusLabs API.
 * @param conversationId Conversation ID
 * @param senderEmail Sender's email
 * @param question The message body
 * @param files Array of File objects
 * @returns API response (including the 'answer')
 */
export const sendMessageWithFiles = async (
  conversationId: string,
  senderEmail: string,
  question: string,
  files: File[]
): Promise<any> => {
  const formData = new FormData();
  formData.append('conversation_id', conversationId);
  formData.append('sender', senderEmail);
  formData.append('question', question);
  formData.append('type', 'user_request');
  files.forEach((file) => {
    formData.append('files', file);
  });

  console.log('Sending message with files:', formData);
  // Send Email with Attachments
  const response = await fetch('https://api.agentdev.nexiuslabs.com/ask', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    // Do not set Content-Type header; browser will set it for multipart/form-data
  });
  if (!response.ok) {
    throw new Error('Failed to send message with files');
  }
  return response.json();
};

/**
 * Fetches conversations based on agent type
 * @param agentType The type of agent to fetch conversations for
 * @returns Promise with conversations
 */
export const fetchConversations = async (agentType: string) => {
  console.log('Fetching conversations for agent type:', agentType);

  if (agentType === 'emailManager') {
    // Call the real API for emailManager
    const response = await fetch('https://api.nexiuslabs.com/conversations?page=1', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    const data = await response.json();
    // Map API response to sidebar conversation format
    return (Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []).map((item: any) => ({
      id: String(item.id),
      title: item.title,
      preview: '', // No preview in API response
      timestamp: item.last_message_at ? new Date(item.last_message_at).getTime() : new Date(item.started_at).getTime(),
      isPinned: false,
      unread: false,
    }));
  }




  // For other agent types, use mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      if (agentType === 'procurementAgent') {
        resolve([
          {
            id: 'p1',
            title: 'Office Supplies Order',
            preview: 'Need to order new supplies for the office...',
            timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
            isPinned: true,
            unread: false
          },
          {
            id: 'p2',
            title: 'Vendor Contract Renewal',
            preview: 'The contract with our current vendor expires next month...',
            timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
            isPinned: false,
            unread: true
          },
          {
            id: 'p3',
            title: 'New Equipment Request',
            preview: 'The development team has requested new laptops...',
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
            isPinned: false,
            unread: false
          },
          {
            id: 'p4',
            title: 'Price Comparison',
            preview: 'I\'ve compared prices from different suppliers...',
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
            isPinned: false,
            unread: false
          }
        ]);
      } else {
        resolve([]);
      }
    }, 500); // Simulate network delay
  });
};

/**
 * Creates a new conversation
 * @param agentType The type of agent to create a conversation for
 * @param title Optional title for the conversation
 * @returns Promise with the created conversation
 */
export const createConversation = async (agentType: string, title?: string) => {
  console.log('Creating conversation for agent type:', agentType);
  
  // This would be a real API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `${agentType.charAt(0)}${Date.now()}`,
        title: title || `New ${agentType === 'emailManager' ? 'Email' : 'Procurement'} Thread`,
        preview: '',
        timestamp: Date.now(),
        isPinned: false,
        unread: false
      });
    }, 300);
  });
};

/**
 * Toggles pinned status for a conversation
 * @param conversationId The ID of the conversation
 * @param isPinned The new pinned status
 * @returns Promise with the updated conversation
 */
export const togglePinned = async (conversationId: string, isPinned: boolean) => {
  console.log('Toggling pinned status for conversation:', conversationId, isPinned);
  
  // This would be a real API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, conversationId, isPinned });
    }, 300);
  });
};

/**
 * Marks a conversation as read
 * @param conversationId The ID of the conversation
 * @returns Promise with the updated conversation
 */
export const markAsRead = async (conversationId: string) => {
  console.log('Marking conversation as read:', conversationId);
  
  // This would be a real API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, conversationId, unread: false });
    }, 300);
  });
};