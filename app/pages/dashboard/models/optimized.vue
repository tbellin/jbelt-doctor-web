<!--
  Pagina Dashboard Models - Versione Ottimizzata
  
  Features implementate:
  - useApiOptimized per performance e caching
  - useErrorHandler per gestione errori consistente
  - useLoadingState per stati di caricamento ottimizzati
  - Improved UX con feedback immediato
  - Mobile responsiveness migliorata
  - Performance optimization con lazy loading
  
  @version 3.0.0 - Optimized Architecture
-->
<template>
  <div class="models-dashboard-optimized">
    <!-- Enhanced Header -->
    <ModelsPageHeaderOptimized
      :loading="isLoading"
      :stats="modelStats"
      @refresh="handleRefresh"
      @create="showCreateModal = true"
      @export="handleExport"
    />

    <!-- Quick Actions Bar -->
    <div class="quick-actions-bar mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div class="quick-stats">
          <span class="badge bg-primary me-2">
            {{ filteredModels.length }} models
          </span>
          <span v-if="selectedModels.length" class="badge bg-info me-2">
            {{ selectedModels.length }} selected
          </span>
          <span v-if="cacheStatus.hitRate" class="badge bg-success me-2">
            {{ cacheStatus.hitRate }}% cache hit
          </span>
        </div>
        
        <div class="bulk-actions" v-if="selectedModels.length">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" @click="handleBulkExport">
              <i class="bi bi-download me-1"></i>
              Export Selected
            </button>
            <button class="btn btn-outline-danger" @click="handleBulkDelete">
              <i class="bi bi-trash me-1"></i>
              Delete Selected
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Search and Filters -->
    <ModelsSearchFiltersOptimized
      v-model:search-code="searchCode"
      v-model:selected-type="selectedType"
      v-model:selected-instance="selectedInstance"
      v-model:advanced-filters="advancedFilters"
      :loading="isLoading"
      :total-count="modelStats.total"
      @search="performSearch"
      @filters-changed="applyFilters"
      @clear-filters="clearFilters"
      @save-filter-preset="handleSaveFilterPreset"
    />

    <!-- Models Table with Enhanced Features -->
    <ModelsTableOptimized
      :models="paginatedModels"
      :loading="isLoading"
      :error="error"
      :selected-models="selectedModels"
      :expanded-rows="expandedRows"
      :model-sheets="modelSheets"
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      :sort-config="sortConfig"
      @selection-changed="handleSelectionChanged"
      @toggle-expansion="toggleRowExpansion"
      @sort-changed="handleSortChanged"
      @page-changed="changePage"
      @page-size-changed="handlePageSizeChanged"
      @view="viewModel"
      @edit="editModel"
      @delete="confirmDelete"
      @duplicate="duplicateModel"
      @associations-updated="handleAssociationsUpdated"
    />

    <!-- Enhanced Modal System -->
    <ModelFormModalOptimized
      :show="showCreateModal"
      :editing-model="editingModel"
      :form-data="formData"
      :validation-errors="validationErrors"
      :saving="isSaving"
      @close="closeModal"
      @save="saveModel"
      @validate="validateForm"
    />

    <ModelViewModalOptimized
      :show="showViewModal"
      :model="viewingModel"
      :related-data="relatedModelData"
      @close="closeViewModal"
      @edit="editFromView"
      @duplicate="duplicateFromView"
      @export="exportModel"
    />

    <!-- Performance Monitor (Debug) -->
    <PerformanceMonitor
      v-if="isDebugMode"
      :api-metrics="apiMetrics"
      :cache-stats="cacheStatus"
      :component-stats="componentStats"
    />
  </div>
</template>

<script setup lang="ts">
// Optimized imports
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useApiOptimized } from '~/composables/useApiOptimized'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoadingState } from '~/composables/useLoadingState'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'

