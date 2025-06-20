import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Sparkles } from 'lucide-react';
import ReminderForm from '../../features/reminders/components/ReminderForm';
import { isReminderMessage, parseReminderFromMessage, getConfidenceColor } from '../../features/reminders/utils/reminderParser';

interface ReminderButtonProps {
  currentMessage: string;
  onReminderCreated?: () => void;
}

const ReminderButton: React.FC<ReminderButtonProps> = ({ 
  currentMessage, 
  onReminderCreated 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDetection, setShowDetection] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // Check if current message looks like a reminder and parse it
  useEffect(() => {
    if (currentMessage.trim().length > 0) {
      const isReminder = isReminderMessage(currentMessage);
      
      if (isReminder) {
        const parsed = parseReminderFromMessage(currentMessage);
        setParsedData(parsed);
        setShowDetection(parsed.confidence > 0.5);
      } else {
        setShowDetection(false);
        setParsedData(null);
      }
    } else {
      setShowDetection(false);
      setParsedData(null);
    }
  }, [currentMessage]);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setShowDetection(false);
  };

  const handleReminderCreated = () => {
    if (onReminderCreated) {
      onReminderCreated();
    }
    setIsFormOpen(false);
    setShowDetection(false);
  };

  // Get initial data for the form
  const getInitialData = () => {
    if (parsedData) {
      return {
        title: parsedData.title,
        dateTime: parsedData.dateTime,
        type: parsedData.type,
        description: currentMessage
      };
    }
    
    if (currentMessage.trim()) {
      return {
        description: currentMessage
      };
    }
    
    return undefined;
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenForm}
        className={`p-2 rounded-md transition-all duration-200 ${
          showDetection
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 animate-pulse'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={showDetection ? 'Reminder detected - click to create' : 'Add reminder'}
        aria-label={showDetection ? 'Reminder detected - click to create' : 'Add reminder'}
      >
        <div className="relative">
          {showDetection ? (
            <BellRing size={18} />
          ) : (
            <Bell size={18} />
          )}
          
          {/* Detection indicator */}
          {showDetection && (
            <div className="absolute -top-1 -right-1">
              <Sparkles size={10} className="text-blue-500 animate-bounce" />
            </div>
          )}
        </div>
      </button>

      {/* Confidence indicator tooltip */}
      {showDetection && parsedData && (
        <div className="absolute bottom-full mb-2 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-75">
          <div className="flex items-center gap-1">
            <span className={getConfidenceColor(parsedData.confidence)}>●</span>
            <span>
              {parsedData.confidence > 0.8 ? 'High' : 
               parsedData.confidence > 0.6 ? 'Medium' : 'Low'} confidence
            </span>
          </div>
          <div className="text-xs opacity-75">
            {parsedData.type} • {parsedData.title}
          </div>
        </div>
      )}

      {/* Reminder Form Modal */}
      <ReminderForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialData={getInitialData()}
        mode="create"
      />
    </>
  );
};

export default ReminderButton;
</parameter>