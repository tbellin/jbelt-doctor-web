<!-- app/pages/auth/register.vue -->
<template>
    <div>
      <!-- Pannello debug (visibile solo in modalità debug) -->
      <div v-if="isDebugMode" class="debug-card card mb-4">
        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <span>🔍 Debug Info - Register Page</span>
          <button @click="isDebugExpanded = !isDebugExpanded" class="btn btn-sm btn-light">
            {{ isDebugExpanded ? 'Nascondi' : 'Mostra' }}
          </button>
        </div>
        <div v-if="isDebugExpanded" class="card-body">
          <h6>Route Info:</h6>
          <pre class="bg-light p-2 rounded">{{ JSON.stringify(route, null, 2) }}</pre>
          
          <h6 class="mt-3">Auth State:</h6>
          <pre class="bg-light p-2 rounded">{{ JSON.stringify({
            isAuthenticated: isAuthenticated,
            loading: loading,
            error: error
          }, null, 2) }}</pre>
        </div>
      </div>
      
      <h3 class="text-center mb-4">{{ t('register_account') }}</h3>
      <RegisterForm />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import RegisterForm from '~/components/Auth/RegisterForm.vue';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  
  // Configurazione della pagina
  definePageMeta({
    layout: 'auth',
    middleware: ['i18n']
  });
  
  // Hooks e composables
  const route = useRoute();
  const { isAuthenticated, loading, error } = useAuth();
  const { t } = useI18n();
  
  // Stato locale
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const isDebugExpanded = ref(false);
  
  // Controlli all'avvio del componente
  onMounted(() => {
    if (isDebugMode.value) {
      console.log('[RegisterPage] Mounted', {
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
  
  <!-- Version: 1.0.0 -->