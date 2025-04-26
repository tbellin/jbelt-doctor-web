#!/bin/zsh

# Script per creare la struttura del progetto Nuxt.js 4 con autenticazione
# Versione: 1.0.0
# Data: 13/03/2025

echo "\033[1;34m=== Creazione Progetto Nuxt.js 4 con Autenticazione e Bootstrap 5 ===\033[0m"

# Variabili
PROJECT_DIR="nuxt-app"

# Creazione cartella principale del progetto
echo "\033[1;32m[1/20] Creazione della struttura di base del progetto...\033[0m"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Creazione della struttura delle cartelle
echo "\033[1;32m[2/20] Creazione delle cartelle del progetto...\033[0m"
mkdir -p assets/css
mkdir -p components/Auth
mkdir -p components/Layout
mkdir -p components/Users
mkdir -p composables
mkdir -p layouts
mkdir -p middleware
mkdir -p pages/auth
mkdir -p pages/admin/users
mkdir -p plugins
mkdir -p public/locales
mkdir -p stores
mkdir -p utils

# Creazione del file package.json
echo "\033[1;32m[3/20] Creazione del file package.json...\033[0m"
cat > package.json << 'EOF'
{
  "name": "nuxt-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "@pinia/nuxt": "^0.5.1",
    "axios": "^1.6.5",
    "bootstrap": "^5.3.2",
    "@popperjs/core": "^2.11.8",
    "jwt-decode": "^4.0.0",
    "pinia": "^2.1.7",
    "sass": "^1.70.0",
    "sass-loader": "^14.0.0"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "nuxt": "^3.10.1",
    "typescript": "^5.3.3"
  }
}
EOF

# Creazione del file nuxt.config.ts
echo "\033[1;32m[4/20] Creazione del file nuxt.config.ts...\033[0m"
cat > nuxt.config.ts << 'EOF'
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  app: {
    head: {
      title: 'Nuxt 4 Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Nuxt 4 Admin Dashboard' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '@/assets/css/main.css'
  ],
  modules: [
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080/api'
    }
  },
  build: {
    transpile: ['@popperjs/core'],
  },
  routes: {
    middleware: ['i18n']
  }
})
EOF

# Creazione del file app.vue
echo "\033[1;32m[5/20] Creazione del file app.vue...\033[0m"
cat > app.vue << 'EOF'
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const { checkAuth } = useAuth();

