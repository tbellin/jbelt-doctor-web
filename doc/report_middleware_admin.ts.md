## middleware/admin.ts

```typescript
// middleware/admin.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // Check if user is authenticated and has admin role
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
  
  if (!authStore.isAdmin) {
    return navigateTo('/');
  }
});
```

This middleware protects routes that require administrator privileges.
