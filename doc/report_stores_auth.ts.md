## stores/auth.ts

```typescript
// stores/auth.ts
import { defineStore } from 'pinia';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

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
}

interface JwtPayload {
  sub: string;
  auth: string;
  exp: number;
  iat: number;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null
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
    }
  },

  actions: {
    // Initialize auth state from localStorage
    initAuth() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const decodedToken = jwtDecode<JwtPayload>(token);
          const now = Date.now() / 1000;
          
          if (decodedToken.exp > now) {
            this.token = token;
            this.fetchUserData();
          } else {
            this.logout();
          }
        } catch (error) {
          console.error('Invalid token', error);
          this.logout();
        }
      }
    },

    // Login user
    async login(username: string, password: string, rememberMe: boolean = false) {
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await axios.post(`${config.public.apiBase}/api/authenticate`, {
          username,
          password,
          rememberMe
        });
        
        const { id_token } = response.data;
        this.token = id_token;
        
        localStorage.setItem('auth_token', id_token);
        
        await this.fetchUserData();
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Fetch user data from API
    async fetchUserData() {
      if (!this.token) return;
      
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const response = await axios.get(`${config.public.apiBase}/api/account`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        
        this.user = response.data;
      } catch (error) {
        console.error('Failed to fetch user data', error);
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    // Register new user
    async register(userData: any) {
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        await axios.post(`${config.public.apiBase}/register`, userData);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Logout user
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
    },

    // Update current user
    async updateCurrentUser(userData: Partial<User>) {
      if (!this.token || !this.user) return false;
      
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await axios.post(`${config.public.apiBase}/api/account`, 
          { ...this.user, ...userData },
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          }
        );
        
        this.user = response.data;
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Update failed';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

This file defines the Pinia store for authentication.
