import React from 'react';

interface UserMessageProps {
  message: string;
  datetime: string;
}

import MessageMeta from './MessageMeta';

const UserMessage: React.FC<UserMessageProps> = ({ message, datetime }) => {
  return (
    <div className="flex flex-col items-end mb-4">
      <div className="bg-[#1D2A4D] text-white p-3 rounded-l-lg rounded-br-lg max-w-[80%]">
        <p className="text-sm">{message}</p>
      </div>
      <MessageMeta datetime={datetime} message={message} />
    </div>
  );
};

export default UserMessage;