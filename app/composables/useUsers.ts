// app/composables/useUsers.ts
import { ref, computed } from 'vue';
import { useUsersStore } from '~/stores/users';
import { useAuthStore } from '~/stores/auth';

// Debug mode check
const isDebugMode = process.env.NUXT_DEBUG === 'true';

// Conditional logging utility
const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    console.log('[useUsers]', ...args);
  }
};

export function useUsers() {
  const usersStore = useUsersStore();
  const authStore = useAuthStore();

  // Reactivity refs for local UI state
  const localLoading = ref(false);
  const localError = ref<string | null>(null);

  /**
   * Fetches all users with pagination
   */
  const fetchUsers = async (page: number = 0, size: number = 20) => {
    debugLog('Fetching users', { page, size });
    localLoading.value = true;
    localError.value = null;
    
    try {
      if (!authStore.isAuthenticated || !authStore.isAdmin) {
        throw new Error('Unauthorized access');
      }
      
      const result = await usersStore.fetchUsers(page, size);
      debugLog('Users fetched successfully', { count: result?.length || 0 });
      return result;
    } catch (error: any) {
      debugLog('Error fetching users', error);
      localError.value = error.message || 'Failed to fetch users';
      throw error;
    } finally {
      localLoading.value = false;
    }
  };

  /**
   * Fetches a single user by login
   */
  const fetchUser = async (login: string) => {
    debugLog('Fetching user', { login });
    localLoading.value = true;
    localError.value = null;
    
    try {
      if (!authStore.isAuthenticated || !authStore.isAdmin) {
        throw new Error('Unauthorized access');
      }
      
      const user = await usersStore.fetchUser(login);
      debugLog('User fetched successfully', { login, user });
      return user;
    } catch (error: any) {
      debugLog('Error fetching user', error);
      localError.value = error.message || 'Failed to fetch user';
      throw error;
    } finally {
      localLoading.value = false;
    }
  };

  /**
   * Creates a new user
   */
  const createUser = async (userData: any) => {
    debugLog('Creating user', userData);
    localLoading.value = true;
    localError.value = null;
    
    try {
      if (!authStore.isAuthenticated || !authStore.isAdmin) {
        throw new Error('Unauthorized access');
      }
      
      const result = await usersStore.createUser(userData);
      debugLog('User created successfully', { login: userData.login });
      return result;
    } catch (error: any) {
      debugLog('Error creating user', error);
      localError.value = error.message || 'Failed to create user';
      throw error;
    } finally {
      localLoading.value = false;
    }
  };

  /**
   * Updates an existing user
   */
  const updateUser = async (login: string, userData: any) => {
    debugLog('Updating user', { login, userData });
    localLoading.value = true;
    localError.value = null;
    
    try {
      if (!authStore.isAuthenticated || !authStore.isAdmin) {
        throw new Error('Unauthorized access');
      }
      
      const result = await usersStore.updateUser(login, userData);
      debugLog('User updated successfully', { login });
      return result;
    } catch (error: any) {
      debugLog('Error updating user', error);
      localError.value = error.message || 'Failed to update user';
      throw error;
    } finally {
      localLoading.value = false;
    }
  };

  /**
   * Deletes a user
   */
  const deleteUser = async (login: string) => {
    debugLog('Deleting user', { login });
    localLoading.value = true;
    localError.value = null;
    
    try {
      if (!authStore.isAuthenticated || !authStore.isAdmin) {
        throw new Error('Unauthorized access');
      }
      
      if (login === 'admin') {
        throw new Error('Cannot delete admin user');
      }
      
      const result = await usersStore.deleteUser(login);
      debugLog('User deleted successfully', { login });
      return result;
    } catch (error: any) {
      debugLog('Error deleting user', error);
      localError.value = error.message || 'Failed to delete user';
      throw error;
    } finally {
      localLoading.value = false;
    }
  };

  // Debug utility functions
  const debugUtils = isDebugMode ? {
    resetState: () => {
      debugLog('Resetting users state');
      // Reset your local state here
    },
    isDebugMode
  } : { isDebugMode: false };

  return {
    // Store data
    users: computed(() => usersStore.getUsers),
    currentUser: computed(() => usersStore.getCurrentUser),
    loading: computed(() => localLoading.value || usersStore.loading),
    error: computed(() => localError.value || usersStore.error),
    
    // CRUD operations
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    
    // Debug utilities
    ...debugUtils
  };
}

// Version: 1.0.1