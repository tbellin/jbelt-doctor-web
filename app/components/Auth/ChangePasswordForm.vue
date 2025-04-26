<!-- app/components/Auth/ChangePasswordForm.vue -->
<template>
    <div class="change-password-form">
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
            <li>Successo: {{ successMessage ? 'Sì' : 'No' }}</li>
          </ul>
        </div>
      </div>
  
      <!-- Alert di errore -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
  
      <!-- Alert di successo -->
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>
  
      <!-- Form di cambio password -->
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="currentPassword" class="form-label">{{ t('current_password') }}</label>
          <input
            type="password"
            class="form-control"
            id="currentPassword"
            v-model="formData.currentPassword"
            required
            :placeholder="t('current_password')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.currentPassword}"
          />
          <div class="invalid-feedback" v-if="validationErrors.currentPassword">
            {{ validationErrors.currentPassword }}
          </div>
        </div>
        
        <div class="mb-3">
          <label for="newPassword" class="form-label">{{ t('new_password') }}</label>
          <input
            type="password"
            class="form-control"
            id="newPassword"
            v-model="formData.newPassword"
            required
            :placeholder="t('new_password')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.newPassword}"
            @input="validateNewPassword"
          />
          <div class="invalid-feedback" v-if="validationErrors.newPassword">
            {{ validationErrors.newPassword }}
          </div>
          <small class="form-text text-muted">{{ t('password_requirements') }}</small>
        </div>
        
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">{{ t('confirm_password') }}</label>
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            :placeholder="t('confirm_password')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.confirmPassword}"
            @input="validateConfirmPassword"
          />
          <div class="invalid-feedback" v-if="validationErrors.confirmPassword">
            {{ validationErrors.confirmPassword }}
          </div>
        </div>
        
        <div class="d-grid gap-2">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ t('save_changes') }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  
  // Composable e store per l'autenticazione
  const { changePassword, isAuthenticated, error: authError, loading } = useAuth();
  const { t } = useI18n();
  
  // Stato locale del form
  const formData = reactive({
    currentPassword: '',
    newPassword: '',
  });
  const confirmPassword = ref('');
  const validationErrors = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const error = ref('');
  const successMessage = ref('');
  
  // Modalità debug
  const isDebugMode = ref(false);
  
  // Al montaggio del componente, controlla se siamo in modalità debug
  onMounted(() => {
    // Verifica NUXT_DEBUG nell'ambiente
    const debugEnv = process.env.NUXT_DEBUG;
    isDebugMode.value = debugEnv === 'true';
    
    // Log per verifica variabili d'ambiente
    if (isDebugMode.value) {
      console.log('[ChangePasswordForm] Debug mode enabled');
    }
  });
  
  // Validazione password
  const validateNewPassword = () => {
    validationErrors.newPassword = '';
    
    if (formData.newPassword.length < 6) {
      validationErrors.newPassword = t('password_too_short');
    }
    
    // Se la conferma password è già stata inserita, validala nuovamente
    if (confirmPassword.value) {
      validateConfirmPassword();
    }
  };
  
  // Validazione conferma password
  const validateConfirmPassword = () => {
    validationErrors.confirmPassword = '';
    
    if (formData.newPassword !== confirmPassword.value) {
      validationErrors.confirmPassword = t('passwords_not_match');
    }
  };
  
  // Computed per controllare se il form è valido
  const isFormValid = computed(() => {
    return formData.currentPassword && 
           formData.newPassword && 
           formData.newPassword.length >= 6 &&
           confirmPassword.value === formData.newPassword &&
           !validationErrors.currentPassword &&
           !validationErrors.newPassword &&
           !validationErrors.confirmPassword;
  });
  
  // Gestione invio form
  const handleSubmit = async () => {
    error.value = '';
    successMessage.value = '';
    
    // Validazione base
    if (!formData.currentPassword) {
      validationErrors.currentPassword = t('required_field');
      return;
    }
    
    if (!formData.newPassword) {
      validationErrors.newPassword = t('required_field');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      validationErrors.newPassword = t('password_too_short');
      return;
    }
    
    if (confirmPassword.value !== formData.newPassword) {
      validationErrors.confirmPassword = t('passwords_not_match');
      return;
    }
    
    if (isDebugMode.value) {
      console.log('[ChangePasswordForm] Attempting to change password');
    }
    
    try {
      const success = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (isDebugMode.value) {
        console.log('[ChangePasswordForm] Change password result:', { success, authError: authError.value });
      }
      
      if (success) {
        successMessage.value = t('password_changed_success');
        // Reset form
        formData.currentPassword = '';
        formData.newPassword = '';
        confirmPassword.value = '';
      } else {
        error.value = authError.value || t('password_change_failed');
      }
    } catch (e) {
      if (isDebugMode.value) {
        console.error('[ChangePasswordForm] Error during password change:', e);
      }
      error.value = t('error_during_password_change');
    }
  };
  </script>
  
  <style scoped>
  .change-password-form {
    max-width: 500px;
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
  
  <!-- Version: 1.0.0 -->