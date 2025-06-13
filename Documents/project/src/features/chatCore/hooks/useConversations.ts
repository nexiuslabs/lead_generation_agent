import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { fetchConversations } from '../api/chatApi';
import type { Conversation } from '../types';

export function useConversations(agentType: string, rawFilter: string = '') {
  const [hasFetched, setHasFetched] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(rawFilter);

  // Fetch conversations when agent changes
  useEffect(() => {
    setLoading(true);
    fetchConversations(agentType)
      .then((data) => {
        console.log('[useConversations] Data from API', data);
        setConversations(data);
        setHasFetched(true);
        setLoading(false); // Move this here to ensure conversations updates first
      })
      .catch((err) => {
        console.error('[useConversations] Error fetching conversations', err);
        setHasFetched(true);
        setLoading(false);
      });
  }, [agentType]);

  // Debounced filter setter
  const updateFilter = useCallback(
    debounce((q: string) => setFilter(q), 300),
    []
  );

  // Memoized filtered list
  const visible = useMemo(() => {
    if (!filter) return conversations;
    return conversations.filter(conv =>
      conv.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [conversations, filter]);

  return { visible, loading, updateFilter, hasFetched };
}