<template>
  <div class="login-form">
    <!-- Debug panel (visibile solo in modalità debug) -->
    <div v-if="isDebugMode" class="debug-panel mb-4 p-3 border rounded bg-light">
      <h5 class="mb-3">📊 Diagnostica</h5>
      <div class="mb-2">
        <strong>Stato corrente:</strong>
        <ul class="mb-0 ps-3">
          <li>Debug: {{ isDebugMode ? 'Attivo' : 'Disattivato' }}</li>
          <li>Loading: {{ loading }}</li>
          <li>Autenticato: {{ isAuthenticated }}</li>
          <li>Errore: {{ error || 'Nessuno' }}</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Input:</strong>
        <ul class="mb-0 ps-3">
          <li>Username: "{{ username }}"</li>
          <li>Password: "{{ password ? '***' : '' }}"</li>
          <li>Remember Me: {{ rememberMe }}</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Store:</strong>
        <ul class="mb-0 ps-3">
          <li>Token: {{ authStore.token ? '✓' : '✗' }}</li>
          <li>Ruoli: {{ authStore.user?.authorities?.join(', ') || 'Nessuno' }}</li>
        </ul>
      </div>
      <div class="mt-2">
        <button type="button" class="btn btn-sm btn-info me-2" @click="testLogin">Test Login</button>
        <button type="button" class="btn btn-sm btn-warning" @click="resetForm">Reset</button>
      </div>
    </div>

    <!-- Alert di errore -->
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- Form di Login -->
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
          :placeholder="t('username')"
          :disabled="loading"
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
          :placeholder="t('password')"
          :disabled="loading"
        />
      </div>
      <div class="mb-3 form-check">
        <input 
          type="checkbox" 
          class="form-check-input" 
          id="rememberMe" 
          v-model="rememberMe"
          :disabled="loading"
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
      <div class="d-flex justify-content-between mt-3">
        <NuxtLink to="/auth/register" class="btn btn-info btn-sm">{{ t('no_account') }}</NuxtLink>
        
        <NuxtLink to="/account/reset/init" class="btn btn-info btn-sm">{{ t('forgot_password') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useAuthStore } from '~/stores/auth';
import { useI18n } from '~/composables/useI18n';
import ForgotPasswordLink from '~/components/Auth/ForgotPasswordLink.vue';

// Composable e store per l'autenticazione
const { login, isAuthenticated, error: authError, loading } = useAuth();
const authStore = useAuthStore();
const { t } = useI18n();

// Stato locale del form
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref('');

// Modalità debug
const isDebugMode = ref(false);

// Al montaggio del componente, controlla se siamo in modalità debug
onMounted(() => {
  // Verifica NUXT_DEBUG nell'ambiente
  const debugEnv = process.env.NUXT_DEBUG;
  isDebugMode.value = debugEnv === 'true';
  
  // Log per verifica variabili d'ambiente
  if (isDebugMode.value) {
    console.log('[LoginForm] Debug mode enabled');
    console.log('[LoginForm] Environment variables:', {
      NUXT_DEBUG: process.env.NUXT_DEBUG,
      NODE_ENV: process.env.NODE_ENV,
      API_BASE: process.env.NUXT_PUBLIC_API_BASE
    });
  }
  
  // Prefill credenziali in modalità sviluppo per test rapidi
  if (process.env.NODE_ENV === 'development' && isDebugMode.value) {
    username.value = 'admin';
    password.value = 'admin';
  }
});

// Gestione login
const handleLogin = async () => {
  error.value = '';
  
  // Validazione base
  if (!username.value || !password.value) {
    error.value = t('fill_required');
    return;
  }
  
  if (isDebugMode.value) {
    console.log('[LoginForm] Tentativo di login con:', { 
      username: username.value, 
      rememberMe: rememberMe.value 
    });
  }
  
  try {
    const success = await login(username.value, password.value, rememberMe.value);
    
    if (isDebugMode.value) {
      console.log('[LoginForm] Risultato login:', { success, authError: authError.value });
    }
    
    if (!success) {
      error.value = authError.value || t('login_failed');
    }
  } catch (e) {
    if (isDebugMode.value) {
      console.error('[LoginForm] Errore durante login:', e);
    }
    error.value = t('error_during_auth');
  }
};

// Funzioni di utilità per il debug
const testLogin = () => {
  username.value = 'admin';
  password.value = 'admin';
  handleLogin();
};

const resetForm = () => {
  username.value = '';
  password.value = '';
  rememberMe.value = false;
  error.value = '';
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.debug-panel {
  font-size: 0.9rem;
  text-align: left;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>

<!-- Version: 1.1.0 -->
