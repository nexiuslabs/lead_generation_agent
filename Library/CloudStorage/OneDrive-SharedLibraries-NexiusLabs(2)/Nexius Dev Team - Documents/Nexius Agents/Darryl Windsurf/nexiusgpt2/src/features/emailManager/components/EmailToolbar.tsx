import React from 'react';
import { FileEdit, Copy, Send, Trash, Star, Reply, Clock } from 'lucide-react';

const EmailToolbar: React.FC = () => {
  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1 bg-gray-50 dark:bg-dark-secondary">
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <FileEdit size={16} className="mr-1" />
        <span>New Draft</span>
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Clock size={16} className="mr-1" />
        <span>Templates</span>
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Reply size={16} className="mr-1" />
        <span>Reply</span>
      </button>
      
      <div className="flex-1"></div>
      
      <button className="p-1.5 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Star size={16} />
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Copy size={16} />
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Send size={16} />
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Trash size={16} />
      </button>
    </div>
  );
};

export default EmailToolbar;