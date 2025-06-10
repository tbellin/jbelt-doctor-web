<!--
  Componente header della pagina modelli con titolo e azioni
  @version 1.0.0
-->
<template>
  <div class="row mb-4">
    <div class="col-12">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="h3 mb-0">
          <i class="bi bi-box-seam me-2"></i>
          {{ t('models:title') }}
        </h1>
        <div class="btn-group" role="group">
          <button 
            class="btn btn-outline-secondary"
            @click="$emit('refresh')"
            :disabled="loading"
            :title="t('models:actions.refresh')"
          >
            <i class="bi bi-arrow-clockwise me-2" :class="{ 'spin-animation': loading }"></i>
            {{ t('models:actions.refresh') }}
          </button>
          <button 
            class="btn btn-primary"
            @click="$emit('create')"
            :disabled="loading"
          >
            <i class="bi bi-plus-lg me-2"></i>
            {{ t('models:actions.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  loading?: boolean
}

defineProps<Props>()

defineEmits<{
  'refresh': []
  'create': []
}>()
</script>

<style scoped>
/* Animazione per l'icona di refresh */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}
</style>