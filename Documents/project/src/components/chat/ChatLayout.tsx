import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ConversationList from './ConversationList';
import Chat from './Chat';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';

interface ChatLayoutProps {
  chatStarted: boolean;
  setChatStarted: (started: boolean) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ chatStarted, setChatStarted }) => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-full bg-white dark:bg-dark">
      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 md:hidden"
        aria-label="Toggle conversation list"
      >
        {sidebarVisible ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      {/* Conversation Sidebar */}
      <div className={`
        ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-16' : 'w-80'}
        fixed md:relative z-40 h-full transition-all duration-300 ease-in-out
        md:translate-x-0
      `}>
        <ConversationList 
          isCollapsed={sidebarCollapsed}
          onNewChat={() => {
            // Close sidebar on mobile after creating new chat
            if (window.innerWidth < 768) {
              setSidebarVisible(false);
            }
          }}
        />
        
        {/* Collapse toggle for desktop */}
        <button
          onClick={toggleSidebarCollapse}
          className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 p-1 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarVisible && !sidebarCollapsed ? 'md:ml-0' : ''
      }`}>
        {conversationId ? (
          <Chat 
            chatStarted={chatStarted} 
            setChatStarted={setChatStarted}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-[#00CABA] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">N</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1D2A4D] dark:text-white mb-3">
                Welcome to Nexius
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Your intelligent assistant for data-driven insights and actionable intelligence. 
                Start a new conversation or select an existing one to continue.
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p className="font-medium">Try asking about:</p>
                <ul className="space-y-1">
                  <li>• Market analysis and trends</li>
                  <li>• Business strategy recommendations</li>
                  <li>• Data interpretation and insights</li>
                  <li>• Process optimization</li>
                </ul>
              </div>
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Thread Context:</strong> Each conversation maintains its own history, 
                which persists across sessions and page reloads.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;