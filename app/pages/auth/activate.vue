<!-- app/pages/auth/activate.vue -->
<template>
    <div>
      <!-- Pannello debug (visibile solo in modalità debug) -->
      <div v-if="isDebugMode" class="debug-card card mb-4">
        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <span>🔍 Debug Info - Activate Page</span>
          <button @click="isDebugExpanded = !isDebugExpanded" class="btn btn-sm btn-light">
            {{ isDebugExpanded ? 'Nascondi' : 'Mostra' }}
          </button>
        </div>
        <div v-if="isDebugExpanded" class="card-body">
          <h6>Route Info:</h6>
          <pre class="bg-light p-2 rounded">{{ JSON.stringify(route, null, 2) }}</pre>
          
          <h6 class="mt-3">Activation Key:</h6>
          <pre class="bg-light p-2 rounded">{{ activationKey }}</pre>
          
          <h6 class="mt-3">Status:</h6>
          <pre class="bg-light p-2 rounded">{{ JSON.stringify({
            loading: loading,
            error: error,
            success: success,
            processed: processed
          }, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-body text-center p-5">
          <!-- Stato di caricamento -->
          <div v-if="loading" class="my-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">{{ t('loading') }}</span>
            </div>
            <h4>{{ t('activating_account') }}</h4>
            <p class="text-muted">{{ t('please_wait') }}</p>
          </div>
          
          <!-- Attivazione avvenuta con successo -->
          <div v-else-if="success" class="my-5">
            <div class="mb-4 text-success">
              <i class="bi bi-check-circle-fill" style="font-size: 4rem;"></i>
            </div>
            <h3 class="mb-3">{{ t('activation_success') }}</h3>
            <p>{{ t('account_activated') }}</p>
            <div class="mt-4">
              <NuxtLink to="/login" class="btn btn-primary">
                {{ t('proceed_to_login') }}
              </NuxtLink>
            </div>
          </div>
          
          <!-- Errore di attivazione -->
          <div v-else-if="error" class="my-5">
            <div class="mb-4 text-danger">
              <i class="bi bi-exclamation-triangle-fill" style="font-size: 4rem;"></i>
            </div>
            <h3 class="mb-3">{{ t('activation_error') }}</h3>
            <p>{{ error }}</p>
            <div class="mt-4">
              <NuxtLink to="/auth/register" class="btn btn-outline-primary me-2">
                {{ t('register_again') }}
              </NuxtLink>
              <NuxtLink to="/" class="btn btn-secondary">
                {{ t('home') }}
              </NuxtLink>
            </div>
          </div>
          
          <!-- Nessuna chiave di attivazione trovata -->
          <div v-else-if="!activationKey && processed" class="my-5">
            <div class="mb-4 text-warning">
              <i class="bi bi-question-circle-fill" style="font-size: 4rem;"></i>
            </div>
            <h3 class="mb-3">{{ t('activation_key_missing') }}</h3>
            <p>{{ t('activation_key_required') }}</p>
            <div class="mt-4">
              <NuxtLink to="/auth/register" class="btn btn-primary">
                {{ t('return_to_registration') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  import { useI18n } from '~/composables/useI18n';
  
  // Configurazione della pagina
  definePageMeta({
    layout: 'auth',
    middleware: ['i18n']
  });
  
  // Hooks e composables
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  
  // Stato locale
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const isDebugExpanded = ref(false);
  const activationKey = ref('');
  const loading = ref(false);
  const error = ref('');
  const success = ref(false);
  const processed = ref(false);
  
  // Processa la chiave di attivazione
  const processActivation = async () => {
    if (!activationKey.value) {
      processed.value = true;
      return;
    }
    
    loading.value = true;
    error.value = '';
    success.value = false;
    
    try {
      const config = useRuntimeConfig();
      
      if (isDebugMode.value) {
        console.log('[ActivatePage] Calling activation endpoint with key:', activationKey.value);
      }
      
      const response = await axios.get(`${config.public.apiBase}/api/activate`, {
        params: { key: activationKey.value }
      });
      
      if (isDebugMode.value) {
        console.log('[ActivatePage] Activation response:', response.data);
      }
      
      success.value = true;
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (e) {
      if (isDebugMode.value) {
        console.error('[ActivatePage] Activation error:', e);
      }
      
      error.value = e.response?.data?.detail || t('activation_failed');
    } finally {
      loading.value = false;
      processed.value = true;
    }
  };
  
  // Controlli all'avvio del componente
  onMounted(() => {
    if (isDebugMode.value) {
      console.log('[ActivatePage] Mounted', {
        route: route.fullPath,
        query: route.query,
        debugMode: isDebugMode.value
      });
    }
    
    // Recupera la chiave di attivazione dalla query string
    activationKey.value = route.query.key as string || '';
    
    // Attiva l'account se è presente una chiave
    processActivation();
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