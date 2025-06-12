<!--
  Componente per le cards delle statistiche degli sheet
  @version 1.0.0
-->
<template>
  <div class="stats-section mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="stats-title mb-0">
        <i class="bi bi-graph-up me-2"></i>
        {{ t('sheets:stats.title') }}
      </h6>
      <button 
        class="btn btn-sm btn-outline-secondary"
        @click="toggleStatsCollapse"
        :title="isStatsCollapsed ? t('sheets:stats.expandStats') : t('sheets:stats.collapseStats')"
      >
        <i class="bi" :class="isStatsCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
        {{ isStatsCollapsed ? t('sheets:table.show') : t('sheets:table.hide') }}
      </button>
    </div>
    
    <div class="row collapse-content" v-show="!isStatsCollapsed">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-2 text-muted">{{ t('sheets:stats.total') }}</h6>
                <h3 class="card-title mb-0">
                  {{ totalCount !== null ? totalCount : '-' }}
                </h3>
              </div>
              <div class="text-primary">
                <i class="bi bi-file-earmark-text fs-1"></i>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('sheets:stats.withDrawing') }}</h6>
                <h3 class="card-title mb-0">
                  {{ getSheetsWithDrawing() }}
                </h3>
              </div>
              <div class="text-success">
                <i class="bi bi-link-45deg fs-1"></i>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('sheets:stats.withoutDrawing') }}</h6>
                <h3 class="card-title mb-0">
                  {{ getSheetsWithoutDrawing() }}
                </h3>
              </div>
              <div class="text-warning">
                <i class="bi bi-unlink fs-1"></i>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('sheets:stats.formats') }}</h6>
                <h3 class="card-title mb-0">
                  {{ getUniqueFormats() }}
                </h3>
              </div>
              <div class="text-info">
                <i class="bi bi-rulers fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sheet } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  sheets: Sheet[]
  totalCount?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  totalCount: null
})

const getSheetsWithDrawing = (): number => {
  return props.sheets.filter((sheet: Sheet) => sheet.drawing).length
}

const getSheetsWithoutDrawing = (): number => {
  return props.sheets.filter((sheet: Sheet) => !sheet.drawing).length
}

const getUniqueFormats = (): number => {
  const formats = new Set(props.sheets.map((sheet: Sheet) => sheet.formatType))
  return formats.size
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