/**
 * 🔐 Google OAuth Authentication Service
 *
 * Handles Google Sign-In via chrome.identity API for the Sales Coach extension.
 * Manages user authentication, profile info, and token storage.
 */

class GoogleAuthService {
  constructor() {
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
  }

  /**
   * Authenticate user with Google OAuth
   * @returns {Promise<Object>} User profile info
   */
  async signIn() {
    try {
      console.log('🔐 Starting Google OAuth sign-in...');

      // Get OAuth token using chrome.identity
      const token = await this.getAuthToken();

      if (!token) {
        throw new Error('Failed to get auth token');
      }

      this.token = token;

      // Fetch user profile info from Google
      const userInfo = await this.fetchUserInfo(token);

      this.user = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        signedInAt: Date.now()
      };

      this.isAuthenticated = true;

      // Save to storage
      await chrome.storage.local.set({
        currentUser: this.user,
        authToken: token,
        isAuthenticated: true
      });

      console.log('✅ Signed in successfully:', this.user.email);

      return this.user;

    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Get OAuth token from Chrome Identity API
   * @returns {Promise<string>} OAuth token
   */
  async getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });
  }

  /**
   * Fetch user info from Google API
   * @param {string} token - OAuth token
   * @returns {Promise<Object>} User profile
   */
  async fetchUserInfo(token) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      console.log('🚪 Signing out...');

      // Revoke token
      if (this.token) {
        await this.revokeToken(this.token);
      }

      // Clear state
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      // Clear storage
      await chrome.storage.local.remove(['currentUser', 'authToken', 'isAuthenticated']);

      console.log('✅ Signed out successfully');

    } catch (error) {
      console.error('❌ Sign-out failed:', error);
      throw error;
    }
  }

  /**
   * Revoke OAuth token
   * @param {string} token - Token to revoke
   */
  async revokeToken(token) {
    return new Promise((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Check if user is authenticated and load from storage
   * @returns {Promise<boolean>} Authentication status
   */
  async checkAuth() {
    try {
      const { currentUser, authToken, isAuthenticated } = await chrome.storage.local.get([
        'currentUser',
        'authToken',
        'isAuthenticated'
      ]);

      if (isAuthenticated && currentUser && authToken) {
        this.user = currentUser;
        this.token = authToken;
        this.isAuthenticated = true;

        console.log('✅ User already authenticated:', currentUser.email);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  /**
   * Get current user info
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get current auth token
   * @returns {string|null} Token or null
   */
  getToken() {
    return this.token;
  }

  /**
   * Fetch user's Google Calendar events
   * @param {number} maxResults - Maximum events to fetch
   * @returns {Promise<Array>} Calendar events
   */
  async getCalendarEvents(maxResults = 10) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const now = new Date().toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `maxResults=${maxResults}&` +
        `orderBy=startTime&` +
        `singleEvents=true&` +
        `timeMin=${now}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      return data.items || [];

    } catch (error) {
      console.error('❌ Failed to fetch calendar:', error);
      throw error;
    }
  }

  /**
   * Check if user has admin privileges
   * @returns {Promise<boolean>}
   */
  async isAdmin() {
    if (!this.user) {
      return false;
    }

    // Check if user email is in admin list
    const { adminEmails = [] } = await chrome.storage.local.get('adminEmails');
    return adminEmails.includes(this.user.email);
  }

  /**
   * Get user's assigned API keys (from admin dashboard)
   * @returns {Promise<Object>} API keys object
   */
  async getUserAPIKeys() {
    if (!this.user) {
      throw new Error('Not authenticated');
    }

    try {
      // First check if there are master keys (for all users)
      const { masterAPIKeys } = await chrome.storage.local.get('masterAPIKeys');

      if (masterAPIKeys && masterAPIKeys.openai) {
        console.log('✅ Using master API keys');
        return masterAPIKeys;
      }

      // Otherwise, check for user-specific keys
      const { users = [] } = await chrome.storage.local.get('users');
      const userRecord = users.find(u => u.email === this.user.email);

      if (userRecord && userRecord.apiKeys) {
        console.log('✅ Using user-specific API keys');
        return userRecord.apiKeys;
      }

      // Fallback to keys stored in options
      const { openAIKey, assemblyAIKey } = await chrome.storage.local.get([
        'openAIKey',
        'assemblyAIKey'
      ]);

      return {
        openai: openAIKey,
        assemblyai: assemblyAIKey
      };

    } catch (error) {
      console.error('❌ Failed to get API keys:', error);
      return {};
    }
  }
}

// Export as global for non-module usage
if (typeof window !== 'undefined') {
  window.GoogleAuthService = GoogleAuthService;
}

// Also export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleAuthService;
}
