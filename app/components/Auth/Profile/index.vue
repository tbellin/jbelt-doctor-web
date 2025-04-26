<!-- app/components/Auth/Profile/index.vue -->
<template>
    <div class="profile-form card">
      <!-- Debug panel (visibile solo in modalità debug) -->
      <div v-if="isDebugMode" class="debug-panel mb-4 p-3 border rounded bg-light">
        <h5 class="mb-3">📊 Diagnostica</h5>
        <div class="mb-2">
          <strong>Stato corrente:</strong>
          <ul class="mb-0 ps-3">
            <li>Debug: {{ isDebugMode ? 'Attivo' : 'Disattivato' }}</li>
            <li>Loading: {{ loading }}</li>
            <li>Errore: {{ error || 'Nessuno' }}</li>
            <li>Modalità: {{ editMode ? 'Modifica' : 'Visualizzazione' }}</li>
          </ul>
        </div>
      </div>
  
      <!-- Alert di errore o successo -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>
  
      <!-- Header con toggle per la modalità edit -->
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h3 class="mb-0">{{ t('user_profile') }}</h3>
        <div class="form-check form-switch">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="editModeSwitch" 
            v-model="editMode"
            :disabled="loading"
          >
          <label class="form-check-label text-white" for="editModeSwitch">
            {{ editMode ? t('edit_mode') : t('view_mode') }}
          </label>
        </div>
      </div>
  
      <!-- Contenuto del profilo -->
      <div class="card-body p-4">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <!-- Colonna immagine e info account (sinistra) -->
            <div class="col-md-4 mb-4 mb-md-0 text-center">
              <!-- Componente per upload immagine -->
              <ImageUploader
                ref="imageUploader"
                v-model:imageUrl="formData.imageUrl"
                :editable="editMode"
                :loading="loading"
                @imageChanged="handleImageChange"
              />
              
              <!-- Componente per info account -->
              <AccountInfo :userData="userData" />
            </div>
            
            <!-- Colonna dati personali (destra) -->
            <div class="col-md-8">
              <!-- Componente per dettagli personali -->
              <PersonalDetails
                ref="personalDetails"
                :userData="userData"
                :editable="editMode"
                :loading="loading"
                :showActions="false"
                @update="handlePersonalDetailsUpdate"
              />
              
              <!-- Sezione pulsanti azioni (centralizzati) -->
              <div class="actions mt-4 pt-3 border-top d-flex justify-content-end">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary me-2" 
                  @click="resetForm"
                  v-if="editMode"
                  :disabled="loading"
                >
                  {{ t('cancel') }}
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  v-if="editMode"
                  :disabled="loading || !isFormValid"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ t('save_changes') }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  import axios from 'axios';
  
  // Importa i componenti modulari
  import ImageUploader from './ImageUploader.vue';
  import AccountInfo from './AccountInfo.vue';
  import PersonalDetails from './PersonalDetails.vue';
  
  // Props e Emits
  const props = defineProps({
    userData: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['update', 'cancel']);
  
  // Composables
  const { t } = useI18n();
  const { loading: authLoading, error: authError } = useAuth();
  
  // Riferimenti ai componenti figli
  const imageUploader = ref(null);
  const personalDetails = ref(null);
  
  // Stato locale
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const editMode = ref(false);
  const loading = ref(false);
  const error = ref('');
  const successMessage = ref('');
  
  // Dati del form con copia profonda per evitare mutazioni dirette
  const formData = reactive({
    id: props.userData?.id || 0,
    login: props.userData?.login || '',
    firstName: props.userData?.firstName || '',
    lastName: props.userData?.lastName || '',
    email: props.userData?.email || '',
    imageUrl: props.userData?.imageUrl || '',
    langKey: props.userData?.langKey || 'it',
    authorities: [...(props.userData?.authorities || [])],
    activated: props.userData?.activated !== undefined ? props.userData.activated : true,
    createdBy: props.userData?.createdBy || '',
    createdDate: props.userData?.createdDate || null
  });
  
  // Computed per verificare se il form è valido
  const isFormValid = computed(() => {
    const isPersonalDetailsValid = 
      formData.firstName?.trim() && 
      formData.lastName?.trim() && 
      formData.email?.trim() && 
      isValidEmail(formData.email);
    
    return isPersonalDetailsValid;
  });
  
  // Helper per validare email
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Gestisce gli aggiornamenti dai dettagli personali
  const handlePersonalDetailsUpdate = (data) => {
    Object.assign(formData, data);
  };
  
  // Gestisce gli aggiornamenti all'immagine
  const handleImageChange = (data) => {
    if (data.error) {
      error.value = t(data.error);
    }
  };
  
  // Resetta il form con i dati originali
  const resetForm = () => {
    // Reset del componente di upload immagine
    if (imageUploader.value) {
      imageUploader.value.reset();
    }
    
    // Reset del componente dettagli personali
    if (personalDetails.value) {
      personalDetails.value.reset();
    }
    
    // Reset stato form principale
    Object.assign(formData, {
      id: props.userData?.id || 0,
      login: props.userData?.login || '',
      firstName: props.userData?.firstName || '',
      lastName: props.userData?.lastName || '',
      email: props.userData?.email || '',
      imageUrl: props.userData?.imageUrl || '',
      langKey: props.userData?.langKey || 'it',
      authorities: [...(props.userData?.authorities || [])],
      activated: props.userData?.activated !== undefined ? props.userData.activated : true,
      createdBy: props.userData?.createdBy || '',
      createdDate: props.userData?.createdDate || null
    });
    
    // Reset stato UI
    editMode.value = false;
    error.value = '';
    successMessage.value = '';
  };
  
  // Gestisce l'invio del form
  const handleSubmit = async () => {
    if (!editMode.value) return;
    
    // Valida il form nei componenti figli
    if (personalDetails.value && !personalDetails.value.validate()) {
      return;
    }
  
    loading.value = true;
    error.value = '';
    successMessage.value = '';
  
    try {
      if (isDebugMode.value) {
        console.log('[ProfileForm] Saving profile data:', formData);
      }
  
      const config = useRuntimeConfig();
      const token = localStorage.getItem('auth_token');
      
      // Costruzione del payload completo secondo il formato richiesto dall'API
      const currentDate = new Date().toISOString();
      const payload = {
        id: formData.id,
        login: formData.login,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        imageUrl: formData.imageUrl || '',
        activated: formData.activated,
        langKey: formData.langKey,
        createdBy: formData.createdBy || formData.login,
        createdDate: formData.createdDate || currentDate,
        lastModifiedBy: formData.login,
        lastModifiedDate: currentDate,
        authorities: formData.authorities
      };
      
      await axios.post(`${config.public.apiBase}/api/account`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      successMessage.value = t('profile_updated');
      emit('update', { ...formData });
      
      // Resta in modalità visualizzazione dopo il salvataggio
      editMode.value = false;
    } catch (e) {
      error.value = e.response?.data?.detail || t('profile_update_error');
      
      if (isDebugMode.value) {
        console.error('[ProfileForm] Error updating profile:', e);
      }
    } finally {
      loading.value = false;
    }
  };
  
  // Watch per cambiamenti delle props utente
  watch(() => props.userData, () => {
    resetForm();
  }, { deep: true });
  
  // Watch per modalità modifica - gestisce pulitamente gli stati
  watch(editMode, (newVal, oldVal) => {
    if (oldVal && !newVal) {
      // Stiamo passando da edit a view - reset dello stato
      resetForm();
    }
  });
  
  // Inizializzazione
  onMounted(() => {
    resetForm();
  });
  </script>
  
  <style scoped>
  .profile-form {
    box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15);
    border-radius: .5rem;
    overflow: hidden;
  }
  
  .debug-panel {
    font-size: 0.9rem;
    text-align: left;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
  </style>
  
  <!-- Version: 1.0.0 -->