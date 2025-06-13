import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { Mail, ShoppingCart } from 'lucide-react';

// Define agent type
export interface Agent {
  id: string;
  type: string; // 'email' | 'procurement' | etc.
  name: string;
  description: string;
  icon: string; // Lucide icon name or other identifier
  capabilities: string[];
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Create the entity adapter
const agentsAdapter = createEntityAdapter<Agent>({
  // Sort agents alphabetically by name
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// Define the initial state using the adapter
const initialState = agentsAdapter.getInitialState({
  activeAgentId: null as string | null,
  loading: false,
  error: null as string | null,
});

// Preload with available agents
const preloadedState = agentsAdapter.setAll(initialState, [
  {
    id: 'email',
    type: 'email',
    name: 'Email Assistant',
    description: 'Help with drafting, replying to, and analyzing emails',
    icon: 'mail',
    capabilities: ['email drafting', 'reply suggestions', 'tone analysis'],
    isActive: true
  },
  {
    id: 'procurement',
    type: 'procurement',
    name: 'Procurement Assistant',
    description: 'Help with sourcing, buying, and managing inventory',
    icon: 'shopping-cart',
    capabilities: ['procurement planning', 'vendor management', 'inventory tracking'],
    isActive: true
  }
]);

// Create the slice
const agentsSlice = createSlice({
  name: 'agents',
  initialState: preloadedState,
  reducers: {
    // Add a new agent
    addAgent: agentsAdapter.addOne,

    // Add multiple agents
    addAgents: agentsAdapter.addMany,

    // Update an agent
    updateAgent: agentsAdapter.updateOne,

    // Remove an agent
    removeAgent: agentsAdapter.removeOne,

    // Set active agent
    setActiveAgent: (state, action: PayloadAction<string | null>) => {
      state.activeAgentId = action.payload;
    },

    // Toggle agent active status
    toggleAgentActive: (state, action: PayloadAction<string>) => {
      const agent = state.entities[action.payload];
      if (agent) {
        agent.isActive = !agent.isActive;
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
  addAgent,
  addAgents,
  updateAgent,
  removeAgent,
  setActiveAgent,
  toggleAgentActive,
  setLoading,
  setError,
} = agentsSlice.actions;

// Export selectors
export const {
  selectAll: selectAllAgents,
  selectById: selectAgentById,
  selectIds: selectAgentIds,
} = agentsAdapter.getSelectors<RootState>((state) => state.agents);

// Custom selectors
export const selectActiveAgent = (state: RootState) => {
  const activeId = state.agents.activeAgentId;
  return activeId ? state.agents.entities[activeId] : null;
};

export const selectActiveAgents = (state: RootState) => {
  return selectAllAgents(state).filter(agent => agent.isActive);
};

export default agentsSlice.reducer;