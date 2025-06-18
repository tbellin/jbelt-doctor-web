<!--
  Sheets Page Header - Optimized Component
  
  Enhanced features:
  - Real-time statistics display
  - Format distribution charts
  - Performance metrics
  - Advanced action buttons
  - Mobile responsive design
  
  @version 2.0.0
-->
<template>
  <div class="sheets-header">
    <!-- Main Header Row -->
    <div class="header-main mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <div class="header-title">
          <h1 class="h3 mb-0 d-flex align-items-center">
            <i class="bi bi-file-earmark-text me-2 text-primary"></i>
            {{ t('sheets:title') }}
            <span v-if="stats.total" class="badge bg-secondary ms-2">
              {{ stats.total }}
            </span>
          </h1>
          <p class="text-muted mb-0 mt-1">
            {{ t('sheets:subtitle') }}
          </p>
        </div>
        
        <div class="header-actions">
          <div class="btn-group">
            <button 
              class="btn btn-outline-secondary"
              @click="$emit('refresh')"
              :disabled="loading"
              :title="t('common:refresh')"
            >
              <i class="bi" :class="loading ? 'bi-arrow-clockwise rotating' : 'bi-arrow-clockwise'"></i>
              <span class="d-none d-sm-inline ms-1">{{ t('common:refresh') }}</span>
            </button>
            
            <button 
              class="btn btn-outline-warning"
              @click="$emit('import')"
              :disabled="loading"
              :title="t('sheets:actions.import')"
            >
              <i class="bi bi-upload"></i>
              <span class="d-none d-sm-inline ms-1">{{ t('sheets:actions.import') }}</span>
            </button>
            
            <button 
              class="btn btn-outline-info"
              @click="$emit('export')"
              :disabled="loading"
              :title="t('sheets:actions.export')"
            >
              <i class="bi bi-download"></i>
              <span class="d-none d-sm-inline ms-1">{{ t('sheets:actions.export') }}</span>
            </button>
            
            <button 
              class="btn btn-primary"
              @click="$emit('create')"
              :disabled="loading"
            >
              <i class="bi bi-plus-lg me-1"></i>
              {{ t('sheets:actions.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="row g-3">
        <!-- Total Sheets -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-primary">
                  <i class="bi bi-file-earmark-text"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('sheets:stats.total') }}</div>
                  <div class="stat-value">{{ stats.total || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtered Count -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-info">
                  <i class="bi bi-funnel"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('sheets:stats.filtered') }}</div>
                  <div class="stat-value">{{ stats.filtered || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- With Drawing -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-success">
                  <i class="bi bi-image"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('sheets:stats.withDrawing') }}</div>
                  <div class="stat-value">{{ stats.withDrawing || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Count -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card" :class="{ 'selected': stats.selected > 0 }">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-warning">
                  <i class="bi bi-check-square"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('sheets:stats.selected') }}</div>
                  <div class="stat-value">{{ stats.selected || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Format Distribution -->
      <div class="row g-3 mt-2" v-if="stats.byFormat && Object.keys(stats.byFormat).length">
        <div class="col-12">
          <div class="stat-card">
            <div class="stat-card-body">
              <h6 class="mb-3">
                <i class="bi bi-bar-chart me-2"></i>
                {{ t('sheets:stats.formatDistribution') }}
              </h6>
              <div class="format-distribution">
                <div 
                  v-for="(count, format) in stats.byFormat" 
                  :key="format"
                  class="format-item"
                >
                  <div class="format-info">
                    <span class="format-label">{{ format }}</span>
                    <span class="format-count badge bg-secondary">{{ count }}</span>
                  </div>
                  <div class="format-bar">
                    <div 
                      class="format-progress"
                      :style="{ 
                        width: `${(count / stats.total) * 100}%`,
                        backgroundColor: getFormatColor(format)
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Models Association Stats -->
      <div class="row g-3 mt-2">
        <div class="col-md-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-info">
                  <i class="bi bi-diagram-3"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('sheets:stats.totalModels') }}</div>
                  <div class="stat-value">{{ stats.totalModelsAssociated || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Info (Debug) -->
        <div class="col-md-6" v-if="isDebugMode && performanceInfo">
          <div class="stat-card debug">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-dark">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Performance</div>
                  <div class="stat-value small">
                    {{ performanceInfo.renderTime }}ms | 
                    {{ performanceInfo.cacheHits }} cache hits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions (Mobile Optimized) -->
    <div class="quick-actions mt-3 d-md-none">
      <div class="btn-group w-100" role="group">
        <button 
          class="btn btn-outline-primary"
          @click="$emit('refresh')"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button 
          class="btn btn-outline-warning"
          @click="$emit('import')"
          :disabled="loading"
        >
          <i class="bi bi-upload"></i>
        </button>
        <button 
          class="btn btn-outline-info"
          @click="$emit('export')"
          :disabled="loading"
        >
          <i class="bi bi-download"></i>
        </button>
        <button 
          class="btn btn-primary flex-grow-1"
          @click="$emit('create')"
          :disabled="loading"
        >
          <i class="bi bi-plus-lg me-1"></i>
          {{ t('sheets:actions.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useDebug } from '~/composables/useDebug'

// Props
interface Props {
  loading?: boolean
  stats?: {
    total: number
    filtered: number
    selected: number
    withDrawing: number
    withoutDrawing: number
    byFormat: Record<string, number>
    totalModelsAssociated: number
  }
  performanceInfo?: {
    renderTime: number
    cacheHits: number
    lastUpdate: Date
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stats: () => ({
    total: 0,
    filtered: 0,
    selected: 0,
    withDrawing: 0,
    withoutDrawing: 0,
    byFormat: {},
    totalModelsAssociated: 0
  })
})

// Emits
defineEmits<{
  refresh: []
  create: []
  import: []
  export: []
}>()

// Composables
const { t } = useI18n()
const { isDebugMode } = useDebug()

// Methods
const getFormatColor = (format: string): string => {
  const colors: Record<string, string> = {
    'A0': '#6f42c1',
    'A1': '#0d6efd',
    'A2': '#20c997',
    'A3V': '#fd7e14',
    'A3O': '#ffc107',
    'A4V': '#dc3545',
    'A4O': '#198754'
  }
  return colors[format] || '#6c757d'
}
</script>

<style scoped>
.sheets-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #dee2e6;
}

.header-main {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.header-title h1 {
  color: #495057;
  font-weight: 600;
}

.header-actions .btn-group {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.stats-section {
  margin-top: 1rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: all 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.stat-card.selected {
  border-color: #0d6efd;
  background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
}

.stat-card.debug {
  border-color: #6c757d;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.stat-card-body {
  padding: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  font-size: 1.25rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.stat-card.debug .stat-value {
  font-size: 0.875rem;
  font-weight: 500;
  font-family: monospace;
}

.format-distribution {
  max-height: 200px;
  overflow-y: auto;
}

.format-item {
  margin-bottom: 0.75rem;
}

.format-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.format-label {
  font-weight: 500;
  color: #495057;
}

.format-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.format-progress {
  height: 100%;
  transition: width 0.3s ease;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sheets-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .header-main .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions .btn-group {
    width: 100%;
  }
  
  .stat-card-body {
    padding: 0.75rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
    margin-right: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .format-distribution {
    max-height: 150px;
  }
}

@media (max-width: 576px) {
  .stats-section .row {
    margin: 0 -0.5rem;
  }
  
  .stats-section .col-sm-6 {
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .format-item {
    margin-bottom: 0.5rem;
  }
}
</style>