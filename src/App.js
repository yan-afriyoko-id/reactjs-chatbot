import React, { useState, useEffect } from 'react';
import ChatContainer from './components/ChatContainer';
import ChatSidebar from './components/ChatSidebar';
import LoginPage from './components/LoginPage';
import authService from './services/authService';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, []);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConversation(parsed[0]);
      }
    }
  }, []);

  // Save conversations to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Close sidebar on mobile when conversation is selected
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [currentConversation]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setConversations([]);
      setCurrentConversation(null);
      authService.clearAuth();
      localStorage.removeItem('conversations');
    }
  };

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'Conversation',
      date: new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      messages: []
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    return newConversation;
  };

  const deleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(conversations.length > 1 ? conversations[1] : null);
    }
  };

  const renameConversation = (conversationId, newTitle) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title: newTitle }
        : conv
    ));
    
    // Also update currentConversation if it's the same conversation
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => ({
        ...prev,
        title: newTitle
      }));
    }
  };

  const clearAllConversations = () => {
    setConversations([]);
    setCurrentConversation(null);
    localStorage.removeItem('conversations');
    localStorage.removeItem('chatHistory');
  };

  const updateConversation = (conversationId, messages) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, messages: messages }
        : conv
    ));
    
    // Also update currentConversation if it's the same conversation
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => ({
        ...prev,
        messages: messages
      }));
    }
  };

  const handleStartConversation = () => {
    if (!currentConversation) {
      createNewConversation();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App h-screen bg-gray-900">
      <div className="flex h-full relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-80 bg-gray-800 border-r border-gray-700
        `}>
          <ChatSidebar
            conversations={filteredConversations}
            currentConversation={currentConversation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onConversationSelect={setCurrentConversation}
            onCreateNew={createNewConversation}
            onDeleteConversation={deleteConversation}
            onRenameConversation={renameConversation}
            onClearAll={clearAllConversations}
            onCloseSidebar={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-white">AI Chat</h1>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Sign Out"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <ChatContainer
            conversation={currentConversation}
            onUpdateConversation={updateConversation}
            onCreateNewConversation={createNewConversation}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
