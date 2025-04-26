## composables/useAuth.ts

```typescript
// composables/useAuth.ts
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    const success = await authStore.login(username, password, rememberMe);
    if (success) {
      await router.push('/');
    }
    return success;
  };

  const logout = () => {
    authStore.logout();
    router.push('/login');
  };

  const register = async (userData: any) => {
    const success = await authStore.register(userData);
    if (success) {
      router.push('/login');
    }
    return success;
  };

  const checkAuth = async () => {
    authStore.initAuth();
  };

  return {
    login,
    logout,
    register,
    checkAuth,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    user: computed(() => authStore.getUser),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error)
  };
}
```

This composable provides access to the authentication store and router.
