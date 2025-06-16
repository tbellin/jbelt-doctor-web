<!-- app/pages/account/reset-password/finish.vue -->
<template>
    <div>
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">{{ t('password:reset_password_complete') }}</h4>
        </div>
        <div class="card-body p-4">
          <!-- Debug panel (visibile solo in modalità debug) -->
          <div v-if="isDebugMode" class="debug-panel mb-4 p-3 border rounded bg-light">
            <h5 class="mb-3">📊 Debug Info</h5>
            <div class="mb-2">
              <strong>Stato corrente:</strong>
              <ul class="mb-0 ps-3">
                <li>Key: {{ key }}</li>
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
            {{ t('password:reset_password_success') }}
          </div>
  
          <!-- Form per impostare la nuova password -->
          <form @submit.prevent="handleSubmit" v-if="!success && key">
            <p class="mb-4">{{ t('password:reset_password_finish_instructions') }}</p>
            
            <div class="mb-3">
              <label for="newPassword" class="form-label">{{ t('password:new_password') }}</label>
              <input
                type="password"
                class="form-control"
                id="newPassword"
                v-model="newPassword"
                required
                :placeholder="t('password:new_password_placeholder')"
                :disabled="loading"
                :class="{ 'is-invalid': passwordError }"
                @input="validatePassword"
              />
              <div v-if="passwordError" class="invalid-feedback">
                {{ passwordError }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">{{ t('password:confirm_password') }}</label>
              <input
                type="password"
                class="form-control"
                id="confirmPassword"
                v-model="confirmPassword"
                required
                :placeholder="t('password:confirm_password_placeholder')"
                :disabled="loading"
                :class="{ 'is-invalid': confirmPasswordError }"
                @input="validateConfirmPassword"
              />
              <div v-if="confirmPasswordError" class="invalid-feedback">
                {{ confirmPasswordError }}
              </div>
            </div>
            
            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ t('password:save_new_password') }}
              </button>
            </div>
          </form>
  
          <!-- Messaggio se il key non è valido -->
          <div v-if="!key" class="alert alert-warning">
            {{ t('password:reset_key_invalid') }}
          </div>
  
          <!-- Azioni dopo il reset completo -->
          <div v-if="success" class="mt-4">
            <p>{{ t('password:reset_password_complete_message') }}</p>
            <div class="d-grid gap-2">
              <NuxtLink to="/login" class="btn btn-outline-primary">
                {{ t('password:go_to_login') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  
  // Configurazione della pagina
  definePageMeta({
    layout: 'auth',
    middleware: ['i18n']
  });
  
  // Composables
  const route = useRoute();
  const { t, loadNamespace } = useI18n();
  const { resetPasswordFinish, loading, error } = useAuth();
  
  // Stato locale
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const key = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const success = ref(false);
  const passwordError = ref('');
  const confirmPasswordError = ref('');
  
  // Computed
  const isFormValid = computed(() => {
    return (
      newPassword.value && 
      confirmPassword.value && 
      !passwordError.value && 
      !confirmPasswordError.value
    );
  });
  
  // Validazione password
  const validatePassword = () => {
    passwordError.value = '';
    
    if (newPassword.value.length < 6) {
      passwordError.value = t('password:password_too_short');
    }
    
    if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
      confirmPasswordError.value = t('password:passwords_not_match');
    } else {
      confirmPasswordError.value = '';
    }
  };
  
  // Validazione conferma password
  const validateConfirmPassword = () => {
    confirmPasswordError.value = '';
    
    if (newPassword.value !== confirmPassword.value) {
      confirmPasswordError.value = t('password:passwords_not_match');
    }
  };
  
  // Gestisce l'invio del form
  const handleSubmit = async () => {
    if (!key.value || !newPassword.value || !confirmPassword.value) return;
    
    validatePassword();
    validateConfirmPassword();
    
    if (!isFormValid.value) return;
    
    try {
      const result = await resetPasswordFinish(key.value, newPassword.value);
      
      if (result) {
        success.value = true;
      }
    } catch (e) {
      if (isDebugMode.value) {
        console.error('[ResetPasswordFinish] Error:', e);
      }
    }
  };
  
  // Inizializzazione
  onMounted(async () => {
    // Carica le traduzioni del namespace password
    await loadNamespace('password');
    
    // Recupera il key dalla query string
    key.value = route.query.key as string || '';
    
    if (isDebugMode.value) {
      console.log('[ResetPasswordFinish] Page mounted, key:', key.value);
    }
    
    if (!key.value) {
      console.warn('[ResetPasswordFinish] No key found in URL');
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