// Enhanced component imports (to be created)
import ModelsPageHeaderOptimized from '~/components/Models/ModelsPageHeaderOptimized.vue'
import ModelsSearchFiltersOptimized from '~/components/Models/ModelsSearchFiltersOptimized.vue'
import ModelsTableOptimized from '~/components/Models/ModelsTableOptimized.vue'
import ModelFormModalOptimized from '~/components/Models/ModelFormModalOptimized.vue'
import ModelViewModalOptimized from '~/components/Models/ModelViewModalOptimized.vue'
import PerformanceMonitor from '~/components/Debug/PerformanceMonitor.vue'

import type { Model } from '~/types/model'

// Page configuration
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})

// Composables setup
const api = useApiOptimized()
const { handleError, showSuccessToast, showInfoToast } = useErrorHandler()
const { withLoading, isLoadingContext } = useLoadingState()
const { t, loadNamespace } = useI18n()
const { isAuthenticated, user } = useAuth()
const { isDebugMode } = useDebug()

// Core reactive state
const allModels = ref<Model[]>([])
const filteredModels = ref<Model[]>([])
const selectedModels = ref<Model[]>([])
const expandedRows = ref<Set<number>>(new Set())
const modelSheets = ref<Record<number, any[]>>({})

// Search and filtering
const searchCode = ref('')
const selectedType = ref('')
const selectedInstance = ref('')
const advancedFilters = ref({
  hasSheets: null as boolean | null,
  hasDrawings: null as boolean | null,
  dateRange: null as any,
  tags: [] as string[]
})

// Pagination and sorting
const currentPage = ref(1)
const itemsPerPage = ref(20)
const sortConfig = ref({
  field: 'id',
  direction: 'desc' as 'asc' | 'desc'
})

// Modal states
const showCreateModal = ref(false)
const showViewModal = ref(false)
const editingModel = ref<Model | null>(null)
const viewingModel = ref<Model | null>(null)
const relatedModelData = ref<any>(null)

// Form management
const formData = ref({
  code: '',
  name: '',
  modelType: '',
  instanceType: '',
  description: '',
  tags: [] as string[]
})
const validationErrors = ref<Record<string, string>>({})

// Performance and debug
const componentStats = ref({
  renderTime: 0,
  lastUpdate: new Date(),
  operationsCount: 0
})

// Computed properties
const isLoading = computed(() => isLoadingContext('models-page').value)
const isSaving = computed(() => isLoadingContext('model-save').value)

const modelStats = computed(() => ({
  total: allModels.value.length,
  filtered: filteredModels.value.length,
  selected: selectedModels.value.length,
  byType: allModels.value.reduce((acc, model) => {
    acc[model.modelType] = (acc[model.modelType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}))

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredModels.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredModels.value.length / itemsPerPage.value)
})

const apiMetrics = computed(() => api.metrics.value)
const cacheStatus = computed(() => api.cacheManager.stats.value)

const error = computed(() => {
  // Error state managed by global error handler
  return null
})

// Core data loading with optimization
const loadModels = async (force = false): Promise<void> => {
  const startTime = performance.now()
  
  try {
    // Use optimized API with caching
    const modelsResponse = await api.models.getAll()
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
      
      // Pre-load sheets data for models that have them
      await Promise.all(
        allModels.value
          .filter(model => model.sheets && model.sheets.length > 0)
          .map(async model => {
            if (model.id && !modelSheets.value[model.id]) {
              modelSheets.value[model.id] = model.sheets || []
            }
          })
      )
      
      applyFilters()
      
      showInfoToast(
        `Loaded ${allModels.value.length} models ${modelsResponse.cached ? '(cached)' : ''}`,
        2000
      )
    }
  } catch (error: any) {
    handleError(error, 'models-loading', {
      showToast: true,
      onRetry: () => loadModels(true)
    })
  } finally {
    const duration = performance.now() - startTime
    componentStats.value.renderTime = duration
    componentStats.value.lastUpdate = new Date()
    componentStats.value.operationsCount++
  }
}

