import React, { useState } from 'react';
import { MessageSquare, Globe, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';

interface HeaderProps {
  activeTab?: 'chat' | 'preview';
  setActiveTab?: (tab: 'chat' | 'preview') => void;
  chatStarted: boolean;
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  chatStarted,
  isSidebarCollapsed = false
}) => {

  const navigate = useNavigate();
  
  // Handler to explicitly log the tab change
  const handleTabChange = (tab: 'chat' | 'preview') => {
    if (setActiveTab) {
      console.log(`Switching to tab: ${tab}`);
      setActiveTab(tab);
    }
  };

  return (
    <>
      <header className={`flex items-center justify-between p-4 bg-white dark:bg-dark ${chatStarted ? 'border-b border-gray-200 dark:border-gray-secondary' : ''}`}>
        <a 
          href="/" 
          className="flex items-center gap-2 text-primary-700 dark:text-white font-bold text-xl tracking-tight uppercase"
        >
          <MessageSquare size={24} />
          <span className="hidden sm:inline tracking-widest">NexiusGPT</span>
        </a>
        
        <div className="flex items-center gap-3">
          {setActiveTab && (
            <>
              <button
                onClick={() => handleTabChange('chat')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  activeTab === 'chat' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-dark-tertiary text-gray-700 dark:text-gray-300'
                }`}
              >
                <MessageSquare size={20} />
                <span className="ml-2 hidden md:inline">Chat</span>
              </button>
              <button
                onClick={() => handleTabChange('preview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  activeTab === 'preview' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 'hover:bg-gray-100 dark:hover:bg-dark-tertiary text-gray-700 dark:text-gray-300'
                }`}
              >
                <Globe size={20} />
                <span className="ml-2 hidden md:inline">Preview</span>
              </button>
            </>
          )}

        </div>
      </header>
      

    </>
  );
};

export default Header;