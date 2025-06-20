import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectToast, hideToast } from '../../store/slices/uiSlice';
import { addConversation } from '../../store/slices/conversationsSlice';

const Toast: React.FC = () => {
  const toast = useAppSelector(selectToast);
  const dispatch = useAppDispatch();
  const handleUndo = () => {
    if (toast.undoData) {
      dispatch(addConversation(toast.undoData));
      dispatch(hideToast());
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.isVisible, dispatch]);

  if (!toast.isVisible) return null;

  // Determine toast icon and styles based on type
  let icon;
  let bgColor;
  let textColor;
  
  switch (toast.type) {
    case 'success':
      icon = <CheckCircle size={20} />;
      bgColor = 'bg-green-100 dark:bg-green-800/30';
      textColor = 'text-green-800 dark:text-green-300';
      break;
    case 'error':
      icon = <XCircle size={20} />;
      bgColor = 'bg-red-100 dark:bg-red-800/30';
      textColor = 'text-red-800 dark:text-red-300';
      break;
    case 'warning':
      icon = <AlertCircle size={20} />;
      bgColor = 'bg-yellow-100 dark:bg-yellow-800/30';
      textColor = 'text-yellow-800 dark:text-yellow-300';
      break;
    case 'info':
    default:
      icon = <Info size={20} />;
      bgColor = 'bg-blue-100 dark:bg-blue-800/30';
      textColor = 'text-blue-800 dark:text-blue-300';
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-md animate-fade-in shadow-lg rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className={`${bgColor} ${textColor} flex items-center p-4 rounded-lg`}>
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-1 mr-2">
          {toast.message}
        </div>
        {toast.undoData && (
          <button
            type="button"
            onClick={handleUndo}
            className="ml-2 text-sm font-medium underline hover:text-blue-900 focus:outline-none"
            aria-label="Undo deletion"
          >
            Undo
          </button>
        )}
        <button 
          onClick={() => dispatch(hideToast())}
          className={`${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1`}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;