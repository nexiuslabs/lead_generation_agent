import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { selectAllAgents, selectActiveAgent, setActiveAgent } from '../../../store/slices/agentsSlice';

interface AgentSelectorProps {
  onAgentChange?: (agentId: string) => void;
  className?: string;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  onAgentChange,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector(selectAllAgents);
  const activeAgent = useAppSelector(selectActiveAgent);

  const handleAgentChange = (agentId: string) => {
    dispatch(setActiveAgent(agentId));
    if (onAgentChange) {
      onAgentChange(agentId);
    }
  };

  if (agents.length <= 1) {
    return null; // Don't show selector if there's only one agent
  }

  return (
    <div className={`py-2 px-4 ${className}`}>
      <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        Select Agent
      </div>
      <div className="flex flex-wrap gap-2">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => handleAgentChange(agent.id)}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center transition-colors duration-200 ${
              activeAgent?.id === agent.id
                ? 'bg-secondary-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-dark-secondary text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-tertiary'
            }`}
            aria-pressed={activeAgent?.id === agent.id}
          >
            <span className="mr-2">{agent.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgentSelector;