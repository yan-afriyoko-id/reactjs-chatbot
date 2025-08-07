class AuthService {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api';
  }

  // Login with API only
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        return {
          success: true,
          user: {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            roles: data.data.roles,
            permissions: data.data.permissions,
            tenant: data.data.tenant
          },
          token: data.data.token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  // Logout
  async logout(token) {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      return null;
    }
  }

  // Save authentication data
  saveAuth(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }
}

const authService = new AuthService();
export default authService; 