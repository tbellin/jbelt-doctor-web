// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // Public pages that don't require authentication
  const publicPages = ['/', '/about', '/login'];
  const authRequired = !publicPages.includes(to.path);
  
  // If authentication is required and user is not logged in, redirect to login
  if (authRequired && !authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});

// Version: 1.0.0
