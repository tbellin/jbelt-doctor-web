<!-- app/pages/account/change-password.vue -->
<template>
    <div>
      <!-- Pannello debug (visibile solo in modalità debug) -->
      <div v-if="isDebugMode" class="debug-card card mb-4">
        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <span>🔍 Debug Info - Change Password Page</span>
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
            isAdmin: isAdmin,
            loading: loading,
            user: user?.login
          }, null, 2) }}</pre>
        </div>
      </div>
  
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">{{ t('change_password') }}</h4>
        </div>
        
        <div class="card-body p-4">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ t('loading') }}</span>
            </div>
            <p class="mt-2">{{ t('loading_profile') }}</p>
          </div>
  
          <div v-else-if="!isAuthenticated" class="alert alert-warning">
            <h4 class="alert-heading">{{ t('access_denied') }}</h4>
            <p>{{ t('must_login_change_password') }}</p>
            <hr>
            <div class="d-flex">
              <NuxtLink to="/login" class="btn btn-primary">
                {{ t('login') }}
              </NuxtLink>
            </div>
          </div>
  
          <div v-else>
            <p class="mb-4">{{ t('change_password_instructions') }}</p>
            
            <!-- Componente form di cambio password -->
            <ChangePasswordForm />
            
            <div class="mt-4 text-center">
              <NuxtLink to="/auth/profile" class="btn btn-outline-secondary">
                {{ t('back_to_profile') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  import ChangePasswordForm from '~/components/Auth/ChangePasswordForm.vue';
  
  // Configurazione della pagina
  definePageMeta({
    layout: 'default',
    middleware: ['auth']
  });
  
  // Hooks e composables
  const route = useRoute();
  const { isAuthenticated, isAdmin, loading, error, user } = useAuth();
  const { t } = useI18n();
  
  // Stato locale
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const isDebugExpanded = ref(false);
  
  // Controlli all'avvio del componente
  onMounted(() => {
    if (isDebugMode.value) {
      console.log('[ChangePasswordPage] Mounted', {
        route: route.fullPath,
        isAuthenticated: isAuthenticated.value,
        user: user.value?.login
      });
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