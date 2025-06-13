import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Wand2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  onEnhancePrompt: () => void;
  isGenerating: boolean;
  isEnhancing: boolean;
  chatStarted: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  onEnhancePrompt,
  isGenerating,
  isEnhancing,
  chatStarted
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '76px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = chatStarted ? 400 : 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input, chatStarted]);

  return (
    <div className="border-t border-gray-200 dark:border-dark-secondary bg-white dark:bg-dark p-4">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="w-full p-3 pr-12 border border-gray-300 dark:border-dark-secondary rounded-lg focus:ring-[#00CABA] focus:border-[#00CABA] dark:bg-dark-secondary dark:text-white"
            rows={1}
            disabled={isGenerating}
          />
          
          {(input.trim() || isGenerating) && (
            <button
              type="submit"
              className="absolute bottom-3 right-3 text-[#00CABA] hover:text-[#008b80]"
              disabled={!input.trim() || isGenerating}
            >
              {isGenerating ? (
                <StopCircle 
                  size={24} 
                  className="text-red-500 hover:text-red-600" 
                  onClick={(e) => {
                    e.preventDefault();
                    onStopGeneration();
                  }} 
                />
              ) : (
                <Send size={20} />
              )}
            </button>
          )}
        </div>
        
        {input.trim() && !isGenerating && (
          <button
            type="button"
            onClick={onEnhancePrompt}
            className={`
              mt-2 self-start flex items-center px-3 py-1 text-sm rounded-md
              ${isEnhancing
                ? 'bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-dark-secondary'
                : 'bg-[#1D2A4D]/10 text-[#1D2A4D] dark:bg-dark-tertiary dark:text-dark-default hover:bg-[#1D2A4D]/20 dark:hover:bg-dark-secondary'
              }
            `}
            disabled={isEnhancing}
          >
            <Wand2 size={16} className="mr-1" />
            {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;