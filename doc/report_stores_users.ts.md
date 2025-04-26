## stores/users.ts

```typescript
// stores/users.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  activated: boolean;
  langKey: string;
  createdBy: string;
  createdDate: string | null;
  lastModifiedBy: string;
  lastModifiedDate: string | null;
  authorities: string[];
}

interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  page: number;
  size: number;
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    totalItems: 0,
    page: 0,
    size: 20
  }),

  getters: {
    getUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
    isLoading: (state) => state.loading
  },

  actions: {
    // Fetch all users with pagination
    async fetchUsers(page: number = 0, size: number = 20) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.isAdmin) return;

      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await axios.get(`${config.public.apiBase}/api/admin/users`, {
          params: { page, size },
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        });
        
        this.users = response.data;
        this.page = page;
        this.size = size;
        
        return this.users;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch users';
        return [];
      } finally {
        this.loading = false;
      }
    },

    // Fetch a single user by login
    async fetchUser(login: string) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.isAdmin) return null;

      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await axios.get(`${config.public.apiBase}/api/admin/users/${login}`, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        });
        
        this.currentUser = response.data;
        return this.currentUser;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch user';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Create a new user
    async createUser(userData: Partial<User>) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.isAdmin) return false;

      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        await axios.post(`${config.public.apiBase}/api/admin/users`, userData, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        });
        
        await this.fetchUsers(this.page, this.size);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to create user';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Update an existing user
    async updateUser(login: string, userData: Partial<User>) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.isAdmin) return false;

      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        await axios.put(`${config.public.apiBase}/api/admin/users/${login}`, userData, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        });
        
        await this.fetchUsers(this.page, this.size);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update user';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Delete a user
    async deleteUser(login: string) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.isAdmin) return false;

      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        await axios.delete(`${config.public.apiBase}/api/admin/users/${login}`, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        });
        
        await this.fetchUsers(this.page, this.size);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete user';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

This file defines the Pinia store for managing users.
