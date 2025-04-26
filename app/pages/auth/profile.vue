<!-- app/pages/auth/profile.vue -->
<template>
  <div>
    <!-- Pannello debug (visibile solo in modalità debug) -->
    <div v-if="isDebugMode" class="debug-card card mb-4">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <span>🔍 Debug Info - Profile Page</span>
        <button @click="isDebugExpanded = !isDebugExpanded" class="btn btn-sm btn-light">
          {{ isDebugExpanded ? 'Nascondi' : 'Mostra' }}
        </button>
      </div>
      <div v-if="isDebugExpanded" class="card-body">
        <h6>Auth State:</h6>
        <pre class="bg-light p-2 rounded">{{ JSON.stringify({
          isAuthenticated: isAuthenticated,
          isAdmin: isAdmin,
          loading: loading
        }, null, 2) }}</pre>
        
        <h6 class="mt-3">User Data:</h6>
        <pre class="bg-light p-2 rounded">{{ JSON.stringify(userData, null, 2) }}</pre>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t('loading') }}</span>
          </div>
          <p class="mt-2">{{ t('loading_profile') }}</p>
        </div>

        <div v-else-if="!isAuthenticated" class="alert alert-warning">
          <h4 class="alert-heading">{{ t('access_denied') }}</h4>
          <p>{{ t('must_login') }}</p>
          <hr>
          <div class="d-flex">
            <NuxtLink to="/login" class="btn btn-primary">
              {{ t('login') }}
            </NuxtLink>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <h4 class="alert-heading">{{ t('error') }}</h4>
          <p>{{ error }}</p>
          <hr>
          <button @click="refreshUserData" class="btn btn-outline-danger">
            {{ t('retry') }}
          </button>
        </div>

        <div v-else-if="userData">
          <!-- Utilizziamo il nuovo componente modulare -->
          <ProfileComponent 
            :userData="userData" 
            @update="handleProfileUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useI18n } from '~/composables/useI18n';
import ProfileComponent from '~/components/Auth/Profile/index.vue';

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

// Composables
const { t } = useI18n();
const { isAuthenticated, isAdmin, user, loading: authLoading, error: authError } = useAuth();

// Stato locale
const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
const isDebugExpanded = ref(false);
const userData = ref(null);
const loading = ref(true);
const error = ref('');

// Carica i dati dell'utente
const refreshUserData = async () => {
  if (!isAuthenticated.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Utilizziamo i dati già disponibili dallo store
    userData.value = user.value;
    
    if (isDebugMode.value) {
      console.log('[ProfilePage] User data loaded:', userData.value);
    }
  } catch (e: any) {
    error.value = e.message || t('profile_load_error');
    
    if (isDebugMode.value) {
      console.error('[ProfilePage] Error loading profile:', e);
    }
  } finally {
    loading.value = false;
  }
};

// Gestisce l'aggiornamento del profilo
const handleProfileUpdate = (updatedData: any) => {
  if (isDebugMode.value) {
    console.log('[ProfilePage] Profile updated:', updatedData);
  }
  
  // Aggiorna i dati locali
  userData.value = { ...updatedData };
};

// Carica i dati all'avvio del componente
onMounted(async () => {
  await refreshUserData();
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

<!-- Version: 1.1.0 -->