import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { 
  fetchReminders, 
  createReminder, 
  deleteReminder,
  selectAllReminders,
  selectRemindersLoading,
  selectRemindersError
} from '../../../store/slices/remindersSlice';
import { showToast } from '../../../store/slices/uiSlice';
import ReminderForm from './ReminderForm';
import { Reminder, reminderService } from '../api/microsoftGraphApi';

interface RemindersViewProps {
  onClose?: () => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector(selectAllReminders);
  const loading = useAppSelector(selectRemindersLoading);
  const error = useAppSelector(selectRemindersError);
  
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    permissions: { calendar: boolean; tasks: boolean };
  } | null>(null);

  // Check Microsoft 365 connection on mount
  useEffect(() => {
    checkConnection();
    dispatch(fetchReminders());
  }, [dispatch]);

  const checkConnection = async () => {
    try {
      const status = await reminderService.checkConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        permissions: { calendar: false, tasks: false }
      });
    }
  };

  const handleCreateReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'status' | 'microsoftId'>) => {
    setIsCreating(true);
    try {
      await dispatch(createReminder(reminderData)).unwrap();
      dispatch(showToast({
        message: 'Reminder created successfully!',
        type: 'success'
      }));
      setShowForm(false);
    } catch (error) {
      dispatch(showToast({
        message: 'Failed to create reminder. Please try again.',
        type: 'error'
      }));
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReminder = async (reminder: Reminder) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await dispatch(deleteReminder(reminder)).unwrap();
      dispatch(showToast({
        message: 'Reminder deleted successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showToast({
        message: 'Failed to delete reminder. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleRefresh = () => {
    dispatch(fetchReminders());
    checkConnection();
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getTimeUntil = (dateTime: string) => {
    const now = new Date();
    const target = new Date(dateTime);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const upcomingReminders = reminders.filter(r => new Date(r.dateTime) > new Date());
  const pastReminders = reminders.filter(r => new Date(r.dateTime) <= new Date());

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-auto h-full max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00CABA]/10 rounded-full flex items-center justify-center">
            <Bell className="text-[#00CABA]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reminders
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {upcomingReminders.length} upcoming reminders
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#00CABA] text-white px-4 py-2 rounded-lg hover:bg-[#008B7A] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Reminder
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Plus size={18} className="rotate-45 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && !connectionStatus.connected && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Microsoft 365 not connected. Please connect your account in Settings to sync reminders.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && reminders.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00CABA]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to load reminders
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-[#00CABA] text-white px-4 py-2 rounded-lg hover:bg-[#008B7A] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reminders yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first reminder to get started.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#00CABA] text-white px-4 py-2 rounded-lg hover:bg-[#008B7A] transition-colors"
            >
              Create Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Reminders */}
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Upcoming ({upcomingReminders.length})
                </h3>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onDelete={handleDeleteReminder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Reminders */}
            {pastReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Past ({pastReminders.length})
                </h3>
                <div className="space-y-3">
                  {pastReminders.slice(0, 10).map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onDelete={handleDeleteReminder}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reminder Form Modal */}
      <ReminderForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateReminder}
        isSubmitting={isCreating}
      />
    </div>
  );
};

// Individual reminder card component
interface ReminderCardProps {
  reminder: Reminder;
  onDelete: (reminder: Reminder) => void;
  isPast?: boolean;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onDelete, isPast = false }) => {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getTimeUntil = (dateTime: string) => {
    const now = new Date();
    const target = new Date(dateTime);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  return (
    <div className={`p-4 border rounded-lg transition-all hover:shadow-md ${
      isPast 
        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${
            reminder.type === 'calendar' 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-green-100 dark:bg-green-900/30'
          }`}>
            {reminder.type === 'calendar' ? (
              <Calendar size={16} className={reminder.type === 'calendar' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'} />
            ) : (
              <CheckSquare size={16} className="text-green-600 dark:text-green-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {reminder.title}
            </h4>
            {reminder.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {reminder.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatDateTime(reminder.dateTime)}</span>
              </div>
              {!isPast && (
                <span className={`px-2 py-0.5 rounded-full ${
                  getTimeUntil(reminder.dateTime) === 'Overdue'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {getTimeUntil(reminder.dateTime)}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full capitalize ${
                reminder.importance === 'high' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : reminder.importance === 'normal'
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {reminder.importance}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(reminder)}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete reminder"
        >
          <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default RemindersView;