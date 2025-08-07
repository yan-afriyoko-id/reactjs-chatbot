import API_CONFIG from '../config/api';

class ChatService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS;
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Get chat history from localStorage
  getChatHistory() {
    try {
      const history = localStorage.getItem('chatHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Save chat history to localStorage
  saveChatHistory(history) {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Add message to chat history
  addMessage(message) {
    const history = this.getChatHistory();
    history.push(message);
    this.saveChatHistory(history);
  }

  // Clear chat history
  clearChatHistory() {
    try {
      localStorage.removeItem('chatHistory');
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  // Send message to API
  async sendMessage(message) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get chat history from API
  async getChatHistoryFromAPI() {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.CHAT_HISTORY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting chat history from API:', error);
      throw error;
    }
  }

  // Clear chat from API
  async clearChat() {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.CLEAR_CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing chat:', error);
      throw error;
    }
  }
}

const chatService = new ChatService();
export default chatService; 