<!--
  Componente per le cards delle statistiche dei modelli
  @version 1.0.0
-->
<template>
  <div class="stats-section mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="stats-title mb-0">
        <i class="bi bi-graph-up me-2"></i>
        {{ t('models:stats.title') }}
      </h6>
      <button 
        class="btn btn-sm btn-outline-secondary"
        @click="toggleStatsCollapse"
        :title="isStatsCollapsed ? t('models:stats.expandStats') : t('models:stats.collapseStats')"
      >
        <i class="bi" :class="isStatsCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
      </button>
    </div>
    
    <div class="row collapse-content" v-show="!isStatsCollapsed">
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.total') }}</h6>
              <h3 class="card-title mb-0">
                {{ totalCount !== null ? totalCount : '-' }}
              </h3>
            </div>
            <div class="text-primary">
              <i class="bi bi-box-seam fs-1"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.parts') }}</h6>
              <h3 class="card-title mb-0">
                {{ getTypeCount('PART') }}
              </h3>
            </div>
            <div class="text-success">
              <i class="bi bi-gear fs-1"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.assemblies') }}</h6>
              <h3 class="card-title mb-0">
                {{ getTypeCount('ASSEMBLY') }}
              </h3>
            </div>
            <div class="text-info">
              <i class="bi bi-diagram-3 fs-1"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.drawings') }}</h6>
              <h3 class="card-title mb-0">
                {{ getTypeCount('DRAWING') }}
              </h3>
            </div>
            <div class="text-warning">
              <i class="bi bi-file-earmark-text fs-1"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  models: Model[]
  totalCount?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  totalCount: null
})

const getTypeCount = (type: string): number => {
  return props.models.filter((model: Model) => model.modelType === type).length
}

// Stato del collapse delle statistiche
const isStatsCollapsed = ref(false)

// Metodo per toggle del collapse delle statistiche
const toggleStatsCollapse = () => {
  isStatsCollapsed.value = !isStatsCollapsed.value
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

/* Stili per la sezione statistiche */
.stats-section {
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.stats-title {
  color: #495057;
  font-weight: 600;
}

/* Animazione per il collapse delle statistiche */
.collapse-content {
  transition: all 0.3s ease-in-out;
}

/* Stile per il pulsante di collapse */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn i {
  transition: transform 0.2s ease;
}

@media (max-width: 768px) {
  .stats-section .d-flex {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.5rem;
  }
  
  .stats-section .btn {
    align-self: center;
  }
}
</style>