// Check if user is authenticated
onMounted(async () => {
  await checkAuth();
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
EOF

# Creazione del file assets/css/main.css
echo "\033[1;32m[6/20] Creazione del file assets/css/main.css...\033[0m"
cat > assets/css/main.css << 'EOF'
/* assets/css/main.css */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active-link {
  font-weight: bold;
  text-decoration: underline;
}

.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.sidebar {
  min-height: 100vh;
  background-color: #212529;
  color: white;
}

.main-content {
  min-height: 100vh;
}

.language-switcher {
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
EOF

# Creazione del file stores/auth.ts
echo "\033[1;32m[7/20] Creazione del file stores/auth.ts...\033[0m"
cat > stores/auth.ts << 'EOF'
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
        const response = await axios.post(`${config.public.apiBase}/authenticate`, {
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
        const response = await axios.get(`${config.public.apiBase}/account`, {
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
        const response = await axios.post(`${config.public.apiBase}/account`, 
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
EOF

# Creazione del file stores/users.ts
echo "\033[1;32m[8/20] Creazione del file stores/users.ts...\033[0m"
cat > stores/users.ts << 'EOF'
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
        const response = await axios.get(`${config.public.apiBase}/admin/users`, {
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
        const response = await axios.get(`${config.public.apiBase}/admin/users/${login}`, {
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
        await axios.post(`${config.public.apiBase}/admin/users`, userData, {
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
        await axios.put(`${config.public.apiBase}/admin/users/${login}`, userData, {
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
        await axios.delete(`${config.public.apiBase}/admin/users/${login}`, {
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
EOF

# Creazione del file composables/useAuth.ts
echo "\033[1;32m[9/20] Creazione del file composables/useAuth.ts...\033[0m"
cat > composables/useAuth.ts << 'EOF'
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
EOF

# Creazione del file composables/useI18n.ts
echo "\033[1;32m[10/20] Creazione del file composables/useI18n.ts...\033[0m"
cat > composables/useI18n.ts << 'EOF'
// composables/useI18n.ts
import { ref, computed } from 'vue';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Singleton pattern for language state across the application
const currentLanguage = ref(localStorage.getItem('user_language') || 'en');
const translations = ref<Translations>({});

// Load translations
async function loadTranslations() {
  try {
    const enResponse = await fetch('/locales/en.json');
    const itResponse = await fetch('/locales/it.json');
    
    const en = await enResponse.json();
    const it = await itResponse.json();
    
    translations.value = {
      en,
      it
    };
  } catch (error) {
    console.error('Failed to load translations', error);
  }
}

export function useI18n() {
  // Switch language and save preference
  const setLanguage = (lang: string) => {
    currentLanguage.value = lang;
    localStorage.setItem('user_language', lang);
    
    // Update HTML lang attribute for accessibility
    document.documentElement.setAttribute('lang', lang);
  };

  // Translate a key
  const t = (key: string) => {
    const langTranslations = translations.value[currentLanguage.value] || {};
    return langTranslations[key] || key;
  };

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' }
  ];

  return {
    currentLanguage: computed(() => currentLanguage.value),
    availableLanguages,
    setLanguage,
    t,
    loadTranslations
  };
}
EOF

# Creazione del file composables/useUsers.ts
echo "\033[1;32m[11/20] Creazione del file composables/useUsers.ts...\033[0m"
cat > composables/useUsers.ts << 'EOF'
// composables/useUsers.ts
import { useUsersStore } from '~/stores/users';

export function useUsers() {
  const usersStore = useUsersStore();

  const fetchUsers = async (page: number = 0, size: number = 20) => {
    return await usersStore.fetchUsers(page, size);
  };

  const fetchUser = async (login: string) => {
    return await usersStore.fetchUser(login);
  };

  const createUser = async (userData: any) => {
    return await usersStore.createUser(userData);
  };

  const updateUser = async (login: string, userData: any) => {
    return await usersStore.updateUser(login, userData);
  };

  const deleteUser = async (login: string) => {
    return await usersStore.deleteUser(login);
  };

  return {
    users: computed(() => usersStore.getUsers),
    currentUser: computed(() => usersStore.getCurrentUser),
    loading: computed(() => usersStore.loading),
    error: computed(() => usersStore.error),
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser
  };
}
EOF

# Creazione del file plugins/axios.ts
echo "\033[1;32m[12/20] Creazione del file plugins/axios.ts...\033[0m"
cat > plugins/axios.ts << 'EOF'
// plugins/axios.ts
import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  axios.defaults.baseURL = config.public.apiBase;
  
  // Add request interceptor to attach auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If token is expired or invalid, redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return {
    provide: {
      axios
    }
  };
});
EOF

# Creazione del file plugins/bootstrap.client.ts
echo "\033[1;32m[13/20] Creazione del file plugins/bootstrap.client.ts...\033[0m"
cat > plugins/bootstrap.client.ts << 'EOF'
// plugins/bootstrap.client.ts
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default defineNuxtPlugin(() => {
  // The bootstrap JS is now loaded and ready to use
});
EOF

# Creazione del file middleware/auth.ts
echo "\033[1;32m[14/20] Creazione del file middleware/auth.ts...\033[0m"
cat > middleware/auth.ts << 'EOF'
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
EOF

# Creazione del file middleware/admin.ts
echo "\033[1;32m[15/20] Creazione del file middleware/admin.ts...\033[0m"
cat > middleware/admin.ts << 'EOF'
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
EOF

# Creazione del file middleware/i18n.ts
echo "\033[1;32m[16/20] Creazione del file middleware/i18n.ts...\033[0m"
cat > middleware/i18n.ts << 'EOF'
// middleware/i18n.ts
import { useI18n } from '~/composables/useI18n';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (process.server) return;
  
  const { currentLanguage, loadTranslations } = useI18n();
  
  // Load translations if needed
  await loadTranslations();
  
  // Set HTML lang attribute
  document.documentElement.setAttribute('lang', currentLanguage.value);
});
EOF

# Creazione del file layouts/default.vue
echo "\033[1;32m[17/20] Creazione del file layouts/default.vue...\033[0m"
cat > layouts/default.vue << 'EOF'
<!-- layouts/default.vue -->
<template>
  <div class="layout-default">
    <Header />
    <main class="container py-4">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Layout/Header.vue';
import Footer from '~/components/Layout/Footer.vue';
</script>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
EOF

# Creazione del file components/Auth/LoginForm.vue
echo "\033[1;32m[18/20] Creazione del file components/Auth/LoginForm.vue...\033[0m"
cat > components/Auth/LoginForm.vue << 'EOF'
<!-- components/Auth/LoginForm.vue -->
<template>
  <div class="login-form">
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label for="username" class="form-label">{{ t('username') }}</label>
        <input
          type="text"
          class="form-control"
          id="username"
          v-model="username"
          required
          autocomplete="username"
          :placeholder="t('enter_username')"
        />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">{{ t('password') }}</label>
        <input
          type="password"
          class="form-control"
          id="password"
          v-model="password"
          required
          autocomplete="current-password"
          :placeholder="t('enter_password')"
        />
      </div>
      <div class="mb-3 form-check">
        <input 
          type="checkbox" 
          class="form-check-input" 
          id="rememberMe" 
          v-model="rememberMe"
        />
        <label class="form-check-label" for="rememberMe">
          {{ t('remember_me') }}
        </label>
      </div>
      <div class="d-grid gap-2">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ t('login') }}
        </button>
      </div>
      <div class="mt-3 text-center">
        <NuxtLink to="/auth/register">{{ t('register_new_account') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useI18n } from '~/composables/useI18n';

const { login, error: authError, loading } = useAuth();
const { t } = useI18n();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  
  if (!username.value || !password.value) {
    error.value = t('please_fill_all_fields');
    return;
  }
  
  const success = await login(username.value, password.value, rememberMe.value);
  
  if (!success) {
    error.value = authError.value || t('login_failed');
  }
};