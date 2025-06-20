import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings as SettingsIcon, HelpCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  selectAllTasks,
  selectTasksLoading,
  selectTasksError,
  selectMarkingDoneId,
  fetchTasks,
  markTaskDone
} from '../store/slices/tasksSlice';

interface Task {
  id: string;
  title: string;
  snippet?: string;
  due: string;
  isDone: boolean;
}

interface SidebarTaskPreviewProps {
  setPreviewTaskTitle: (title: string) => void;
  setPreviewTaskId: (id: string) => void;
  setPreviewEmailLoading?: (loading: boolean) => void;
}

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setShowSettings: (visible: boolean) => void;
  setShowHelpCenter: (visible: boolean) => void;
  onTaskSelect?: () => void;
}

const TaskCard: React.FC<{
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onMarkDone: (id: string) => void;
  isMarking?: boolean;
}> = ({ task, isSelected, onSelect, onMarkDone, isMarking }) => (
  <div
    onClick={onSelect}
    className={`flex items-start justify-between w-full p-2 rounded-md cursor-pointer ${
      isSelected ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    <div>
      <div className="font-medium">{task.title}</div>
      {task.snippet && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {task.snippet}
        </div>
      )}
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!task.isDone && !isMarking) onMarkDone(task.id);
      }}
      className="ml-2 p-1 rounded-full transition-colors"
      title={task.isDone ? 'Already done' : isMarking ? 'Marking...' : 'Mark done'}
      disabled={task.isDone || isMarking}
    >
      {isMarking ? (
        <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
      ) : (
        <SettingsIcon size={20} />
      )}
    </button>
  </div>
);

const Sidebar: React.FC<SidebarProps & SidebarTaskPreviewProps> = ({
  isMobile,
  isOpen,
  isCollapsed,
  toggleCollapse,
  setShowSettings,
  setShowHelpCenter,
  onTaskSelect,
  setPreviewTaskTitle,
  setPreviewTaskId,
  setPreviewEmailLoading
}) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const tasksLoading = useAppSelector(selectTasksLoading);
  const tasksError = useAppSelector(selectTasksError);
  const markingDoneId = useAppSelector(selectMarkingDoneId);
  
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleSelect = (task: Task) => {
    setSelected(task.id);
    setPreviewTaskTitle(task.title);
    setPreviewTaskId(task.id);
    setPreviewEmailLoading?.(true);
    onTaskSelect?.();
  };

  const handleDone = (id: string) => {
    dispatch(markTaskDone(id));
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40 flex flex-col transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isMobile ? 'w-full' : isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Tasks</h2>
          <button
            onClick={() => toggleCollapse()}
            className="p-1"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-2 space-y-2">
            {tasksLoading ? (
              <div className="text-center py-4 text-gray-500">Loading tasks...</div>
            ) : tasksError ? (
              <div className="text-center py-4 text-red-500">{tasksError}</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No tasks available.
              </div>
            ) : (
              tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  isSelected={selected === t.id}
                  onSelect={() => handleSelect(t)}
                  onMarkDone={handleDone}
                  isMarking={markingDoneId === t.id}
                />
              ))
            )}
          </div>
        )}
      </div>
      <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          className="flex items-center mb-2 space-x-2"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>
        <button
          className="flex items-center space-x-2"
          onClick={() => setShowHelpCenter(true)}
        >
          <HelpCircle />
          <span>Help Center</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
