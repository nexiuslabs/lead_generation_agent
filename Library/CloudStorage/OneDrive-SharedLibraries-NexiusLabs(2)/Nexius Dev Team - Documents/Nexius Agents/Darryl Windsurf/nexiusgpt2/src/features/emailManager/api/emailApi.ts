/**
 * Send a message (with or without files) to the backend /ask endpoint using FormData.
 * @param conversationId Conversation ID
 * @param senderEmail Sender's email
 * @param question The message body
 * @param files (Optional) Array of File objects
 * @returns API response (including the 'answer')
 */
export const autoReply = async (
  conversationId: string,
  senderEmail: string,
  question: string,
  files?: File[]
): Promise<any> => {
  const formData = new FormData();
  formData.append('conversation_id', conversationId);
  formData.append('sender', senderEmail);
  formData.append('question', question);
  formData.append('type', 'user_request');
  (files || []).forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch('http://localhost:8000/ask', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    // Do not set Content-Type header; browser will set it for multipart/form-data
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};

/**
 * Send a message (with or without files) to the backend /ask endpoint using FormData.
 * This is called when the Send Reply button is clicked.
 * @param conversationId Conversation ID
 * @param senderEmail Sender's email
 * @param question The message body
 * @param files (Optional) Array of File objects
 * @returns API response (including the 'answer')
 */
export const sendReply = async (
  conversationId: string,
  senderEmail: string,
  question: string,
  files?: File[]
): Promise<any> => {
  const formData = new FormData();
  formData.append('conversation_id', conversationId);
  formData.append('sender', senderEmail);
  formData.append('question','Send email ' + question);
  formData.append('type', 'user_request');
  (files || []).forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch('http://localhost:8000/ask', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    // Do not set Content-Type header; browser will set it for multipart/form-data
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};


/**
 * Creates a new email conversation via the backend API.
 * @returns {Promise<any>} - The new conversation object from the API.
 */
export const createEmailConversation = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.nexiuslabs.com/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title: 'New Conversation' }),
  });
  if (!response.ok) {
    throw new Error('Failed to create new conversation');
  }
  return response.json();
};

/**
 * Retrieves tasks for the current user via the backend API.
 * @returns {Promise<any[]>} - The list of task objects from the API.
 */
export const getTaskItems = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.nexiuslabs.com/tasks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  });
  if (!response.ok) {
    throw new Error('Failed to retrieve task items');
  }
  return response.json();
};

/**
 * Marks a task as done via the backend API.
 * @param {string} taskId - The task ID to mark as done.
 * @returns {Promise<any>} - The API response.
 */
export const markTaskAsDone = async (taskId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://api.nexiuslabs.com/tasks/${taskId}/done`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  });
  if (!response.ok) {
    throw new Error('Failed to mark task as done');
  }
  return response.json();
};

/**
 * Retrieves an email by task ID via the backend API.
 * @param {string} taskId - The task ID to retrieve an email for.
 * @returns {Promise<any>} - The API response.
 */
export const getEmailByTaskId = async (taskId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://api.nexiuslabs.com/tasks/${taskId}/fetch_mail`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  });
  if (!response.ok) {
    throw new Error('Failed to retrieve email by task ID');
  }
  return response.json();
};


export const createDraftReply = async (taskId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://api.agentdev.nexiuslabs.com/tasks/${taskId}/draftReply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    throw new Error('Failed to create draft reply');
  }
  return response.json();
};
