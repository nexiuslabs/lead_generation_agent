import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchTasks,
  selectAllTasks,
  selectTasksLoading,
  selectTasksError,
} from '../../store/slices/tasksSlice';



const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const loading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);
  const { taskId } = useParams<{ taskId?: string }>();
  const navigate = useNavigate();
  

  

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const selectedTask = taskId ? tasks.find(t => t.id === taskId) : null;

  const renderList = () => (
    <div className="flex-1 overflow-y-auto p-4">
      {loading ? (
        <p className="text-center">Loading tasks...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-600">No tasks available.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id}>
              <button
                className="w-full text-left p-3 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.snippet || ''}</p>
                <p className="text-xs text-gray-500">Due: {new Date(task.due).toLocaleString()}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedTask) return <p className="p-4">Task not found.</p>;
    return (
      <div className="flex flex-col h-full">
        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-gray-200 dark:border-gray-700 z-30 flex items-center">
          <button
            aria-label="Back to task list"
            className="text-sm text-blue-600 hover:underline mr-4"
            onClick={() => navigate('/tasks')}
          >
            &larr; Back
          </button>
          <h2 className="text-xl font-bold">{selectedTask.title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">{selectedTask.snippet}</p>
          <p className="mb-2"><span className="font-semibold">Due:</span> {new Date(selectedTask.due).toLocaleString()}</p>
          {/* Additional details here */}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with switch */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks & Details</h1>
        
      </div>
      <div className="relative flex-1">
        {renderList()}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity ${
            selectedTask ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => navigate('/tasks')}
        />
        <div
          className={`fixed inset-y-0 right-0 z-20 bg-white dark:bg-dark shadow-lg transform transition-transform ${
            selectedTask ? 'translate-x-0' : 'translate-x-full'
          } w-full md:w-3/5`}
        >
          {renderDetail()}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
