import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mail,
  ShoppingCart,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Clock,
  CheckCircle,
  Settings as SettingsIcon,
  HelpCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConversations } from '../features/chatCore/hooks/useConversations';
import { createConversation } from '../features/chatCore/api/chatApi';
import { createEmailConversation, getEmailByTaskId } from '../features/emailManager/api/emailApi';
import { fetchMessages } from '../features/emailManager/api/fetchMessages';
import { useEmailChatContext } from '../features/emailManager/components/EmailChatContext';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  selectAllTasks, 
  selectTasksLoading, 
  selectTasksError,
  selectMarkingDoneId,
  markTaskDone, 
  fetchTasks 
} from '../store/slices/tasksSlice';


interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  setShowHelpCenter?: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  onTaskSelect?: () => void;
  setPreviewTaskTitle: (title: string) => void;
  setPreviewEmail: (email: any) => void;
  setPreviewTaskId: (id: string) => void;
  setPreviewEmailLoading?: (loading: boolean) => void;
}

// Agent registry – can be expanded as more agents are added
const AGENTS = [
  { key: 'emailManager', path: '/chat/email', label: 'Email Assistant', icon: <Mail size={18} /> },
  { key: 'procurementAgent', path: '/chat/procurement', label: 'Procurement Assistant', icon: <ShoppingCart size={18} /> }
];

// Folder component (unchanged)
const FolderComponent: React.FC<{
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  isActive: boolean;
}> = ({ label, icon, isOpen, onToggle, onNewChat, isActive }) => {
  return (
    <div className={`mb-2 ${isActive ? 'bg-gray-100 dark:bg-gray-700 rounded-md' : ''}`}>
      <div
        className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center flex-1">
          {isOpen ? (
            <FolderOpen size={18} className="mr-2 text-gray-500" />
          ) : (
            <Folder size={18} className="mr-2 text-gray-500" />
          )}
          <span className="flex items-center">
            {icon}
            <span className="ml-2">{label}</span>
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNewChat();
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
          title={`New ${label} chat`}
        >
          <PlusCircle
            size={16}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          />
        </button>
      </div>
    </div>
  );
};

// Conversation item component (unchanged)
const ConversationItem = React.memo(({ conversation, activeId, onClick }: any) => {
  const isActive = activeId === conversation.id;
  const formattedDate = new Date(conversation.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <li role="option" aria-selected={isActive} className="pl-8">
      <button
        onClick={() => onClick(conversation)}
        className={`w-full px-3 py-2 text-left rounded-md mb-1 flex flex-col ${
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20'
            : 'hover:bg-gray-100 dark:hover:bg-dark-tertiary'
        }`}
        title={conversation.title}
      >
        <div className="flex justify-between items-start">
          <span
            className={`font-medium truncate ${
              conversation.unread ? 'text-primary-600 dark:text-primary-400' : ''
            }`}
          >
            {conversation.title}
          </span>
          {conversation.unread && <div className="h-2 w-2 rounded-full bg-primary-500 ml-1"></div>}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[70%]">
            {conversation.preview}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
        </div>
      </button>
    </li>
  );
});
ConversationItem.displayName = 'ConversationItem';

// ──────────────────────────────────────────────────────────────────────────────
// ────────────────── New "TaskCard" and "Tasks" logic starts here ─────────────────
// ──────────────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  snippet: string;
  due: 'Tomorrow' | `In ${number} days`;
  isDone: boolean;
}

