// stores/auth.ts
import { defineStore } from 'pinia';
import axios from 'axios';

// Controllo modalità debug
const isDebugMode = process.env.NUXT_DEBUG === 'true';

// Utility di logging condizionale
const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    console.log('[AuthStore]', ...args);
  }
};

interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  activated: boolean;
  langKey: string;
  authorities: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  debugMode: boolean;
  isInitialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null,
    debugMode: isDebugMode,
    isInitialized: false
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.token && !!this.user;
    },
    isAdmin(): boolean {
      return !!this.user?.authorities.includes('ROLE_ADMIN');
    },
    getToken(): string | null {
      return this.token;
    },
    getUser(): User | null {
      return this.user;
    },
    // Getter per visualizzare il token in modo sicuro (solo in debug)
    getDisplayToken(): string {
      if (!this.token) return 'No token';
      if (!this.debugMode) return 'Token hidden in production';
      
      // In debug mode, mostra solo i primi e ultimi caratteri
      const tokenLength = this.token.length;
      if (tokenLength <= 10) return this.token;
      
      return `${this.token.substring(0, 5)}...${this.token.substring(tokenLength - 5)}`;
    }
  },

  actions: {
    // Initialize auth state from localStorage
    async initAuth() {
      debugLog('Initializing auth state');
      
      const token = localStorage.getItem('auth_token');
      if (token) {
        debugLog('Found token in localStorage');
        this.token = token;
        await this.fetchUserData();
      } else {
        debugLog('No token found in localStorage');
      }
      
      this.isInitialized = true;
      return this.isAuthenticated;
    },

    // Login user
    async login(username: string, password: string, rememberMe: boolean = false) {
      this.loading = true;
      this.error = null;
      
      debugLog('Login attempt', { username, rememberMe });
      
      try {
        const config = useRuntimeConfig();
        debugLog('API Base URL:', config.public.apiBase);
        
        // Tentativo reale di login
        debugLog('Calling API endpoint for authentication');
        const response = await axios.post(`${config.public.apiBase}/api/authenticate`, {
          username,
          password,
          rememberMe
        });
        
        debugLog('Login response received', { status: response.status });
        
        const { id_token } = response.data;
        this.token = id_token;
        
        localStorage.setItem('auth_token', id_token);
        
        await this.fetchUserData();
        
        return true;
      } catch (error: any) {
        debugLog('Login failed', error?.response?.data || error.message);
        this.error = error.response?.data?.detail || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Fetch user data from API
    async fetchUserData() {
      if (!this.token) {
        debugLog('Cannot fetch user data: No token available');
        return;
      }
      
      this.loading = true;
      debugLog('Fetching user data');
      
      try {
        const config = useRuntimeConfig();
        
        debugLog('Calling API endpoint for user data');
        const response = await axios.get(`${config.public.apiBase}/api/account`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        
        debugLog('User data received', response.data);
        this.user = response.data;
      } catch (error: any) {
        debugLog('Failed to fetch user data', error?.response?.data || error.message);
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    // Update user data (after profile update)
    async updateUserData(userData: any) {
      debugLog('Updating user data in store', userData);
      this.user = { ...this.user, ...userData };
    },

    // Set loading state
    setLoading(isLoading: boolean) {
      this.loading = isLoading;
    },

    // Set error state
    setError(errorMessage: string | null) {
      this.error = errorMessage;
    },

    // Logout user
    logout() {
      debugLog('Logout');
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
    },

    // Reset password initialization (request reset)
    async resetPasswordInit(email: string) {
      debugLog('Requesting password reset for email:', email);
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await axios.post(
          `${config.public.apiBase}/api/account/reset-password/init`, 
          email, 
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        );
        
        debugLog('Reset password request successful', response.status);
        return true;
      } catch (error: any) {
        debugLog('Reset password request failed', error?.response?.data || error.message);
        this.error = error.response?.data?.detail || 'Failed to request password reset';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Reset password finish (complete reset with new password)
    async resetPasswordFinish(key: string, newPassword: string) {
      debugLog('Completing password reset with key');
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await axios.post(
          `${config.public.apiBase}/api/account/reset-password/finish`, 
          {
            key,
            newPassword
          }
        );
        
        debugLog('Reset password completion successful', response.status);
        return true;
      } catch (error: any) {
        debugLog('Reset password completion failed', error?.response?.data || error.message);
        this.error = error.response?.data?.detail || 'Failed to complete password reset';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // NUOVA AZIONE: Cambio password
    async changePassword(currentPassword: string, newPassword: string) {
      if (!this.token || !this.isAuthenticated) {
        debugLog('Cannot change password: Not authenticated');
        this.error = 'Not authenticated';
        return false;
      }
      
      this.loading = true;
      this.error = null;
      
      debugLog('Changing password');
      
      try {
        const config = useRuntimeConfig();
        
        const response = await axios.post(
          `${config.public.apiBase}/api/account/change-password`,
          {
            currentPassword,
            newPassword
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        debugLog('Password change successful', response.status);
        return true;
      } catch (error: any) {
        debugLog('Password change failed', error?.response?.data || error.message);
        this.error = error.response?.data?.detail || 'Failed to change password';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Debug utility methods
    clearAuthState() {
      if (!this.debugMode) return;
      
      debugLog('Clearing auth state');
      this.token = null;
      this.user = null;
      this.error = null;
      localStorage.removeItem('auth_token');
    },
    
    setMockAdminUser() {
      if (!this.debugMode) return;
      
      debugLog('Setting mock admin user');
      this.token = 'debug-jwt-token';
      this.user = {
        id: 1,
        login: 'admin',
        firstName: 'Administrator',
        lastName: 'User',
        email: 'admin@example.com',
        imageUrl: '',
        activated: true,
        langKey: 'it',
        authorities: ['ROLE_USER', 'ROLE_ADMIN']
      };
      localStorage.setItem('auth_token', this.token);
    }
  }
});

// Version: 1.3.0