// Enhanced filtering with debouncing
const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return (fn: Function, delay = 300) => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, delay)
  }
})()

const performSearch = (): void => {
  debouncedSearch(async () => {
    if (!searchCode.value.trim()) {
      applyFilters()
      return
    }
    
    try {
      const searchResponse = await api.models.searchByCode(searchCode.value.trim())
      if (searchResponse.success) {
        allModels.value = searchResponse.data || []
        applyFilters()
      }
    } catch (error: any) {
      handleError(error, 'model-search')
    }
  })
}

const applyFilters = (): void => {
  let filtered = [...allModels.value]
  
  // Type filter
  if (selectedType.value) {
    filtered = filtered.filter(model => model.modelType === selectedType.value)
  }
  
  // Instance filter
  if (selectedInstance.value) {
    filtered = filtered.filter(model => model.instanceType === selectedInstance.value)
  }
  
  // Advanced filters
  if (advancedFilters.value.hasSheets !== null) {
    filtered = filtered.filter(model => 
      advancedFilters.value.hasSheets 
        ? (model.sheets && model.sheets.length > 0)
        : (!model.sheets || model.sheets.length === 0)
    )
  }
  
  // Sort
  filtered.sort((a, b) => {
    const field = sortConfig.value.field as keyof Model
    const aVal = a[field] || ''
    const bVal = b[field] || ''
    
    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortConfig.value.direction === 'asc' ? result : -result
  })
  
  filteredModels.value = filtered
  currentPage.value = 1 // Reset to first page
}

// Enhanced CRUD operations
const saveModel = async (): Promise<void> => {
  if (!validateForm()) return
  
  try {
    let response
    const modelData = { ...formData.value }
    
    if (editingModel.value?.id) {
      response = await api.models.update(editingModel.value.id, modelData)
    } else {
      response = await api.models.create(modelData)
    }
    
    if (response.success) {
      closeModal()
      await loadModels(true) // Force refresh to get updated data
    }
  } catch (error: any) {
    handleError(error, 'model-save')
  }
}

const confirmDelete = async (model: Model): Promise<void> => {
  const confirmed = confirm(
    t('models:confirmDelete', { name: model.name || model.code })
  )
  if (!confirmed) return
  
  try {
    if (model.id) {
      const response = await api.models.delete(model.id)
      if (response.success) {
        await loadModels(true)
      }
    }
  } catch (error: any) {
    handleError(error, 'model-delete')
  }
}

// Enhanced UI interactions
const handleSelectionChanged = (models: Model[]): void => {
  selectedModels.value = models
}

const handleSortChanged = (field: string, direction: 'asc' | 'desc'): void => {
  sortConfig.value = { field, direction }
  applyFilters()
}

const handlePageSizeChanged = (size: number): void => {
  itemsPerPage.value = size
  currentPage.value = 1
}

const toggleRowExpansion = async (model: Model): Promise<void> => {
  if (!model.id) return
  
  const modelId = model.id
  
  if (expandedRows.value.has(modelId)) {
    expandedRows.value.delete(modelId)
  } else {
    expandedRows.value.add(modelId)
    
    // Load sheets if not already loaded
    if (!modelSheets.value[modelId]) {
      try {
        await loadSheetsForModel(model)
      } catch (error: any) {
        handleError(error, 'sheets-loading')
      }
    }
  }
}

const loadSheetsForModel = async (model: Model): Promise<void> => {
  if (!model.id) return
  
  const modelId = model.id
  
  try {
    let response
    if (model.modelType === 'DRAWING') {
      response = await api.sheets.getByDrawing(model.id)
    } else {
      const allSheetsResponse = await api.sheets.getAll()
      if (allSheetsResponse.success) {
        const associatedSheets = allSheetsResponse.data?.filter(sheet =>
          sheet.models?.some((sheetModel: any) => {
            const sheetModelId = typeof sheetModel === 'object' ? sheetModel.id : sheetModel
            return sheetModelId === model.id
          })
        ) || []
        
        response = { success: true, data: associatedSheets }
      } else {
        throw new Error(allSheetsResponse.error)
      }
    }
    
    if (response.success) {
      modelSheets.value[modelId] = response.data || []
    }
  } catch (error: any) {
    handleError(error, 'model-sheets-loading')
    modelSheets.value[modelId] = []
  }
}

