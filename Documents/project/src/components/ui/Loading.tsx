import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = ''
}) => {
  // Determine spinner size
  let spinnerSize;
  switch (size) {
    case 'sm':
      spinnerSize = 'h-5 w-5 border-2';
      break;
    case 'lg':
      spinnerSize = 'h-12 w-12 border-4';
      break;
    case 'md':
    default:
      spinnerSize = 'h-8 w-8 border-3';
  }

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerSize} border-t-secondary-500 border-secondary-200 dark:border-dark-tertiary`}></div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/75 dark:bg-dark/75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;