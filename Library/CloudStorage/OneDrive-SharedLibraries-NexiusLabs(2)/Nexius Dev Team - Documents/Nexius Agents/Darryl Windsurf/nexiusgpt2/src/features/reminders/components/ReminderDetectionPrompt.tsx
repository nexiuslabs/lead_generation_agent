import React, { useState } from 'react';
import { CheckCircle, X, Edit3, Calendar, CheckSquare } from 'lucide-react';
import { ReminderIntent, generateReminderConfirmation } from '../utils/reminderDetection';

interface ReminderDetectionPromptProps {
  intent: ReminderIntent;
  onConfirm: (confirmed: boolean) => void;
  onEdit: () => void;
  onDismiss: () => void;
}

const ReminderDetectionPrompt: React.FC<ReminderDetectionPromptProps> = ({
  intent,
  onConfirm,
  onEdit,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !intent.isReminder) {
    return null;
  }

  const handleConfirm = (confirmed: boolean) => {
    setIsVisible(false);
    onConfirm(confirmed);
  };

  const handleEdit = () => {
    setIsVisible(false);
    onEdit();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const confirmationMessage = generateReminderConfirmation(intent);
  const { title, dateTime, type, importance } = intent.extractedData;

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
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

  return (
    <div className="bg-gradient-to-r from-[#00CABA]/10 to-[#1D2A4D]/10 border border-[#00CABA]/20 rounded-lg p-4 mb-4 animate-fade-in" aria-live="polite" aria-atomic="true" role="status">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 bg-[#00CABA]/20 rounded-full flex items-center justify-center mt-0.5">
          {type === 'calendar' ? (
            <Calendar size={16} className="text-[#00CABA]" />
          ) : (
            <CheckSquare size={16} className="text-[#00CABA]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-[#1D2A4D] dark:text-white">
              {confirmationMessage}
            </h4>
            <button
              onClick={handleDismiss} aria-label="Dismiss reminder suggestion"
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Extracted Details */}
          <div className="space-y-2 mb-4">
            {title && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-0 flex-shrink-0">
                  Title:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {title}
                </span>
              </div>
            )}
            
            {dateTime && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-0 flex-shrink-0">
                  When:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(dateTime)}
                </span>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-0 flex-shrink-0">
                Type:
              </span>
              <span className="text-sm text-gray-900 dark:text-white capitalize">
                {type === 'calendar' ? 'Calendar Event' : 'Task'}
              </span>
            </div>
            
            {importance && importance !== 'normal' && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-0 flex-shrink-0">
                  Priority:
                </span>
                <span className={`text-sm capitalize ${
                  importance === 'high' 
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {importance}
                </span>
              </div>
            )}
          </div>

          {/* Confidence indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Detection confidence</span>
              <span>{Math.round(intent.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  intent.confidence >= 0.8 
                    ? 'bg-green-500' 
                    : intent.confidence >= 0.6 
                      ? 'bg-yellow-500' 
                      : 'bg-orange-500'
                }`}
                style={{ width: `${intent.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleConfirm(true)}
              className="bg-[#00CABA] text-white px-4 py-2 rounded-lg hover:bg-[#008B7A] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle size={16} />
              Create Reminder
            </button>
            
            <button
              onClick={handleEdit}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Edit3 size={16} />
              Edit Details
            </button>
            
            <button
              onClick={() => handleConfirm(false)}
              className="text-gray-500 dark:text-gray-400 px-2 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
            >
              Not a reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderDetectionPrompt;