<!-- app/components/Dashboard/DashboardFooter.vue -->
<template>
  <footer class="dashboard-footer">
    <div class="container-fluid">
      <div class="row align-items-center">
        <!-- Copyright information -->
        <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
          <span class="copyright">
            &copy; {{ currentYear }} {{ t('company_name') }}. {{ t('all_rights_reserved') }} {{ t('company_address') }}
          </span>
        </div>
        
        <!-- Server and frontend information -->
        <div class="col-md-6">
          <div class="server-info text-center text-md-end">
            <span class="badge bg-white text-primary me-2">
              <i class="bi bi-server me-1"></i> 
              {{ t('server') }}: {{ serverInfo.host }}:{{ serverInfo.port }}
            </span>
            <span class="badge bg-white text-primary">
              <i class="bi bi-laptop me-1"></i> 
              {{ t('frontend') }}: {{ frontendInfo.host }}:{{ frontendInfo.port }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

// Configurazione runtime
const config = useRuntimeConfig();

// Informazioni server e frontend
const serverInfo = computed(() => ({
  host: config.public.apiHost || 'localhost',
  port: config.public.apiPort || '8080'
}));

const frontendInfo = computed(() => {
  // Accedi alle informazioni del frontend dalle variabili d'ambiente
  // o dalle proprietà della finestra se in ambiente client
  const host = config.public.frontendHost || 
               (process.client ? window.location.hostname : 'localhost');
  const port = config.public.frontendPort || 
               (process.client ? window.location.port : '3000');
  
  return { host, port };
});

// Anno corrente per il copyright
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.dashboard-footer {
  background-color: var(--bs-primary);
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  color: #ffffff;
}

.copyright {
  font-weight: 500;
  color: #ffffff;
}

.server-info {
  font-size: 0.75rem;
}

.badge {
  font-weight: normal;
}

@media (max-width: 767.98px) {
  .dashboard-footer {
    text-align: center;
    padding: 0.75rem 0;
  }
  
  .server-info {
    margin-top: 0.5rem;
  }
  
  .server-info .badge {
    display: inline-block;
    margin-bottom: 0.25rem;
  }
}
</style>

<!-- Version: 1.0.0 -->