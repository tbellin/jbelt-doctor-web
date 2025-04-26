<!-- app/pages/index.vue -->
<template>
  <div>
    <div class="row mb-4">
      <div class="col-md-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h1 class="mb-3">{{ t('title')}}</h1>
            
            <div v-if="isAuthenticated" class="alert alert-success">
              <h5>{{ t('welcome_user', {name: firstName}) }}</h5>
              <p>{{ t('logged_in_as')}} <strong>{{ user?.firstName }} {{ user?.lastName }}</strong> ({{ user?.login }})</p>
              <p v-if="isAdmin" class="mb-0">{{ t('admin_privileges') }}</p>
            </div>
            
            <div v-else class="alert alert-info">
              {{ t('login_message')}}
              <NuxtLink to="/login" class="alert-link">{{ t('login') }}</NuxtLink>
            </div>
            
            <!-- Debug Panel - visibile solo con NUXT_DEBUG=true -->
            <div v-if="isDebugMode" class="alert alert-warning mt-3">
              <h5 class="mb-2">{{ t('debug_info')}}</h5>
              <div class="debug-container p-2 bg-light rounded">
                <p class="mb-1"><strong>Token JWT:</strong> {{ tokenDisplay }}</p>
                <p class="mb-1"><strong>Stato Autenticazione:</strong> {{ isAuthenticated ? 'Autenticato' : 'Non Autenticato' }}</p>
                <p class="mb-1"><strong>Ruoli Utente:</strong> {{ user?.authorities?.join(', ') || 'Nessuno' }}</p>
                <p class="mb-1"><strong>Store inizializzato:</strong> {{ authStore.isInitialized ? 'Sì' : 'No' }}</p>
                <p class="mb-0"><strong>Lingua corrente:</strong> {{ currentLanguage }}</p>
              </div>
            </div>
          <!-- Fine Debug Panel  -->
            
            <p>Dashboard di esempio costruito con Nuxt.js 4 e Bootstrap 5</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">{{ t('features')}}</h5>
          </div>
          <div class="card-body">
            <ul>
              <li>{{ t('feature_auth')}}</li>
              <li>{{ t('feature_i18n')}}</li>
              <li>{{ t('feature_admin')}}</li>
              <li>{{ t('feature_bootstrap')}}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">{{ t('get_started')}}</h5>
          </div>
          <div class="card-body">
            <p>{{ t('explore_app')}}</p>
            <div v-if="isAdmin" class="mt-3">
              <NuxtLink to="/admin/users/listUsers" class="btn btn-primary">
                {{ t('manage_users')}}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useI18n } from '~/composables/useI18n';
import { useAuthStore } from '~/stores/auth';
import { ref, onMounted, computed } from 'vue';

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
});

// Accesso ai composable e store
const { isAuthenticated, isAdmin, user } = useAuth();
const { t, currentLanguage } = useI18n();
const authStore = useAuthStore();

const firstName = user.value?.firstName;

// Controllo modalità debug
const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');

// Token per il display in modalità debug
const tokenDisplay = computed(() => {
  return authStore.getDisplayToken;
});

// Verifica autenticazione all'avvio della pagina
onMounted(async () => {
  try {
    if (!authStore.isInitialized) {
      await authStore.initAuth();
    }
    
    if (isDebugMode.value) {
      console.log('[IndexPage] Auth state after init:', {
        isAuthenticated: isAuthenticated.value,
        isAdmin: isAdmin.value,
        user: user.value?.login,
        token: tokenDisplay.value
      });
    }
  } catch (error) {
    console.error('[IndexPage] Error during authentication check:', error);
  }
});
</script>

<style scoped>
.debug-container {
  font-family: monospace;
  font-size: 0.85rem;
}
</style>

<!-- Version: 1.0.2 -->