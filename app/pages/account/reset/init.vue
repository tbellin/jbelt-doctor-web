<!-- app/pages/account/reset-password/init.vue -->
<template>
    <div>
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">{{ t('profile:reset_password') }}</h4>
        </div>
        <div class="card-body p-4">
          <!-- Debug panel (visibile solo in modalità debug) -->
          <div v-if="isDebugMode" class="debug-panel mb-4 p-3 border rounded bg-light">
            <h5 class="mb-3">📊 Debug Info</h5>
            <div class="mb-2">
              <strong>Stato corrente:</strong>
              <ul class="mb-0 ps-3">
                <li>Email: {{ email }}</li>
                <li>Loading: {{ loading }}</li>
                <li>Success: {{ success }}</li>
                <li>Error: {{ error || 'Nessuno' }}</li>
              </ul>
            </div>
          </div>
  
          <!-- Alert di errore -->
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
  
          <!-- Alert di successo -->
          <div v-if="success" class="alert alert-success" role="alert">
            {{ t('reset_password_email_sent') }}
          </div>
  
          <!-- Form di richiesta reset password -->
          <form @submit.prevent="handleSubmit" v-if="!success">
            <p class="mb-4">{{ t('profile:reset_password_instructions') }}</p>
            
            <div class="mb-3">
              <label for="email" class="form-label">{{ t('email') }}</label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="email"
                required
                :placeholder="t('profile:email_placeholder')"
                :disabled="loading"
              />
            </div>
            
            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading || !email"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ t('profile:reset_password_submit') }}
              </button>
            </div>
          </form>
  
          <!-- Azioni dopo l'invio della richiesta -->
          <div v-if="success" class="mt-4">
            <p>{{ t('reset_password_check_inbox') }}</p>
            <div class="d-grid gap-2">
              <NuxtLink to="/login" class="btn btn-outline-primary">
                {{ t('profile:back_to_login') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  
  // Configurazione della pagina
  definePageMeta({
    layout: 'auth',
    middleware: ['i18n']
  });
  
  // Composables
  const { t, loadNamespace } = useI18n();
  // Carica il namespace "home" all'avvio del componente
  onMounted(async () => {
    await loadNamespace('profile');
  });
  const { resetPasswordInit, loading, error } = useAuth();
  
  // Stato locale
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const email = ref('');
  const success = ref(false);
  
  // Gestisce l'invio del form
  const handleSubmit = async () => {
    if (!email.value) return;
    
    try {
      const result = await resetPasswordInit(email.value);
      
      if (result) {
        success.value = true;
      }
    } catch (e) {
      if (isDebugMode.value) {
        console.error('[ResetPasswordInit] Error:', e);
      }
    }
  };
  
  // Inizializzazione
  onMounted(() => {
    if (isDebugMode.value) {
      console.log('[ResetPasswordInit] Page mounted');
    }
  });
  </script>
  
  <style scoped>
  .debug-panel {
    font-size: 0.9rem;
    text-align: left;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>
  
  <!-- Version: 1.0.0 -->