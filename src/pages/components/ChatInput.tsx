import React, { useState } from 'react';

const ChatInput: React.FC<{ onSend: (message: string) => void }> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSend(message);
        setMessage('');
      }
    }
  };

  return (
    <input
      type="text"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type a message"
      className="w-full border p-2 rounded"
    />
  );
};

export default ChatInput;
