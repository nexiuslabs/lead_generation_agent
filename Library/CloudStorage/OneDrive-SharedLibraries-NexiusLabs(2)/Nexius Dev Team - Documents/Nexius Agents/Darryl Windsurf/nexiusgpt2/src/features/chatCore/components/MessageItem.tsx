import React, { useState, useRef } from 'react';
import { Copy, Check, FileText, Image, FileArchive, Film, Music, Paperclip, Download } from 'lucide-react';
import { ChatMessage } from '../types';

// Extend ChatMessage to allow isFirstMessage for EmailChat UI
interface EmailChatMessage extends ChatMessage {
  isFirstMessage?: boolean;
  file_urls?: string | null; // Added to support file_urls from API
}

interface MessageItemProps {
  message: EmailChatMessage;
  isStreaming?: boolean;
  onReply?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onRetry?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  onRetry,
  onReply: _onReply,
  onFeedback: _onFeedback,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [copied, setCopied] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);


  // Format message timestamp (full date and time)
  const formattedDateTime = message.timestamp
    ? new Date(message.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Helper to determine if this is the first message in the thread (for EmailChat)
  // This prop is not passed yet, but will be handled in EmailChat context if needed.
  // For now, assume first message if message.id ends with '-user' and index === 0 (to be improved if needed)
  // For generic use, let parent pass an isFirstMessage prop if required.
  // We'll add this prop for EmailChat usage.


  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    copyButtonRef.current?.focus();
    setTimeout(() => setCopied(false), 2000);
  };


  // Check if content is a summary or scheduled message
  const isSummaryOrScheduled = 
    message.content.startsWith('Summary:') || 
    message.content.startsWith('Scheduled');

  // Different styling based on message type
  let containerClasses = '';
  let messageClasses = '';
  let bgColor = '';
  let hoverBgColor = '';

  if (isUser) {
    containerClasses = 'w-full flex';
    bgColor = 'bg-primary-500';
    hoverBgColor = 'hover:bg-primary-600';
    messageClasses = `${bgColor} ${hoverBgColor} text-white p-3 rounded-l-xl rounded-br-xl max-w-[65%] ml-auto self-end shadow-sm hover:shadow-md transition-shadow duration-200`;
  } else if (isSystem) {
    containerClasses = 'w-full flex justify-center';
    bgColor = 'bg-gray-200 dark:bg-dark-tertiary';
    hoverBgColor = 'hover:bg-gray-300 dark:hover:bg-gray-700';
    messageClasses = `${bgColor} ${hoverBgColor} text-white p-2 rounded-md text-sm max-w-[80%] italic`;
  } else {
    // Assistant reply message bubble: always white background
    containerClasses = 'w-full flex';
    bgColor = 'bg-gray-200 dark:bg-dark-tertiary';
    hoverBgColor = 'hover:bg-gray-100 dark:hover:bg-gray-700';
    messageClasses = `${bgColor} ${hoverBgColor} p-3 rounded-r-xl text-white rounded-bl-xl max-w-[65%] mr-auto self-start shadow-sm hover:shadow-md transition-shadow duration-200 bot-message`;
  }

  // Determine if there are any attachments (metadata.attachments or file_urls)
  const hasAttachments = (message.metadata && message.metadata.attachments && message.metadata.attachments.length > 0)
    || (Array.isArray(message.file_urls) && message.file_urls.length > 0)
    || (typeof message.file_urls === 'string' && message.file_urls.trim() !== '');

  return (
    <div className={`${containerClasses} isolate transition-all duration-500 ${isNew ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}`}>
      {/* Conversation started datetime above first message */}
      {message.isFirstMessage && (
        <div className="w-full flex justify-center pb-2">
          <span className="inline-block px-4 py-1 rounded-full bg-[#F5F7FA] text-[#1D2A4D] text-[11px] font-semibold shadow-sm tracking-wide border border-[#E5EAF2] uppercase\" style={{ letterSpacing: '0.04em' }}>
            {formattedDateTime}
          </span>
        </div>
      )}
      <div className={messageClasses + " relative"}>
        {/* Message content (smaller font, more compact) */}
        <div className={`text-[14px] leading-snug ${isUser ? 'text-white' : 'text-[#3A3A3A] dark:text-white'} ${!isUser && isSummaryOrScheduled ? 'metadata-summary' : ''}`}
             style={{ wordBreak: 'break-word', fontFamily: 'Roboto, Open Sans, Lato, sans-serif' }}>
          <span className="sr-only">{isUser ? 'User: ' : isSystem ? 'System: ' : 'Assistant: '}</span>{message.content}
          {isStreaming && <span className="typing-animation">...</span>}
        </div>
        {/* Attachments from message.metadata.attachments or message.file_urls */}
        {/* Attachments from message.metadata.attachments or message.file_urls */}
        {hasAttachments && (
          <div className={
            `mt-3 pt-3 rounded-b-lg mb-4`
          }>
            <div className="flex flex-col gap-2">
              {/* Existing attachments rendering */}
              {message.metadata && message.metadata.attachments && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {message.metadata.attachments.map((attachment: any, idx: number) => {
                // Helper to get file extension and icon
                const getFileIcon = (filename: string) => {
                  const ext = filename.split('.').pop()?.toLowerCase();
                  switch (ext) {
                    case 'pdf': return <FileText className="text-[#1D2A4D]\" size={18} />;
                    case 'jpg': case 'jpeg': case 'png': case 'gif': return <Image className="text-[#00CABA]" size={18} />;
                    case 'doc': case 'docx': return <FileText className="text-[#1D2A4D]" size={18} />;
                    case 'xls': case 'xlsx': return <FileText className="text-[#00CABA]" size={18} />;
                    case 'ppt': case 'pptx': return <FileText className="text-[#00CABA]" size={18} />;
                    case 'zip': case 'rar': return <FileArchive className="text-[#1D2A4D]" size={18} />;
                    case 'mp4': case 'mov': case 'avi': return <Film className="text-[#00CABA]" size={18} />;
                    case 'mp3': case 'wav': return <Music className="text-[#1D2A4D]" size={18} />;
                    case 'csv': return <FileText className="text-[#00CABA]" size={18} />;
                    default: return <Paperclip className="text-[#00CABA]" size={18} />;
                  }
                };
                // Format file size (if available)
                const formatSize = (size: number | undefined) => {
                  if (!size) return '';
                  if (size < 1024) return `${size} B`;
                  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
                  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
                };
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2 dark:text-white bg-white dark:bg-dark-tertiary rounded shadow-sm border border-gray-100 dark:border-dark-secondary hover:shadow-md transition group"
                    tabIndex={0}
                    aria-label={`Attachment: ${attachment.name}`}
                  >
                    <span className="flex-shrink-0">{getFileIcon(attachment.name)}</span>
                    <div className="flex flex-col flex-grow min-w-0">
                      <span className="font-semibold text-[14px] text-[#1D2A4D] dark:text-white truncate" title={attachment.name}>{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-[12px] text-[#3A3A3A] dark:text-white opacity-70">{formatSize(attachment.size)}</span>
                      )}
                    </div>
                    {attachment.url && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[12px] font-medium bg-[#00CABA] text-white hover:bg-[#1D2A4D] transition"
                        download={attachment.name}
                        aria-label={`Download ${attachment.name}`}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </div>
                );
              })}
              </div>
              )}
              {/* Render file_urls as downloadable links, support both array and string for backward compatibility */}
              {(Array.isArray(message.file_urls) && message.file_urls.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {message.file_urls.map((url: string, idx: number) => {
                    const fileName = url.split('/').pop() || `file-${idx+1}`;
                    const ext = fileName.split('.').pop()?.toLowerCase();
                    let icon = <Paperclip className="text-[#00CABA]\" size={18} />;
                    switch (ext) {
                      case 'pdf': icon = <FileText className="text-[#1D2A4D]" size={18} />; break;
                      case 'jpg': case 'jpeg': case 'png': case 'gif': icon = <Image className="text-[#00CABA]" size={18} />; break;
                      case 'doc': case 'docx': icon = <FileText className="text-[#1D2A4D]" size={18} />; break;
                      case 'xls': case 'xlsx': icon = <FileText className="text-[#00CABA]" size={18} />; break;
                      case 'ppt': case 'pptx': icon = <FileText className="text-[#00CABA]" size={18} />; break;
                      case 'zip': case 'rar': icon = <FileArchive className="text-[#1D2A4D]" size={18} />; break;
                      case 'mp4': case 'mov': case 'avi': icon = <Film className="text-[#00CABA]" size={18} />; break;
                      case 'mp3': case 'wav': icon = <Music className="text-[#1D2A4D]" size={18} />; break;
                      case 'csv': icon = <FileText className="text-[#00CABA]" size={18} />; break;
                    }
                    return (
                      <div
                        key={`fileurl-${idx}`}
                        className="flex items-center gap-3 px-3 py-2 dark:text-white bg-white dark:bg-dark-tertiary rounded shadow-sm border border-gray-100 dark:border-dark-secondary hover:shadow-md transition group"
                        tabIndex={0}
                        aria-label={`Attachment: ${fileName}`}
                      >
                        <span className="flex-shrink-0">{icon}</span>
                        <div className="flex flex-col flex-grow min-w-0">
                          <span className="font-semibold text-[14px] sm:text-sm text-[#1D2A4D] dark:text-white truncate w-20 sm:w-40" title={fileName}>{fileName}</span>
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[12px] font-medium bg-[#00CABA] text-white hover:bg-[#1D2A4D] transition"
                          download={fileName}
                          aria-label={`Download ${fileName}`}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Fallback for legacy string type */}
              {(typeof message.file_urls === 'string' && message.file_urls.trim() !== '') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {message.file_urls.split(',').map((url: string, idx: number) => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl) return null;
                    const fileName = trimmedUrl.split('/').pop() || `file-${idx+1}`;
                    // Use icon logic from above
                    const ext = fileName.split('.').pop()?.toLowerCase();
                    let icon = <Paperclip className="text-[#00CABA]\" size={18} />;
                    switch (ext) {
                      case 'pdf': icon = <FileText className="text-[#1D2A4D]" size={18} />; break;
                      case 'jpg': case 'jpeg': case 'png': case 'gif': icon = <Image className="text-[#00CABA]" size={18} />; break;
                      case 'doc': case 'docx': icon = <FileText className="text-[#1D2A4D]" size={18} />; break;
                      case 'xls': case 'xlsx': icon = <FileText className="text-[#00CABA]" size={18} />; break;
                      case 'ppt': case 'pptx': icon = <FileText className="text-[#00CABA]" size={18} />; break;
                      case 'zip': case 'rar': icon = <FileArchive className="text-[#1D2A4D]" size={18} />; break;
                      case 'mp4': case 'mov': case 'avi': icon = <Film className="text-[#00CABA]" size={18} />; break;
                      case 'mp3': case 'wav': icon = <Music className="text-[#1D2A4D]" size={18} />; break;
                      case 'csv': icon = <FileText className="text-[#00CABA]" size={18} />; break;
                    }
                    return (
                      <div
                        key={`fileurl-legacy-${idx}`}
                        className="flex items-center gap-3 px-3 py-2 dark:text-white bg-white dark:bg-dark-tertiary rounded shadow-sm border border-gray-100 dark:border-dark-secondary hover:shadow-md transition group"
                        tabIndex={0}
                        aria-label={`Attachment: ${fileName}`}
                      >
                        <span className="flex-shrink-0">{icon}</span>
                        <div className="flex flex-col flex-grow min-w-0">
                          <span className="font-semibold text-[14px] sm:text-sm text-[#1D2A4D] dark:text-white truncate w-20 sm:w-40" title={fileName}>{fileName}</span>
                        </div>
                        <a
                          href={trimmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[12px] font-medium bg-[#00CABA] text-white hover:bg-[#1D2A4D] transition"
                          download={fileName}
                          aria-label={`Download ${fileName}`}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Copy and datetime row, compact and clean */}
        {message.status === 'failed' && onRetry && (
          <div className="mt-1 text-right">
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="text-red-500 hover:underline text-xs"
              aria-label="Retry sending message"
            >
              Retry
            </button>
          </div>
        )}
        <div className="mt-2 hidden sm:flex flex-row items-center gap-4 text-[12px] text-[#3A3A3A] dark:text-gray-400 font-normal">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : 'Copy message text'} ref={copyButtonRef}
            className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded transition-colors duration-150 focus:outline-none ${copied ? 'bg-[#00CABA] text-white' : 'hover:bg-[#F5F7FA] text-[#3A3A3A] hover:text-[#00CABA]'}`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span className="ml-1" aria-hidden>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {copied && (
            <div role="status" aria-live="polite" className="sr-only">
              Copied to clipboard.
            </div>
          )}
          <div className="flex items-center gap-1 text-[#A0A4AB]" style={{ fontSize: '12px', fontWeight: 400 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="#A0A4AB" strokeWidth="1.5"/><path d="M12 20v-1m0-14V4m7.071 7.071-1.414-1.414M5.343 5.343 6.757 6.757M20 12h-1M4 12H3m15.071 4.929-1.414-1.414M5.343 18.657l1.414-1.414" stroke="#A0A4AB" strokeWidth="1.5"/></svg>
            {formattedDateTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;