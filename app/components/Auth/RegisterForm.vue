<!-- app/components/Auth/RegisterForm.vue -->
<template>
    <div class="register-form">
      <!-- Debug panel (visibile solo in modalità debug) -->
      <div v-if="isDebugMode" class="debug-panel mb-4 p-3 border rounded bg-light">
        <h5 class="mb-3">📊 Diagnostica</h5>
        <div class="mb-2">
          <strong>Stato corrente:</strong>
          <ul class="mb-0 ps-3">
            <li>Debug: {{ isDebugMode ? 'Attivo' : 'Disattivato' }}</li>
            <li>Loading: {{ loading }}</li>
            <li>Errore: {{ error || 'Nessuno' }}</li>
          </ul>
        </div>
        <div class="mb-2">
          <strong>Input:</strong>
          <ul class="mb-0 ps-3">
            <li>Username: "{{ formData.login }}"</li>
            <li>Password: "{{ formData.password ? '***' : '' }}"</li>
            <li>E-mail: "{{ formData.email }}"</li>
          </ul>
        </div>
        <div class="mt-2">
          <button type="button" class="btn btn-sm btn-warning" @click="resetForm">Reset</button>
        </div>
      </div>
  
      <!-- Alert di errore -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
  
      <!-- Alert di successo -->
      <div v-if="successMessage" class="alert alert-success" role="alert">
        <i class="bi bi-check-circle me-2"></i> {{ successMessage }}
      </div>
  
      <!-- Form di Registrazione -->
      <form @submit.prevent="handleRegister" v-if="!isSubmitted">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="firstName" class="form-label">{{ t('first_name') }} *</label>
            <input
              type="text"
              class="form-control"
              id="firstName"
              v-model="formData.firstName"
              required
              :placeholder="t('first_name')"
              :disabled="loading"
              :class="{'is-invalid': validationErrors.firstName}"
            />
            <div class="invalid-feedback" v-if="validationErrors.firstName">
              {{ validationErrors.firstName }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label for="lastName" class="form-label">{{ t('last_name') }} *</label>
            <input
              type="text"
              class="form-control"
              id="lastName"
              v-model="formData.lastName"
              required
              :placeholder="t('last_name')"
              :disabled="loading"
              :class="{'is-invalid': validationErrors.lastName}"
            />
            <div class="invalid-feedback" v-if="validationErrors.lastName">
              {{ validationErrors.lastName }}
            </div>
          </div>
        </div>
  
        <div class="mb-3">
          <label for="login" class="form-label">{{ t('username') }} *</label>
          <input
            type="text"
            class="form-control"
            id="login"
            v-model="formData.login"
            required
            autocomplete="username"
            :placeholder="t('username')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.login}"
          />
          <div class="invalid-feedback" v-if="validationErrors.login">
            {{ validationErrors.login }}
          </div>
          <small class="form-text text-muted">{{ t('username_requirements') }}</small>
        </div>
  
        <div class="mb-3">
          <label for="email" class="form-label">{{ t('email') }} *</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="formData.email"
            required
            autocomplete="email"
            :placeholder="t('email')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.email}"
          />
          <div class="invalid-feedback" v-if="validationErrors.email">
            {{ validationErrors.email }}
          </div>
        </div>
  
        <div class="mb-3">
          <label for="password" class="form-label">{{ t('password') }} *</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="formData.password"
            required
            autocomplete="new-password"
            :placeholder="t('password')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.password}"
          />
          <div class="invalid-feedback" v-if="validationErrors.password">
            {{ validationErrors.password }}
          </div>
          <small class="form-text text-muted">{{ t('password_requirements') }}</small>
        </div>
  
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">{{ t('confirm_password') }} *</label>
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            autocomplete="new-password"
            :placeholder="t('confirm_password')"
            :disabled="loading"
            :class="{'is-invalid': validationErrors.confirmPassword}"
          />
          <div class="invalid-feedback" v-if="validationErrors.confirmPassword">
            {{ validationErrors.confirmPassword }}
          </div>
        </div>
  
        <div class="mb-3">
          <label for="langKey" class="form-label">{{ t('preferred_language') }}</label>
          <select class="form-select" id="langKey" v-model="formData.langKey" :disabled="loading">
            <option value="en">English</option>
            <option value="it">Italiano</option>
          </select>
        </div>
  
        <div class="mb-3 form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="termsAccepted" 
            v-model="termsAccepted"
            required
            :disabled="loading"
            :class="{'is-invalid': validationErrors.termsAccepted}"
          />
          <label class="form-check-label" for="termsAccepted">
            {{ t('accept_terms') }}
          </label>
          <div class="invalid-feedback" v-if="validationErrors.termsAccepted">
            {{ validationErrors.termsAccepted }}
          </div>
        </div>
  
        <div class="d-grid gap-2">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ t('register') }}
          </button>
        </div>
        <div class="mt-3 text-center">
          <NuxtLink to="/login">{{ t('already_registered') }}</NuxtLink>
        </div>
      </form>
  
      <!-- Messaggio dopo invio form -->
      <div v-if="isSubmitted" class="text-center p-4">
        <div class="mb-4">
          <i class="bi bi-envelope-check text-success" style="font-size: 3rem;"></i>
        </div>
        <h3 class="mb-3">{{ t('registration_submitted') }}</h3>
        <p>{{ t('registration_email_sent') }}</p>
        <p>{{ t('check_email', { email: formData.email }) }}</p>
        <div class="mt-4">
          <NuxtLink to="/login" class="btn btn-outline-primary">
            {{ t('back_to_login') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  
  // Composable e store per l'autenticazione
  const { register, error: authError, loading } = useAuth();
  const { t, currentLanguage } = useI18n();
  
  // Stato locale del form
  const formData = reactive({
    id: 0,
    login: '',
    firstName: '',
    lastName: '',
    email: '',
    imageUrl: '',
    activated: false, // Sarà attivato tramite email
    langKey: currentLanguage.value,
    authorities: ['ROLE_USER'],
    password: '',
    createdBy: 'system',
    createdDate: new Date().toISOString(),
    lastModifiedBy: 'system',
    lastModifiedDate: new Date().toISOString()
  });
  
  const confirmPassword = ref('');
  const termsAccepted = ref(false);
  const validationErrors = reactive({
    firstName: '',
    lastName: '',
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: ''
  });
  
  const error = ref('');
  const successMessage = ref('');
  const isSubmitted = ref(false);
  
  // Modalità debug
  const isDebugMode = ref(false);
  
  // Al montaggio del componente, controlla se siamo in modalità debug
  onMounted(() => {
    // Verifica NUXT_DEBUG nell'ambiente
    const debugEnv = process.env.NUXT_DEBUG;
    isDebugMode.value = debugEnv === 'true';
    
    // Imposta la lingua corrente
    formData.langKey = currentLanguage.value;
    
    // Log per verifica variabili d'ambiente
    if (isDebugMode.value) {
      console.log('[RegisterForm] Debug mode enabled');
      console.log('[RegisterForm] Environment variables:', {
        NUXT_DEBUG: process.env.NUXT_DEBUG,
        NODE_ENV: process.env.NODE_ENV,
        API_BASE: process.env.NUXT_PUBLIC_API_BASE
      });
    }
  });
  
  // Validazione form
  const validateForm = () => {
    let isValid = true;
    
    // Reset validation errors
    Object.keys(validationErrors).forEach(key => {
      validationErrors[key] = '';
    });
    
    // Validate firstName
    if (!formData.firstName.trim()) {
      validationErrors.firstName = t('required_field');
      isValid = false;
    }
    
    // Validate lastName
    if (!formData.lastName.trim()) {
      validationErrors.lastName = t('required_field');
      isValid = false;
    }
    
    // Validate login
    if (!formData.login.trim()) {
      validationErrors.login = t('required_field');
      isValid = false;
    } else if (formData.login.length < 3) {
      validationErrors.login = t('username_too_short');
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      validationErrors.email = t('required_field');
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      validationErrors.email = t('invalid_email');
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      validationErrors.password = t('required_field');
      isValid = false;
    } else if (formData.password.length < 6) {
      validationErrors.password = t('password_too_short');
      isValid = false;
    }
    
    // Validate confirmPassword
    if (!confirmPassword.value) {
      validationErrors.confirmPassword = t('required_field');
      isValid = false;
    } else if (confirmPassword.value !== formData.password) {
      validationErrors.confirmPassword = t('passwords_do_not_match');
      isValid = false;
    }
    
    // Validate termsAccepted
    if (!termsAccepted.value) {
      validationErrors.termsAccepted = t('must_accept_terms');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Helper per validare email
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Computed per controllare se il form è valido
  const isFormValid = computed(() => {
    return formData.firstName.trim() &&
           formData.lastName.trim() &&
           formData.login.trim() &&
           formData.email.trim() && 
           isValidEmail(formData.email) &&
           formData.password.length >= 6 &&
           confirmPassword.value === formData.password &&
           termsAccepted.value;
  });
  
  // Gestione registrazione
  const handleRegister = async () => {
    error.value = '';
    successMessage.value = '';
    
    // Validazione form
    if (!validateForm()) {
      return;
    }
    
    if (isDebugMode.value) {
      console.log('[RegisterForm] Tentativo di registrazione con:', { 
        login: formData.login, 
        email: formData.email 
      });
    }
    
    try {
      const success = await register(formData);
      
      if (isDebugMode.value) {
        console.log('[RegisterForm] Risultato registrazione:', { success, authError: authError.value });
      }
      
      if (success) {
        isSubmitted.value = true;
        successMessage.value = t('registration_success');
      } else {
        error.value = authError.value || t('registration_failed');
      }
    } catch (e) {
      if (isDebugMode.value) {
        console.error('[RegisterForm] Errore durante registrazione:', e);
      }
      error.value = t('error_during_registration');
    }
  };
  
  // Reset form
  const resetForm = () => {
    Object.keys(formData).forEach(key => {
      if (key === 'activated') formData[key] = false;
      else if (key === 'authorities') formData[key] = ['ROLE_USER'];
      else if (key === 'langKey') formData[key] = currentLanguage.value;
      else if (key === 'id') formData[key] = 0;
      else if (key === 'createdDate' || key === 'lastModifiedDate') formData[key] = new Date().toISOString();
      else if (key === 'createdBy' || key === 'lastModifiedBy') formData[key] = 'system';
      else if (typeof formData[key] === 'string') formData[key] = '';
    });
    
    confirmPassword.value = '';
    termsAccepted.value = false;
    isSubmitted.value = false;
    error.value = '';
    successMessage.value = '';
    
    // Reset validation errors
    Object.keys(validationErrors).forEach(key => {
      validationErrors[key] = '';
    });
  };
  </script>
  
  <style scoped>
  .register-form {
    max-width: 600px;
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