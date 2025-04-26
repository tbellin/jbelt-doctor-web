// app/composables/useAuth.ts
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';

// Controllo modalità debug
const isDebugMode = process.env.NUXT_DEBUG === 'true';

// Utility di logging condizionale
const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    console.log('[useAuth]', ...args);
  }
};

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  // Inizializza l'autenticazione all'avvio del composable
  onMounted(async () => {
    if (!authStore.isInitialized) {
      debugLog('Auto-initializing auth on composable mount');
      await authStore.initAuth();
    }
  });

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    debugLog('Login request', { username, rememberMe });
    const success = await authStore.login(username, password, rememberMe);
    
    if (success) {
      debugLog('Login successful, redirecting to home');
      await router.push('/');
    } else {
      debugLog('Login failed', authStore.error);
    }
    
    return success;
  };

  const logout = () => {
    debugLog('Logout requested');
    authStore.logout();
    router.push('/');
  };

  const register = async (userData: any) => {
    debugLog('Register request', userData);
    // Simulazione registrazione in modalità debug
    if (isDebugMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      debugLog('Registration successful (simulated)');
      router.push('/login');
      return true;
    }
    
    // Implementazione reale per la registrazione
    // TODO: Implementare la logica di registrazione tramite API
    return false;
  };

  const resetPasswordInit = async (email: string) => {
    debugLog('Reset password init request', { email });
    return await authStore.resetPasswordInit(email);
  };

  const resetPasswordFinish = async (key: string, newPassword: string) => {
    debugLog('Reset password finish request', { key });
    return await authStore.resetPasswordFinish(key, newPassword);
  };

  // NUOVA FUNZIONE: Cambio password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    debugLog('Change password request');
    return await authStore.changePassword(currentPassword, newPassword);
  };

  const checkAuth = async () => {
    debugLog('Checking authentication state');
    await authStore.initAuth();
    
    if (authStore.isAuthenticated) {
      debugLog('User is authenticated', { 
        user: authStore.user?.login,
        isAdmin: authStore.isAdmin
      });
    } else {
      debugLog('User is not authenticated');
    }
  };

  // Espone le funzionalità di debug solo in modalità debug
  const debugUtils = isDebugMode ? {
    simulateAuth: () => {
      debugLog('Simulating authentication');
      authStore.setMockAdminUser();
      return true;
    },
    resetAuth: () => {
      debugLog('Resetting authentication state');
      authStore.clearAuthState();
    },
    isDebugMode,
    displayToken: computed(() => authStore.getDisplayToken)
  } : { isDebugMode: false };

  return {
    login,
    logout,
    register,
    resetPasswordInit,
    resetPasswordFinish,
    changePassword, // Esposizione della nuova funzione
    checkAuth,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    user: computed(() => authStore.getUser),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    ...debugUtils
  };
}

// Version: 1.2.0