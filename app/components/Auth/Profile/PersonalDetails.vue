<!-- app/components/Auth/Profile/PersonalDetails.vue -->
<template>
    <div class="user-details">
      <h5 class="mb-4 border-bottom pb-2">{{ t('personal_details') }}</h5>
      
      <div class="row">
        <!-- Nome -->
        <div class="col-md-6 mb-3">
          <label for="firstName" class="form-label">{{ t('first_name') }}</label>
          <input
            type="text"
            class="form-control"
            id="firstName"
            v-model="localData.firstName"
            :disabled="!editable || loading"
            :class="{ 'is-invalid': errors.firstName }"
          />
          <div v-if="errors.firstName" class="invalid-feedback">
            {{ errors.firstName }}
          </div>
        </div>
  
        <!-- Cognome -->
        <div class="col-md-6 mb-3">
          <label for="lastName" class="form-label">{{ t('last_name') }}</label>
          <input
            type="text"
            class="form-control"
            id="lastName"
            v-model="localData.lastName"
            :disabled="!editable || loading"
            :class="{ 'is-invalid': errors.lastName }"
          />
          <div v-if="errors.lastName" class="invalid-feedback">
            {{ errors.lastName }}
          </div>
        </div>
      </div>
  
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">{{ t('email') }}</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="localData.email"
          :disabled="!editable || loading"
          :class="{ 'is-invalid': errors.email }"
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>
  
      <!-- Lingua preferita -->
      <div class="mb-4">
        <label for="langKey" class="form-label">{{ t('preferred_language') }}</label>
        <select
          class="form-select"
          id="langKey"
          v-model="localData.langKey"
          :disabled="!editable || loading"
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
        </select>
      </div>
  
      <!-- Azioni form -->
      <div v-if="showActions" class="actions mt-4 pt-3 border-top d-flex justify-content-end">
        <button 
          type="button" 
          class="btn btn-outline-secondary me-2" 
          @click="handleCancel"
          v-if="editable"
          :disabled="loading"
        >
          {{ t('cancel') }}
        </button>
        <button 
          type="submit" 
          class="btn btn-primary" 
          v-if="editable"
          :disabled="loading || !isValid"
          @click="handleSubmit"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ t('save_changes') }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue';
  import { useI18n } from '~/composables/useI18n';
  
  const props = defineProps({
    userData: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: true
    }
  });
  
  const emit = defineEmits(['update', 'submit', 'cancel']);
  
  const { t } = useI18n();
  
  // Stato locale
  const errors = reactive({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  // Dati locali con deep clone per evitare riferimenti alle props
  const initLocalData = () => {
    return {
      firstName: props.userData.firstName || '',
      lastName: props.userData.lastName || '',
      email: props.userData.email || '',
      langKey: props.userData.langKey || 'it'
    };
  };
  
  const localData = reactive(initLocalData());
  
  // Valida il form
  const validateForm = () => {
    let isValid = true;
    
    // Pulisce gli errori precedenti
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });
  
    // Validazione nome
    if (!localData.firstName?.trim()) {
      errors.firstName = t('required_field');
      isValid = false;
    }
  
    // Validazione cognome
    if (!localData.lastName?.trim()) {
      errors.lastName = t('required_field');
      isValid = false;
    }
  
    // Validazione email
    if (!localData.email?.trim()) {
      errors.email = t('required_field');
      isValid = false;
    } else if (!isValidEmail(localData.email)) {
      errors.email = t('invalid_email');
      isValid = false;
    }
  
    return isValid;
  };
  
  // Helper per validare email
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Computed per controllare se il form è valido
  const isValid = computed(() => {
    return localData.firstName?.trim() && 
           localData.lastName?.trim() && 
           localData.email?.trim() && 
           isValidEmail(localData.email);
  });
  
  // Reset ai valori originali
  const reset = () => {
    Object.assign(localData, initLocalData());
    
    // Pulisce tutti gli errori
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });
  };
  
  // Invia i dati al componente genitore
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const formData = {
      firstName: localData.firstName,
      lastName: localData.lastName,
      email: localData.email,
      langKey: localData.langKey
    };
    
    emit('submit', formData);
  };
  
  // Annulla le modifiche
  const handleCancel = () => {
    reset();
    emit('cancel');
  };
  
  // Watch per aggiornare i dati locali quando cambiano le props
  watch(() => props.userData, () => {
    reset();
  }, { deep: true });
  
  // Watch per modalità modifica - reset quando si torna in visualizzazione
  watch(() => props.editable, (newVal, oldVal) => {
    if (oldVal && !newVal) {
      // Siamo passati da edit a view
      reset();
    }
  });
  
  // Emette aggiornamenti sulle modifiche ai dati
  watch(localData, (newVal) => {
    emit('update', { ...newVal });
  }, { deep: true });
  
  // Reset iniziale
  onMounted(() => {
    reset();
  });
  
  // Espone metodi al componente genitore
  defineExpose({
    reset,
    validate: validateForm
  });
  </script>
  
  <style scoped>
  .user-details {
    position: relative;
  }
  </style>
  
  <!-- Version: 1.0.0 -->