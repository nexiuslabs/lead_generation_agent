import React, { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [text, setText] = useState('');

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        className="flex-1 border border-gray-300 rounded p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={send}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
