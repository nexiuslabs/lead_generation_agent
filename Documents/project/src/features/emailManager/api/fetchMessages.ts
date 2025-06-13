// Fetch messages for a conversation with Bearer token
type MessageAPIResponse = {
  id: number;
  is_user: boolean;
  content: string;
  created_at: string;
  file_urls: string[];
};

export const fetchMessages = async (conversationId: string) => {
  console.log("Message API is called")
  const token = localStorage.getItem('token');
  const response = await fetch(`https://api.nexiuslabs.com/messages/${conversationId}?page=1`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  console.log(`API /messages response:${conversationId}`, data); // DEBUG: Output the full API response
  // If paginated, adjust accordingly
  const messages: MessageAPIResponse[] = Array.isArray(data) ? data : data.results || [];
  return messages.map(msg => ({
    role: msg.is_user ? 'user' : 'assistant',
    content: msg.content,
    datetime: msg.created_at,
    id: msg.id,
    file_urls: msg.file_urls ?? [],
  }));
};