const TaskCard: React.FC<{
  task: Task;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkDone: (id: string) => void;
  isMarking?: boolean;
}> = ({ task, isSelected, onSelect, onMarkDone, isMarking = false }) => {
  const isTomorrow = task.due === 'Tomorrow';
  const iconColor = isTomorrow ? '#FF9F43' : '#34D399';

  return (
    <div
      onClick={() => onSelect(task.id)}
      className={`
        flex items-start justify-between w-full cursor-pointer 
        ${isSelected
          ? 'bg-[#F5F7FA] dark:bg-[#22335c] border-l-4 border-[#1D2A4D]'
          : 'bg-white dark:bg-[#1D2A4D]'}
        hover:bg-[#F5F7FA] dark:hover:bg-[#22335c]
        px-3 py-2 rounded-md
      `}
      style={{ transition: 'background-color 0.2s' }}
    >
      {/* Left: Clock icon + "Tomorrow" / "In X days" */}
      <div className="flex flex-col items-center mr-2">
        <Clock size={24} style={{ color: iconColor }} />
        <span className="mt-1 text-[12px] uppercase tracking-wide text-[#00CABA] dark:text-[#00CABA] font-semibold">
          {task.due}
        </span>
      </div>

      {/* Center: Title + Snippet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <span
          className={`
            text-[16px] font-bold mb-1 break-words whitespace-normal
            ${task.isDone ? 'line-through text-gray-400 dark:text-gray-600' : 'text-[#3A3A3A] dark:text-[#F5F7FA]'}
          `}
          style={{ color: task.isDone ? undefined : undefined }}
        >
          {task.title}
        </span>
        <span className={`truncate text-[13px] text-[#3A3A3A] dark:text-[#F5F7FA]`}>
          {task.snippet}
        </span>
      </div>

      {/* Right: "Mark Done" icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!task.isDone && !isMarking) {
            onMarkDone(task.id);
          }
        }}
        className="ml-2 flex-shrink-0 self-center p-1 rounded-full transition-colors"
        title={task.isDone ? 'Already done' : isMarking ? 'Marking as done...' : 'Mark done'}
        disabled={task.isDone || isMarking}
      >
        {isMarking ? (
          <div className="animate-spin h-5 w-5 border-2 border-[#1E3A8A] border-t-transparent rounded-full"></div>
        ) : (
          <CheckCircle
            size={24}
            className={`${task.isDone ? 'text-[#1E3A8A]' : 'text-[#888] hover:text-[#1E3A8A]'} transition-colors`}
          />
        )}
      </button>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

interface SidebarTaskPreviewProps {
  setPreviewTaskTitle: (title: string) => void;
  setPreviewEmail: (email: any) => void; // TODO: type properly
  setPreviewTaskId: (id: string) => void;
  setPreviewEmailLoading?: (loading: boolean) => void;
}

const Sidebar: React.FC<
  SidebarProps & SidebarTaskPreviewProps & { onMessagesFetched?: (messages: any[], conversationId: string) => void; onTaskSelect?: () => void }
> = ({ isMobile, isOpen, isCollapsed = false, toggleCollapse, setShowHelpCenter, showSettings, setShowSettings, onMessagesFetched, onTaskSelect, setPreviewTaskTitle, setPreviewEmail, setPreviewTaskId, setPreviewEmailLoading }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const emailChatContext = useEmailChatContext();
  const setMessages = emailChatContext?.setMessages;
  const setConversationId = emailChatContext?.setConversationId;
  const safeToggleCollapse = toggleCollapse ?? (() => {});

  const [activeAgent, setActiveAgent] = useState<string>('emailManager');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const { visible: conversations, loading, updateFilter, hasFetched } = useConversations(activeAgent, '');
  const hasInitialized = useRef(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // ────────────────────────────────── Using Redux for Tasks ────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const tasksLoading = useAppSelector(selectTasksLoading);
  const tasksError = useAppSelector(selectTasksError);
  const markingDoneId = useAppSelector(selectMarkingDoneId);

  // Fetch tasks from API on mount
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleTaskSelect = async (id: string) => {
    setSelectedTask(id);
    setPreviewTaskId(id);
    if (typeof setPreviewEmailLoading === 'function') setPreviewEmailLoading(true);
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setPreviewTaskTitle(task.title);
      try {
        const email = await getEmailByTaskId(id);
        setPreviewEmail(email);
      } catch (err) {
        setPreviewEmail({ subject: '', sender: '', bodyPreview: 'Failed to load email content.', attachments: [] });
      }
    }
    if (typeof setPreviewEmailLoading === 'function') setPreviewEmailLoading(false);
    if (onTaskSelect) onTaskSelect();
  };


  const handleMarkDone = (id: string) => {
    dispatch(markTaskDone(id));
    setSelectedTask(id);
  };

  // ──────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (loading || !hasFetched || hasInitialized.current || !conversations) return;
    if (Array.isArray(conversations) && conversations.length === 0) {
      if (!loading && hasInitialized.current) return;
    }

    const path = location.pathname;
    let agentKey = '';
    let conversationId: string | null = null;

    if (path.startsWith('/chat/email')) {
      agentKey = 'emailManager';
      const match = path.match(/^\/chat\/email\/(\w+)/);
      if (match && match[1]) {
        conversationId = match[1];
      }
    } else if (path.startsWith('/chat/procurement')) {
      agentKey = 'procurementAgent';
      const match = path.match(/^\/chat\/procurement\/(\w+)/);
      if (match && match[1]) {
        conversationId = match[1];
      }
    }

    if (agentKey && !isCollapsed) {
      setActiveAgent(agentKey);
      setOpenFolders((prev) => ({ ...prev, [agentKey]: true }));
    }

    if (conversationId) {
      setActiveConversation(conversationId);
      hasInitialized.current = true;
      return;
    }

    if ((agentKey === 'emailManager' || (!agentKey && activeAgent === 'emailManager')) && !isCollapsed) {
      (async () => {
        if (conversations.length === 0) {
          try {
            const response = await createEmailConversation();
            const newConversationId = response.id || response.conversation_id || response.conversationId;
            if (newConversationId) {
              setActiveAgent('emailManager');
              setOpenFolders((prev) => ({ ...prev, emailManager: true }));
              setActiveConversation(newConversationId);
              if (setConversationId) setConversationId(newConversationId);
              if (setMessages) setMessages([]);
              navigate(`/chat/email/${newConversationId}`);
            }
          } catch (err) {
            console.error('Failed to auto-create email conversation:', err);
          }
        } else {
          const first = conversations[0];
          try {
            const msgs = await fetchMessages(first.id);
            setActiveAgent('emailManager');
            setOpenFolders((prev) => ({ ...prev, emailManager: true }));
            setActiveConversation(first.id);
            if (setConversationId) setConversationId(first.id);
            if (setMessages) setMessages(msgs);
            navigate(`/chat/email/${first.id}`);
          } catch {
            setActiveAgent('emailManager');
            setOpenFolders((prev) => ({ ...prev, emailManager: true }));
            setActiveConversation(first.id);
            if (setConversationId) setConversationId(first.id);
            navigate(`/chat/email/${first.id}`);
          }
        }
      })();
    }

    hasInitialized.current = true;
  }, [loading, location, isCollapsed, conversations, activeAgent, setConversationId, navigate, setMessages]);

  useEffect(() => {
    const path = location.pathname;
    let conversationId: string | null = null;

    if (path.startsWith('/chat/email')) {
      const match = path.match(/^\/chat\/email\/(\w+)/);
      if (match && match[1]) {
        conversationId = match[1];
      }
    } else if (path.startsWith('/chat/procurement')) {
      const match = path.match(/^\/chat\/procurement\/(\w+)/);
      if (match && match[1]) {
        conversationId = match[1];
      }
    }

    if (conversationId && conversations.some((c) => c.id === conversationId)) {
      setActiveConversation(conversationId);
    }
  }, [location, conversations]);

  const handleConversationClick = (conversation: any) => {
    setActiveConversation(conversation.id);
    if (setMessages) {
      setMessages([]); // Clear messages to avoid showing previous conversation's messages
    }
    if (setConversationId) {
      setConversationId(conversation.id); // This will trigger EmailChat's effect to fetch new messages
    }
    if (activeAgent === 'emailManager') {
      navigate(`/chat/email/${conversation.id}`);
    } else if (activeAgent === 'procurementAgent') {
      navigate(`/chat/procurement/${conversation.id}`);
    }
  };

  const handleNewConversation = async (agentType: string) => {
    try {
      if (agentType === 'emailManager') {
        const response = await createEmailConversation();
        const newConversationId = response.id || response.conversation_id || response.conversationId;
        if (newConversationId) {
          setActiveAgent(agentType);
          handleConversationClick({ id: newConversationId });
          setOpenFolders((prev) => ({
            ...prev,
            [agentType]: true,
          }));
          navigate(`/chat/email/${newConversationId}`);
        } else {
          alert('Failed to get new conversation id');
        }
      } else {
        const newConversation = await createConversation(agentType);
        setActiveAgent(agentType);
        handleConversationClick(newConversation);
        setOpenFolders((prev) => ({
          ...prev,
          [agentType]: true,
        }));
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
      alert('Failed to create new conversation');
    }
  };

  const toggleFolder = (agentKey: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [agentKey]: !prev[agentKey],
    }));
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === sidebarRef.current) {
          const height = entry.contentRect.height;
          const otherElementsHeight = 120; // Approximate height of other elements
          setContainerHeight(Math.max(100, height - otherElementsHeight));
        }
      }
    });

    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'w-80' : isCollapsed ? 'w-16' : 'w-[656px]'}
      `}
    >
      {/* Collapse/expand button */}
      <button
        onClick={safeToggleCollapse}
        className={`
          absolute top-4 right-2 z-50
          bg-white dark:bg-gray-700 p-1 rounded-full shadow-md border border-gray-200 dark:border-gray-600
          text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white
        `}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{ transition: 'right 0.3s' }}
        tabIndex={0}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {isCollapsed ? (
        // Collapsed view – only show agent icons
        <div className="flex flex-col items-center py-4 h-full">
          <div className="mb-6 font-bold text-xl">n</div>
          <div className="flex flex-col items-center space-y-6 flex-1">
            {AGENTS.map((agent) => (
              <button
                key={agent.key}
                onClick={() => {
                  if (isCollapsed) {
                    safeToggleCollapse();
                    if (activeAgent !== agent.key) setActiveAgent(agent.key);
                  } else if (activeAgent !== agent.key) {
                    setActiveAgent(agent.key);
                  }
                }}
                className={`p-2 rounded-md ${
                  activeAgent === agent.key
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={`Switch to ${agent.label}`}
                title={agent.label}
              >
                {agent.icon}
              </button>
            ))}
          </div>

          {setShowHelpCenter && (
            <button
              className="mt-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-md"
              onClick={() => setShowHelpCenter(true)}
              aria-label="Open help center"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          )}
        </div>
      ) : (
        // Expanded view – two fixed‐width columns: Assistants (271px) on left, Tasks (384px) on right
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Assistants/Folders (271px wide) */}
          <div className="flex-none w-[271px] overflow-y-auto px-3">
            {/* "Nexius" header */}
            <div className="pt-4 pb-2 px-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nexius</h2>
            </div>

            {/* Search Bar */}
            <div className="p-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search assistants..."
                  onChange={(e) => updateFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                    text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  aria-label="Search assistants"
                />
              </div>
            </div>

            {/* Assistants label */}
            <div className="px-3 mt-2 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">Assistants</span>
            </div>

            {/* Folders */}
            <div className="mb-4">
              {AGENTS.map((agent) => (
                <div key={agent.key}>
                  <FolderComponent
                    label={agent.label}
                    icon={agent.icon}
                    isOpen={openFolders[agent.key]}
                    onToggle={() => toggleFolder(agent.key)}
                    onNewChat={() => handleNewConversation(agent.key)}
                    isActive={activeAgent === agent.key}
                  />
                  {openFolders[agent.key] && agent.key === activeAgent && (
                    <div className="ml-2">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Loading conversations...
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No conversations yet.
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {conversations.map((conversation) => (
                            <ConversationItem
                              key={conversation.id}
                              conversation={conversation}
                              activeId={activeConversation}
                              onClick={handleConversationClick}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>



          </div>

          {/* Vertical divider (1px) */}
          <div className="w-px bg-gray-200 dark:bg-gray-700" />

          {/* Right Column: Tasks Panel (384px wide) */}
          <div className="flex-none w-96 flex flex-col">
            <div className="pt-4 pb-2 px-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pt-2">
              {tasksLoading ? (
                <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                  Loading tasks...
                </div>
              ) : tasksError ? (
                <div className="px-3 py-2 text-center text-red-500 dark:text-red-400">
                  {tasksError}
                </div>
              ) : tasks.length === 0 ? (
                <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                  No tasks available.
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTask === task.id}
                    onSelect={handleTaskSelect}
                    onMarkDone={handleMarkDone}
                    isMarking={markingDoneId === task.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* (Settings already placed in left column bottom, so nothing more here.) */}
      {/* Sidebar Footer: Settings & Help Center */}
      <div className="sticky bottom-0 left-0 w-full bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-700 z-10 p-3 flex flex-col gap-1">
        <button
          className={`flex items-center w-full gap-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
        {setShowHelpCenter && (
          <button
            className={`flex items-center w-full gap-2 px-3 py-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            onClick={() => setShowHelpCenter(true)}
            aria-label="Help Center"
          >
            <HelpCircle size={18} className="mr-1" />
            {!isCollapsed && <span>Help Center</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;