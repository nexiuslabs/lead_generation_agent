import React, { useState } from 'react';
import { Copy, Clock } from 'lucide-react';

interface MessageMetaProps {
  datetime: string;
  message: string;
}

const MessageMeta: React.FC<MessageMetaProps> = ({ datetime, message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500 select-none">
      <Clock size={14} className="mr-1" />
      <span>{datetime}</span>
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-dark-tertiary focus:outline-none"
        onClick={handleCopy}
        aria-label="Copy message"
      >
        <Copy size={14} />
        <span>{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
};

export default MessageMeta;
