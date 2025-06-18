<template>
  <div class="documentation-api-page">
    <div class="container-fluid py-4">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-code-slash fs-1 text-primary me-3"></i>
            <div>
              <h1 class="display-5 mb-2">{{ t('title') }}</h1>
              <p class="lead text-muted mb-0">{{ t('subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Content -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h4 mb-3">{{ t('description') }}</h2>
              <p>Questa è una pagina di documentazione API semplice.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from '~/composables/useI18n';

const { t, loadNamespace } = useI18n();
// Carica il namespace "documentation-api" all'avvio del componente
onMounted(async () => {
  await loadNamespace('documentation-api');
});

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
});
</script>

<style scoped>
.documentation-api-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}
</style>