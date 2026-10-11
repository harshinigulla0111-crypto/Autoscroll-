/**
 * Authentication Service for AutoScroll AI
 * Handles API calls to backend auth routes with offline session fallback.
 */

const API_BASE = '/api/auth';
const TOKEN_KEY = 'autoscroll_auth_token_v1';
const USER_KEY = 'autoscroll_auth_user_v1';

export const authService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
  },

  getUser() {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  },

  saveSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async register(email, password) {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        this.saveSession(data.token, data.user);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      // Offline fallback registration
      const offlineUser = {
        id: `usr_off_${Date.now().toString(36)}`,
        email: email.trim().toLowerCase(),
        isOffline: true
      };
      const offlineToken = `token_offline_${Date.now()}`;
      this.saveSession(offlineToken, offlineUser);
      return {
        success: true,
        user: offlineUser,
        message: 'Offline account created successfully'
      };
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        this.saveSession(data.token, data.user);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err) {
      // Offline fallback login
      const offlineUser = {
        id: `usr_off_${Date.now().toString(36)}`,
        email: email.trim().toLowerCase(),
        isOffline: true
      };
      const offlineToken = `token_offline_${Date.now()}`;
      this.saveSession(offlineToken, offlineUser);
      return {
        success: true,
        user: offlineUser,
        message: 'Offline login session initialized'
      };
    }
  },

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.saveSession(token, data.user);
        return data.user;
      }
    } catch (e) {
      // Return cached user if network fails
    }
    return this.getUser();
  },

  logout() {
    this.clearSession();
  }
};
