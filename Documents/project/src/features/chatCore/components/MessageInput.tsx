import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Wand2, PaperclipIcon, Smile, KeyboardIcon, X } from 'lucide-react';
import { useLocalFileUpload } from './useLocalFileUpload';
import { sendMessageWithFiles } from '../api/chatApi';
import { autoReply } from '../../emailManager/api/emailApi';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  onEnhancePrompt?: () => void;
  isGenerating?: boolean;
  isEnhancing?: boolean;
  chatStarted?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  maxLength?: number;
  onTyping?: () => void;
  onAttachmentRequest?: () => void;
}

const MessageInput: React.FC<MessageInputProps & {
  conversationId?: string;
  senderEmail?: string;
  addMessageToPanel?: (msg: any) => void;
}> = ({
  onSendMessage,
  onStopGeneration,
  onEnhancePrompt,
  isGenerating = false,
  isEnhancing = false,
  chatStarted = false,
  placeholder = "Send a message...",
  isDisabled = false,
  maxLength = 4000,
  onTyping,
  onAttachmentRequest,
  conversationId,
  senderEmail,
  addMessageToPanel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedFiles, handleFiles, removeFile, setUploadedFiles } = useLocalFileUpload('/uploads');

  // Remove file using the hook's removeFile for reliability
  const handleRemoveFile = (idx: number) => {
    removeFile(idx);
  };
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  // New state for tracking message sending status
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate input before sending
    if (!input.trim()) {
      setInputError("Message cannot be empty");
      return;
    }
    if (input.length > maxLength) {
      setInputError(`Message is too long (maximum ${maxLength} characters)`);
      return;
    }
    setInputError(null);
    if (isGenerating || isDisabled || isSending) return; // Add isSending check

    // Set sending state to true
    setIsSending(true);

    try {
      // Get conversationId and senderEmail from props/context/localStorage
      const url = new URL(window.location.href);
      const cid = conversationId || url.pathname.split('/').pop() || '';
      const email = senderEmail || localStorage.getItem('email') || '';

      // Optimistically show user message with file previews (with unique id)
      const optimisticMsgId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      // For non-email chat flows (no onSendMessage), add user message optimistically
      if (addMessageToPanel && !onSendMessage) {
        addMessageToPanel({
          id: optimisticMsgId,
          role: 'user',
          content: input,
          datetime: new Date().toISOString(),
          pending: true
        });
        setInput('');
        if (typeof setUploadedFiles === 'function') {
          setUploadedFiles([]);
        }
      }

      // For EmailChat, always call onSendMessage(input) and let parent handle both user and assistant messages
      if (onSendMessage) {
        await onSendMessage(input);
        setInput('');
        if (typeof setUploadedFiles === 'function') setUploadedFiles([]);
        setShowShortcuts(false);
        setShowEmojiPicker(false);
        return;
      }

      if (uploadedFiles.length > 0) {
        // Optimistically show user message with file previews (with unique id)
        const optimisticMsgId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        if (addMessageToPanel) {
          addMessageToPanel({
            id: optimisticMsgId,
            role: 'user',
            content: input,
            metadata: {
              attachments: uploadedFiles.map(f => ({
                name: f.name,
                url: f.previewUrl || f.url, // previewUrl for local preview, url if already uploaded
                size: f.size
              }))
            },
            datetime: new Date().toISOString(),
            pending: true,
          });
        }
        try {
          // Send with files
          const response = await sendMessageWithFiles(cid, email, input, uploadedFiles);
          // Show assistant answer in panel after API call
          if (addMessageToPanel && response?.answer) {
            addMessageToPanel({
              id: `${optimisticMsgId}-assistant`,
              role: 'assistant',
              content: response.answer,            
              metadata: {
              attachments: uploadedFiles.map(f => ({
                  name: f.name,
                  url: f.previewUrl || f.url, // previewUrl for local preview, url if already uploaded
                  size: f.size
                }))
              },
              datetime: new Date().toISOString(),
              pending: false
            });
          }
        } catch (err: any) {
          setInputError(err.message || 'Failed to send message');
        }
      } else {
        // Optimistic UI for plain message
        // (already added above)
        try {
          // Await onSendMessage for assistant reply (must return answer)
          const response = await autoReply(
  conversationId ?? '',
  senderEmail ?? '',
  input,
  []
);
          if (addMessageToPanel && response?.answer) {
            addMessageToPanel({
              id: `${optimisticMsgId}-assistant`,
              role: 'assistant',
              content: response.answer,
              datetime: new Date().toISOString(),
              pending: false
            });
          }
        } catch (err: any) {
          setInputError(err.message || 'Failed to send message');
        }
      }

      setInput('');
      setShowShortcuts(false);
      setShowEmojiPicker(false);
      // Clear uploaded files after sending
      if (uploadedFiles.length > 0 && typeof setUploadedFiles === 'function') {
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setInputError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      // Reset sending state
      setIsSending(false);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Call onTyping callback if provided
    if (onTyping) {
      onTyping();
    }
    
    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    // Clear error on typing
    if (inputError) {
      setInputError(null);
    }
    
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'l': // Ctrl+L to clear input
          e.preventDefault();
          setInput('');
          break;
        case 'k': // Ctrl+K to enhance prompt
          if (onEnhancePrompt && input.trim() && !isGenerating && !isDisabled) {
            e.preventDefault();
            onEnhancePrompt();
          }
          break;
        case 'b': // Ctrl+B to stop generation
          if (isGenerating && onStopGeneration) {
            e.preventDefault();
            onStopGeneration();
          }
          break;
      }
    }
  };

  // Handle focus and blur
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    setShowShortcuts(false);
  };

  // Toggle shortcuts panel
  const toggleShortcuts = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowShortcuts(!showShortcuts);
    setShowEmojiPicker(false); // Close emoji picker if open
  };

  // Handle attachments
  const handleAttachmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
    if (onAttachmentRequest) {
      onAttachmentRequest();
    }
  };

  // Handle emoji picker
  const handleEmojiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Emoji button clicked');
    setShowEmojiPicker(!showEmojiPicker);
    setShowShortcuts(false); // Close shortcuts if open
  };

  // Mock function to add emoji to text
  const addEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = input.substring(0, start) + emoji + input.substring(end);
      setInput(newText);
      
      // Focus back on textarea and set cursor position after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = start + emoji.length;
          textareaRef.current.selectionEnd = start + emoji.length;
        }
      }, 0);
    } else {
      setInput(input + emoji);
    }
  };

  // Handle input change with character counting
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Check if exceeding max length
    if (value.length > maxLength) {
      setInputError(`Message is too long (maximum ${maxLength} characters)`);
    } else if (inputError) {
      setInputError(null);
    }
    
    setInput(value);
    
    // Call onTyping callback if provided
    if (onTyping) {
      onTyping();
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '76px'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = chatStarted ? 400 : 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input, chatStarted]);

  // Focus the input when the component mounts
  useEffect(() => {
    if (textareaRef.current && !isDisabled) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showEmojiPicker && textareaRef.current && !textareaRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="border-t border-gray-200 dark:border-dark-secondary bg-white dark:bg-dark p-4">
      <form onSubmit={handleSubmit} className="flex flex-col relative">
        <div className={`relative ${inputError ? 'mb-1' : ''}`}>
           {/* File previews (thumbnails) */}
           {uploadedFiles.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-2 px-1">
               {uploadedFiles.map((file, idx) => {
                 const isImage = file.type.startsWith('image/');
                 return (
                   <div
                     key={file.name + idx}
                     className="relative flex items-center justify-center w-12 h-12 rounded-md overflow-hidden bg-[#F5F7FA] border border-[#1D2A4D]/10 shadow-sm"
                   >
                     {isImage ? (
                       <img
                         src={URL.createObjectURL(file)}
                         alt={file.name}
                         className="object-cover w-full h-full"
                       />
                     ) : (
                       <div className="flex flex-col items-center justify-center w-full h-full text-[#1D2A4D]">
                         <PaperclipIcon size={22} className="mb-1" />
                         <span className="text-[10px] text-[#3A3A3A] truncate w-10 text-center">{file.name}</span>
                       </div>
                     )}
                     {/* Remove file button (optional for better UX) */}
                     <button
                       type="button"
                       onClick={() => handleRemoveFile(idx)}
                       className="absolute -top-1 -right-1 bg-white rounded-full shadow p-0.5 hover:bg-[#00CABA]"
                       title="Remove file"
                     >
                       <X size={14} />
                     </button>
                   </div>
                 );
               })}
             </div>
           )}
           <textarea
             ref={textareaRef}
             value={input}
             onChange={handleInputChange}
             onKeyDown={handleKeyDown}
             onFocus={handleFocus}
             onBlur={handleBlur}
             placeholder={placeholder}
             className={`w-full p-3 pr-12 pl-12 border ${
               inputError 
                 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                 : isFocused 
                   ? 'border-secondary-500 focus:ring-secondary-500 focus:border-secondary-500' 
                   : 'border-gray-300 dark:border-dark-secondary'
             } rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ease-in-out duration-200 dark:bg-dark-secondary dark:text-white text-sm resize-none`}
             rows={1}
             disabled={isGenerating || isDisabled || isSending}
             aria-label="Message input"
             aria-invalid={inputError ? "true" : "false"}
             aria-describedby={inputError ? "message-input-error" : undefined}
             maxLength={maxLength + 100} // Allow some buffer for validation
           />
          
          {/* Attachment button */}
          <button
            type="button"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleAttachmentClick}
            title="Attach file"
            aria-label="Attach file"
            disabled={isDisabled || isSending}
          >
            <PaperclipIcon size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            tabIndex={-1}
            onChange={e => handleFiles(e.target.files)}
            multiple
          />
          
          {/* Emoji button */}
          <button
            type="button"
            onClick={handleEmojiClick}
            disabled={isDisabled || isGenerating || isSending}
            className={`absolute left-10 bottom-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 ${
              showEmojiPicker ? 'text-secondary-500 dark:text-secondary-400' : ''
            }`}
            aria-label="Add emoji"
          >
            <Smile size={18} />
          </button>
          
          {/* Send/Stop button */}
          {(input.trim() || isGenerating) && (
            <button
              type="submit"
              className={`absolute bottom-3 right-3 ${
                isGenerating 
                  ? 'text-red-500 hover:text-red-600'
                  : isSending
                    ? 'text-gray-400 cursor-wait'
                    : !input.trim() || isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-secondary-500 hover:text-secondary-600'
              } transition-colors duration-200`}
              disabled={(!input.trim() && !isGenerating) || isDisabled || isSending}
              aria-label={isGenerating ? "Stop generation" : isSending ? "Sending..." : "Send message"}
            >
              {isGenerating ? (
                <StopCircle 
                  size={24}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onStopGeneration) onStopGeneration();
                  }} 
                />
              ) : isSending ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send size={20} />
              )}
            </button>
          )}

          {/* Character counter for long messages */}
          {input.length > 0 && (
            <div className={`absolute bottom-2 right-12 text-xs ${
              input.length > maxLength * 0.9 
                ? input.length > maxLength 
                  ? 'text-red-500' 
                  : 'text-yellow-500 dark:text-yellow-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {input.length > maxLength * 0.75 && `${input.length}/${maxLength}`}
            </div>
          )}
          
          {/* Keyboard shortcuts button */}
          <button
            type="button"
            onClick={toggleShortcuts}
            className={`absolute right-12 bottom-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 ${showShortcuts ? 'text-secondary-500 dark:text-secondary-400' : ''}`}
            aria-label="Keyboard shortcuts"
            aria-expanded={showShortcuts}
          >
            <KeyboardIcon size={18} />
          </button>
        </div>
        
        {/* Error message */}
        {inputError && (
          <div id="message-input-error" className="text-red-500 text-xs mb-2 pl-3" role="alert">
            {inputError}
          </div>
        )}
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-tertiary rounded-md shadow-lg p-3 text-sm animate-fade-in z-10">
            <div className="font-medium mb-2 text-gray-700 dark:text-gray-300">Emojis</div>
            <div className="grid grid-cols-8 gap-2">
              {["😀", "😂", "🙂", "😊", "😍", "🤔", "👍", "👏", 
                "🎉", "🔥", "⭐", "💯", "🙏", "💪", "🚀", "💡",
                "❤️", "👌", "👋", "🙌", "🤝", "🧠", "💻", "📈"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Enhance prompt button */}
        {input.trim() && !isGenerating && !isSending && onEnhancePrompt && (
          <button
            type="button"
            onClick={onEnhancePrompt}
            className={`
              mt-2 self-start flex items-center px-3 py-1.5 text-sm rounded-md transition-colors duration-200
              ${isEnhancing
                ? 'bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-dark-secondary cursor-not-allowed'
                : 'bg-primary-100 text-primary-600 dark:bg-dark-tertiary dark:text-dark-default hover:bg-primary-200 dark:hover:bg-dark-secondary'
              }
            `}
            disabled={isEnhancing || isDisabled || isSending}
            aria-label="Enhance prompt"
          >
            <Wand2 size={16} className="mr-2" />
            {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
            <span className="ml-2 shortcut">Ctrl+K</span>
          </button>
        )}
        
        {/* Keyboard shortcuts panel */}
        {showShortcuts && (
          <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-tertiary rounded-md shadow-lg p-3 text-sm animate-fade-in z-10">
            <div className="font-medium mb-2 text-gray-700 dark:text-gray-300">Keyboard Shortcuts</div>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
              <li className="flex justify-between">
                <span>Send message</span>
                <span className="shortcut">Enter</span>
              </li>
              <li className="flex justify-between">
                <span>New line</span>
                <span className="shortcut">Shift+Enter</span>
              </li>
              <li className="flex justify-between">
                <span>Clear input</span>
                <span className="shortcut">Ctrl+L</span>
              </li>
              <li className="flex justify-between">
                <span>Enhance prompt</span>
                <span className="shortcut">Ctrl+K</span>
              </li>
              {isGenerating && (
                <li className="flex justify-between">
                  <span>Stop generation</span>
                  <span className="shortcut">Ctrl+B</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;