import React from 'react';
import ProcurementChat from './components/ProcurementChat';

interface ProcurementAgentProps {
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
}

// This component is a wrapper for ProcurementChat to maintain compatibility with the existing App structure
const ProcurementAgent: React.FC<ProcurementAgentProps> = ({ chatStarted, setChatStarted }) => {
  return (
    <ProcurementChat 
      chatStarted={chatStarted} 
      setChatStarted={setChatStarted} 
    />
  );
};

export default ProcurementAgent;