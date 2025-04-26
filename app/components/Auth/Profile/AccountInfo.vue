<!-- app/components/Auth/Profile/AccountInfo.vue -->
<template>
    <div class="account-info border rounded p-3 bg-light mt-3">
      <h6 class="mb-3">{{ t('account_info') }}</h6>
      
      <div class="mb-2">
        <strong>{{ t('username') }}:</strong> {{ userData.login }}
      </div>
      
      <div class="mb-2">
        <strong>{{ t('roles') }}:</strong><br>
        <span 
          v-for="authority in userData.authorities" 
          :key="authority"
          class="badge bg-primary me-2 mb-2"
        >
          {{ formatRole(authority) }}
        </span>
      </div>
      
      <div class="mb-0">
        <strong>{{ t('account_status') }}:</strong>
        <span 
          class="badge" 
          :class="userData.activated ? 'bg-success' : 'bg-danger'"
        >
          {{ userData.activated ? t('active') : t('inactive') }}
        </span>
      </div>
      
      <div v-if="userData.createdDate" class="mt-3 pt-2 border-top small">
        <div class="text-muted">
          {{ t('created_by') }}: {{ userData.createdBy || 'System' }}
          <br>
          {{ t('created_date') }}: {{ formatDate(userData.createdDate) }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useI18n } from '~/composables/useI18n';
  
  const props = defineProps({
    userData: {
      type: Object,
      required: true,
      default: () => ({
        login: '',
        authorities: [],
        activated: true,
        createdBy: '',
        createdDate: null
      })
    }
  });
  
  const { t } = useI18n();
  
  // Formatta il ruolo per la visualizzazione
  const formatRole = (role) => {
    return role.replace('ROLE_', '');
  };
  
  // Formatta la data in formato leggibile
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(document.documentElement.lang || 'it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  </script>
  
  <style scoped>
  .account-info {
    text-align: left;
  }
  
  .badge {
    font-weight: 500;
  }
  </style>
  
  <!-- Version: 1.0.0 -->