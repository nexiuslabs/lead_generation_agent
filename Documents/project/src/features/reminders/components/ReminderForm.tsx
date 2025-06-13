import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Save } from 'lucide-react';
import { useAppDispatch } from '../../../store';
import { createReminder } from '../../../store/slices/remindersSlice';
import { showToast } from '../../../store/slices/uiSlice';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    title?: string;
    description?: string;
    dateTime?: string;
    type?: 'task' | 'event';
  };
  mode?: 'create' | 'edit';
  reminderId?: string;
}

// Simple parser for extracting reminder info from chat messages
const parseReminderFromMessage = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  // Extract title by removing reminder triggers and time references
  let title = message
    .replace(/remind me to|reminder to|remind me|set reminder|schedule|add reminder/gi, '')
    .replace(/today|tomorrow|tonight|this afternoon|this evening/gi, '')
    .replace(/at \d{1,2}:?\d{0,2}\s*(am|pm)?/gi, '')
    .replace(/on \w+/gi, '')
    .trim();
  
  // Clean up the title
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Simple time extraction
  let dateTime = '';
  const now = new Date();
  
  // Check for "today", "tomorrow", etc.
  if (lowerMessage.includes('today')) {
    dateTime = now.toISOString().split('T')[0];
  } else if (lowerMessage.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateTime = tomorrow.toISOString().split('T')[0];
  }
  
  // Check for time patterns like "at 3pm", "at 15:30"
  const timeMatch = message.match(/at (\d{1,2}):?(\d{0,2})\s*(am|pm)?/i);
  if (timeMatch && dateTime) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hour !== 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    
    dateTime += `T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } else if (dateTime) {
    // Default to current time if no specific time mentioned
    dateTime += `T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Determine type based on keywords
  const type = lowerMessage.includes('meeting') || lowerMessage.includes('appointment') || 
               lowerMessage.includes('call') || lowerMessage.includes('schedule') ? 'event' : 'task';
  
  return { title, dateTime, type };
};

const ReminderForm: React.FC<ReminderFormProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create',
  reminderId
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    dateTime: '',
    type: 'task' as 'task' | 'event',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when component opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Parse initial data if it looks like a chat message
        if (initialData.description && !initialData.title) {
          const parsed = parseReminderFromMessage(initialData.description);
          setFormData({
            title: parsed.title || initialData.description,
            dateTime: parsed.dateTime || '',
            type: (parsed.type as 'task' | 'event') || 'task',
            priority: 'medium'
          });
        } else {
          setFormData({
            title: initialData.title || '',
            dateTime: initialData.dateTime || '',
            type: initialData.type || 'task',
            priority: 'medium'
          });
        }
      } else {
        // Reset form for new reminder
        const now = new Date();
        const defaultDateTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        setFormData({
          title: '',
          dateTime: defaultDateTime.toISOString().slice(0, 16), // Format for datetime-local
          type: 'task',
          priority: 'medium'
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time are required';
    } else {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.dateTime = 'Date and time must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reminderData = {
        id: reminderId || `reminder-${Date.now()}`,
        title: formData.title.trim(),
        dateTime: formData.dateTime,
        type: formData.type,
        priority: formData.priority,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      await dispatch(createReminder(reminderData)).unwrap();
      
      dispatch(showToast({
        message: `Reminder ${mode === 'create' ? 'created' : 'updated'} successfully`,
        type: 'success'
      }));
      
      onClose();
    } catch (error) {
      dispatch(showToast({
        message: `Failed to ${mode} reminder. Please try again.`,
        type: 'error'
      }));
      console.error('Error saving reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Add Reminder' : 'Edit Reminder'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title/Description Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description/Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What do you need to be reminded about?"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Date/Time Field */}
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              value={formData.dateTime}
              onChange={(e) => handleInputChange('dateTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.dateTime ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.dateTime && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateTime}</p>
            )}
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="task"
                  checked={formData.type === 'task'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Task</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="event"
                  checked={formData.type === 'event'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Calendar Event</span>
              </label>
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {mode === 'create' ? 'Add Reminder' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;</parameter>