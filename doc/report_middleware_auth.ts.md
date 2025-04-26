## middleware/auth.ts

```typescript
// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // Initialize auth if not done yet
  if (!authStore.isAuthenticated) {
    authStore.initAuth();
  }
  
  // If still not authenticated after init, redirect to login
  if (!authStore.isAuthenticated && !to.path.startsWith('/auth')) {
    return navigateTo('/login');
  }
  
  // If authenticated and trying to access auth pages, redirect to home
  if (authStore.isAuthenticated && to.path.startsWith('/auth')) {
    return navigateTo('/');
  }
});
```

This middleware protects routes that require authentication.
