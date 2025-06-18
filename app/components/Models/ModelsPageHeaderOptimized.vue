<!--
  Models Page Header - Optimized Version
  
  Enhanced features:
  - Real-time statistics display
  - Advanced action buttons
  - Performance metrics (debug)
  - Improved responsive design
  
  @version 2.0.0
-->
<template>
  <div class="models-header">
    <!-- Main Header Row -->
    <div class="header-main mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <div class="header-title">
          <h1 class="h3 mb-0 d-flex align-items-center">
            <i class="bi bi-box-seam me-2 text-primary"></i>
            {{ t('models:title') }}
            <span v-if="stats.total" class="badge bg-secondary ms-2">
              {{ stats.total }}
            </span>
          </h1>
          <p class="text-muted mb-0 mt-1">
            {{ t('models:subtitle') }}
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
              class="btn btn-outline-info"
              @click="$emit('export')"
              :disabled="loading"
              :title="t('models:actions.export')"
            >
              <i class="bi bi-download"></i>
              <span class="d-none d-sm-inline ms-1">{{ t('models:actions.export') }}</span>
            </button>
            
            <button 
              class="btn btn-primary"
              @click="$emit('create')"
              :disabled="loading"
            >
              <i class="bi bi-plus-lg me-1"></i>
              {{ t('models:actions.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="row g-3">
        <!-- Total Models -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-primary">
                  <i class="bi bi-box-seam"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('models:stats.total') }}</div>
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
                  <div class="stat-label">{{ t('models:stats.filtered') }}</div>
                  <div class="stat-value">{{ stats.filtered || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Parts Count -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-success">
                  <i class="bi bi-gear"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('models:stats.parts') }}</div>
                  <div class="stat-value">{{ stats.byType?.PART || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assemblies Count -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-warning">
                  <i class="bi bi-diagram-3"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('models:stats.assemblies') }}</div>
                  <div class="stat-value">{{ stats.byType?.ASSEMBLY || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Stats Row -->
      <div class="row g-3 mt-2">
        <!-- Drawings Count -->
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-secondary">
                  <i class="bi bi-image"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('models:stats.drawings') }}</div>
                  <div class="stat-value">{{ stats.byType?.DRAWING || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Count -->
        <div class="col-md-3 col-sm-6" v-if="stats.selected > 0">
          <div class="stat-card selected">
            <div class="stat-card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-primary">
                  <i class="bi bi-check-square"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ t('models:stats.selected') }}</div>
                  <div class="stat-value">{{ stats.selected }}</div>
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
          {{ t('models:actions.create') }}
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
    byType: Record<string, number>
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
    byType: {}
  })
})

// Emits
defineEmits<{
  refresh: []
  create: []
  export: []
}>()

// Composables
const { t } = useI18n()
const { isDebugMode } = useDebug()
</script>

<style scoped>
.models-header {
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

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .models-header {
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
}

@media (max-width: 576px) {
  .stats-section .row {
    margin: 0 -0.5rem;
  }
  
  .stats-section .col-sm-6 {
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>