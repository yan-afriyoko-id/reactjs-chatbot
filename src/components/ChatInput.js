import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, isLoading = false, onCreateNewConversation }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="1"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
              message.trim() && !isLoading
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="hidden sm:block">
            Press Enter to send. Shift+Enter for new line
          </div>
          <div className="sm:hidden">
            Enter to send
          </div>
          <div>
            {message.length} characters
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput; 