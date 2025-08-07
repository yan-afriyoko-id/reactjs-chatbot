import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import chatService from '../services/chatService';

const ChatContainer = ({ conversation, onUpdateConversation, onCreateNewConversation, user, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // If no conversation exists, create one
    let currentConv = conversation;
    if (!currentConv) {
      currentConv = onCreateNewConversation();
      if (!currentConv) return;
    }

    const userMessage = {
      id: Date.now().toString(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately to show it first
    const updatedMessages = [...currentConv.messages, userMessage];
    onUpdateConversation(currentConv.id, updatedMessages);

    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(messageText);
      
      if (response.success) {
        const aiMessage = {
          id: response.data.message_id || (Date.now() + 1).toString(),
          message: response.data.response,
          isUser: false,
          timestamp: response.data.timestamp || new Date().toISOString(),
        };

        // Add AI message after user message
        const finalMessages = [...updatedMessages, aiMessage];
        onUpdateConversation(currentConv.id, finalMessages);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.message === 'Authentication required' || error.message === 'Authentication failed') {
        setError('Session expired. Please login again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          onLogout();
        }, 2000);
      } else {
        setError('Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
      }
      
      // Remove user message if API call failed
      const filteredMessages = updatedMessages.filter(msg => msg.id !== userMessage.id);
      onUpdateConversation(currentConv.id, filteredMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!conversation) return;
    
    try {
      // Clear from API
      await chatService.clearChat();
    } catch (error) {
      console.error('Error clearing chat from API:', error);
      
      if (error.message === 'Authentication required' || error.message === 'Authentication failed') {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          onLogout();
        }, 2000);
        return;
      }
    }

    // Clear current conversation messages
    onUpdateConversation(conversation.id, []);
    setError(null);
  };

  if (!conversation) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Ask me anything about your project or get help with technical questions.
            </p>
          </div>
        </div>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          onCreateNewConversation={onCreateNewConversation}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <ChatHeader 
        conversation={conversation}
        onClearChat={handleClearChat}
        messageCount={conversation.messages.length}
        user={user}
        onLogout={onLogout}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {conversation.messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Ask me anything about your project or get help with technical questions.
            </p>
          </div>
        )}

        {conversation.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.message}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 text-white rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">AI sedang mengetik...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        onCreateNewConversation={onCreateNewConversation}
      />
    </div>
  );
};

export default ChatContainer; 