// Enhanced operations
const handleRefresh = async (): Promise<void> => {
  api.clearCache('/api/models') // Clear cache for fresh data
  await loadModels(true)
}

const handleBulkDelete = async (): Promise<void> => {
  const confirmed = confirm(
    `Delete ${selectedModels.value.length} selected models?`
  )
  if (!confirmed) return
  
  try {
    await Promise.all(
      selectedModels.value.map(model => 
        model.id ? api.models.delete(model.id) : Promise.resolve()
      )
    )
    
    selectedModels.value = []
    await loadModels(true)
    showSuccessToast(`Deleted ${selectedModels.value.length} models`)
  } catch (error: any) {
    handleError(error, 'bulk-delete')
  }
}

const handleExport = async (): Promise<void> => {
  try {
    const exportData = filteredModels.value.map(model => ({
      id: model.id,
      code: model.code,
      name: model.name,
      type: model.modelType,
      instance: model.instanceType
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `models-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showSuccessToast('Models exported successfully')
  } catch (error: any) {
    handleError(error, 'export')
  }
}

// Form validation
const validateForm = (): boolean => {
  validationErrors.value = {}
  
  if (!formData.value.code.trim()) {
    validationErrors.value.code = t('models:validation.codeRequired')
  }
  
  if (!formData.value.name.trim()) {
    validationErrors.value.name = t('models:validation.nameRequired')
  }
  
  if (!formData.value.modelType) {
    validationErrors.value.modelType = t('models:validation.typeRequired')
  }
  
  return Object.keys(validationErrors.value).length === 0
}

// Modal management
const closeModal = (): void => {
  showCreateModal.value = false
  editingModel.value = null
  resetForm()
}

const resetForm = (): void => {
  formData.value = {
    code: '',
    name: '',
    modelType: '',
    instanceType: '',
    description: '',
    tags: []
  }
  validationErrors.value = {}
}

const viewModel = (model: Model): void => {
  viewingModel.value = model
  showViewModal.value = true
  
  // Load related data
  loadRelatedModelData(model)
}

const loadRelatedModelData = async (model: Model): Promise<void> => {
  try {
    // Load additional data for the view modal
    const [sheetsResponse] = await Promise.all([
      model.id ? api.sheets.getByModel(model.id) : Promise.resolve({ success: true, data: [] })
    ])
    
    relatedModelData.value = {
      sheets: sheetsResponse.data || []
    }
  } catch (error: any) {
    handleError(error, 'related-data-loading')
  }
}

// Watchers for reactive updates
watch([selectedType, selectedInstance], () => {
  applyFilters()
})

watch(searchCode, () => {
  if (!searchCode.value.trim()) {
    applyFilters()
  }
})

// Lifecycle
onMounted(async () => {
  await loadNamespace('models')
  await loadModels()
})

// SEO
useHead({
  title: computed(() => `${t('models:title')} - Dashboard Optimized`),
  meta: [
    { 
      name: 'description', 
      content: 'Optimized CAD models management with enhanced performance and UX' 
    }
  ]
})
</script>

<style scoped>
.models-dashboard-optimized {
  padding: 1rem;
  min-height: 100vh;
}

.quick-actions-bar {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
}

.quick-stats .badge {
  font-size: 0.875rem;
}

.bulk-actions {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Performance optimizations */
.models-table-container {
  contain: layout style paint;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .models-dashboard-optimized {
    padding: 0.5rem;
  }
  
  .quick-actions-bar {
    padding: 0.5rem;
  }
  
  .quick-actions-bar .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>