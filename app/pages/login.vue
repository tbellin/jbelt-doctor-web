<!-- pages/login.vue -->
<template>
  <div>
    <!-- Pannello debug (visibile solo in modalità debug) -->
    <div v-if="isDebugMode" class="debug-card card mb-4">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <span>🔍 Debug Info - Login Page</span>
        <button @click="isDebugExpanded = !isDebugExpanded" class="btn btn-sm btn-light">
          {{ isDebugExpanded ? 'Nascondi' : 'Mostra' }}
        </button>
      </div>
      <div v-if="isDebugExpanded" class="card-body">
        <h6>Route Info:</h6>
        <pre class="bg-light p-2 rounded">{{ JSON.stringify(route, null, 2) }}</pre>
        
        <h6 class="mt-3">Auth State:</h6>
        <pre class="bg-light p-2 rounded">{{ JSON.stringify({
          isAuthenticated: isAuthenticated.value,
          isAdmin: isAdmin.value,
          loading: loading.value,
          error: error.value
        }, null, 2) }}</pre>
        
        <div class="mt-3">
          <button @click="testAuthStore" class="btn btn-sm btn-warning me-2">Test Auth Store</button>
          <button @click="resetAuthStore" class="btn btn-sm btn-secondary">Reset Auth</button>
        </div>
      </div>
    </div>
    
    <h3 class="text-center mb-4">{{ pageTitle }}</h3>
    
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LoginForm from '~/components/Auth/LoginForm.vue';
import { useAuth } from '~/composables/useAuth';
import { useAuthStore } from '~/stores/auth';

// Configurazione della pagina
definePageMeta({
  layout: 'auth',
  middleware: ['auth']
});

// Hooks e composables
const route = useRoute();
const { isAuthenticated, isAdmin, loading, error } = useAuth();
const authStore = useAuthStore();

// Stato locale
const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
const isDebugExpanded = ref(false);
const pageTitle = ref('Accedi');

// Controlli all'avvio del componente
onMounted(() => {
  if (isDebugMode.value) {
    console.log('[LoginPage] Mounted', {
      route: route.fullPath,
      query: route.query,
      debugMode: isDebugMode.value
    });
  }
  
  // Considera parametri URL per test
  if (route.query.test === 'true' && isDebugMode.value) {
    isDebugExpanded.value = true;
  }
});

// Funzioni di utilità per il debug
const testAuthStore = () => {
  if (!isDebugMode.value) return;
  console.log('[LoginPage] Testing auth store');
  authStore.setMockAdminUser();
};

const resetAuthStore = () => {
  if (!isDebugMode.value) return;
  console.log('[LoginPage] Resetting auth store');
  authStore.clearAuthState();
};
</script>

<style scoped>
pre {
  font-size: 0.8rem;
  max-height: 150px;
  overflow-y: auto;
}

.debug-card {
  font-size: 0.9rem;
  text-align: left;
}
</style>