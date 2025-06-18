<!--
  Pagina Sheets - Versione Ottimizzata
  
  Features implementate:
  - useApiOptimized per performance e caching migliorati
  - useErrorHandler per gestione errori consistente
  - useLoadingState per feedback UX ottimizzato
  - Improved mobile responsiveness
  - Enhanced form validation
  - Bulk operations support
  
  @version 3.0.0 - Optimized Architecture
-->
<template>
  <div class="sheets-dashboard-optimized">
    <!-- Enhanced Header with Real-time Stats -->
    <SheetsPageHeaderOptimized
      :loading="isLoading"
      :stats="sheetStats"
      @refresh="handleRefresh"
      @create="showCreateModal = true"
      @import="handleImport"
      @export="handleExport"
    />

    <!-- Quick Actions and Bulk Operations -->
    <div class="quick-actions-section mb-4" v-if="selectedSheets.length || hasActiveFilters">
      <div class="card">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div class="quick-info">
              <span v-if="selectedSheets.length" class="badge bg-primary me-2">
                {{ selectedSheets.length }} selected
              </span>
              <span v-if="hasActiveFilters" class="badge bg-info me-2">
                {{ filteredSheets.length }} of {{ allSheets.length }} shown
              </span>
              <span v-if="apiMetrics.cacheHits" class="badge bg-success me-2">
                {{ Math.round((apiMetrics.cacheHits / apiMetrics.totalRequests) * 100) }}% cached
              </span>
            </div>
            
            <div class="bulk-actions" v-if="selectedSheets.length">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" @click="handleBulkExport">
                  <i class="bi bi-download me-1"></i>
                  Export Selected
                </button>
                <button class="btn btn-outline-warning" @click="handleBulkEdit">
                  <i class="bi bi-pencil me-1"></i>
                  Edit Selected
                </button>
                <button class="btn btn-outline-danger" @click="handleBulkDelete">
                  <i class="bi bi-trash me-1"></i>
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Search and Filters -->
    <SheetsSearchFiltersOptimized
      v-model:search-query="searchQuery"
      v-model:selected-format="selectedFormat"
      v-model:selected-drawing="selectedDrawing"
      v-model:selected-model="selectedModel"
      v-model:advanced-filters="advancedFilters"
      :available-drawings="availableDrawings"
      :available-models="availableModels"
      :available-formats="availableFormats"
      :loading="isLoading"
      @search="performSearch"
      @filters-changed="applyFilters"
      @clear-filters="clearAllFilters"
      @save-preset="handleSaveFilterPreset"
    />

    <!-- Optimized Sheets Table -->
    <SheetsTableOptimized
      :sheets="paginatedSheets"
      :loading="isLoading"
      :selected-sheets="selectedSheets"
      :sort-config="sortConfig"
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      @selection-changed="handleSelectionChanged"
      @sort-changed="handleSortChanged"
      @page-changed="changePage"
      @page-size-changed="handlePageSizeChanged"
      @view="viewSheet"
      @edit="editSheet"
      @delete="confirmDeleteSheet"
      @duplicate="duplicateSheet"
    />

    <!-- Enhanced Modal System -->
    <SheetFormModalOptimized
      :show="showCreateModal"
      :editing-sheet="editingSheet"
      :form-data="formData"
      :validation-errors="validationErrors"
      :available-drawings="availableDrawings"
      :available-models="availableModels"
      :saving="isSaving"
      @close="closeModal"
      @save="saveSheet"
      @validate="validateSheetForm"
    />

    <SheetViewModalOptimized
      :show="showViewModal"
      :sheet="viewingSheet"
      :related-data="relatedSheetData"
      @close="closeViewModal"
      @edit="editFromView"
      @duplicate="duplicateFromView"
      @export="exportSheet"
    />

    <!-- Bulk Edit Modal -->
    <SheetBulkEditModal
      :show="showBulkEditModal"
      :selected-sheets="selectedSheets"
      @close="showBulkEditModal = false"
      @save="handleBulkSave"
    />

    <!-- Import Modal -->
    <SheetImportModal
      :show="showImportModal"
      @close="showImportModal = false"
      @import="handleImportComplete"
    />

    <!-- Performance Monitor (Debug) -->
    <PerformanceMonitor
      v-if="isDebugMode"
      :api-metrics="apiMetrics"
      :cache-stats="cacheStatus"
      :component-stats="componentPerformance"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useApiOptimized } from '~/composables/useApiOptimized'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoadingState } from '~/composables/useLoadingState'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'

// Enhanced component imports
import SheetsPageHeaderOptimized from '~/components/Sheets/SheetsPageHeaderOptimized.vue'
import SheetsSearchFiltersOptimized from '~/components/Sheets/SheetsSearchFiltersOptimized.vue'
import SheetsTableOptimized from '~/components/Sheets/SheetsTableOptimized.vue'
import SheetFormModalOptimized from '~/components/Sheets/SheetFormModalOptimized.vue'
import SheetViewModalOptimized from '~/components/Sheets/SheetViewModalOptimized.vue'
import SheetBulkEditModal from '~/components/Sheets/SheetBulkEditModal.vue'
import SheetImportModal from '~/components/Sheets/SheetImportModal.vue'
import PerformanceMonitor from '~/components/Debug/PerformanceMonitor.vue'

import type { SheetWithRelations } from '~/composables/useApiOptimized'
import type { IModel } from '~/model/model.model'

// Page configuration
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})

// Composables
const api = useApiOptimized()
const { handleError, showSuccessToast, showInfoToast } = useErrorHandler()
const { isLoadingContext } = useLoadingState()
const { t, loadNamespace } = useI18n()
const { isAuthenticated, user } = useAuth()
const { isDebugMode } = useDebug()

// Core state
const allSheets = ref<SheetWithRelations[]>([])
const filteredSheets = ref<SheetWithRelations[]>([])
const selectedSheets = ref<SheetWithRelations[]>([])
const availableDrawings = ref<IModel[]>([])
const availableModels = ref<IModel[]>([])
const availableFormats = ref<string[]>(['A0', 'A1', 'A2', 'A3V', 'A3O', 'A4V', 'A4O'])

// Search and filtering
const searchQuery = ref('')
const selectedFormat = ref('')
const selectedDrawing = ref('')
const selectedModel = ref('')
const advancedFilters = ref({
  hasDrawing: null as boolean | null,
  hasModels: null as boolean | null,
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
const showBulkEditModal = ref(false)
const showImportModal = ref(false)
const editingSheet = ref<SheetWithRelations | null>(null)
const viewingSheet = ref<SheetWithRelations | null>(null)
const relatedSheetData = ref<any>(null)

// Form management
const formData = ref({
  code: '',
  name: '',
  formatType: '',
  creoId: '',
  drawingId: '',
  modelIds: [] as string[],
  description: '',
  tags: [] as string[]
})
const validationErrors = ref<Record<string, string>>({})

// Performance tracking
const componentPerformance = ref({
  lastRender: Date.now(),
  renderCount: 0,
  averageRenderTime: 0,
  totalRenderTime: 0
})

// Computed properties
const isLoading = computed(() => isLoadingContext('sheets-page').value)
const isSaving = computed(() => isLoadingContext('sheet-save').value)

const sheetStats = computed(() => {
  const stats = {
    total: allSheets.value.length,
    filtered: filteredSheets.value.length,
    selected: selectedSheets.value.length,
    withDrawing: allSheets.value.filter(sheet => sheet.drawing).length,
    withoutDrawing: allSheets.value.filter(sheet => !sheet.drawing).length,
    byFormat: {} as Record<string, number>,
    totalModelsAssociated: allSheets.value.reduce((total, sheet) => 
      total + (sheet.models?.length || 0), 0
    )
  }
  
  // Count by format
  allSheets.value.forEach(sheet => {
    if (sheet.formatType) {
      stats.byFormat[sheet.formatType] = (stats.byFormat[sheet.formatType] || 0) + 1
    }
  })
  
  return stats
})

const paginatedSheets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSheets.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSheets.value.length / itemsPerPage.value)
})

const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    selectedFormat.value ||
    selectedDrawing.value ||
    selectedModel.value ||
    advancedFilters.value.hasDrawing !== null ||
    advancedFilters.value.hasModels !== null
  )
})

const apiMetrics = computed(() => api.metrics.value)
const cacheStatus = computed(() => api.cacheManager.stats.value)

// Performance tracking
const trackRenderPerformance = () => {
  const now = Date.now()
  const renderTime = now - componentPerformance.value.lastRender
  
  componentPerformance.value.renderCount++
  componentPerformance.value.totalRenderTime += renderTime
  componentPerformance.value.averageRenderTime = 
    componentPerformance.value.totalRenderTime / componentPerformance.value.renderCount
  componentPerformance.value.lastRender = now
}

// Data loading with optimization
const loadSheets = async (force = false): Promise<void> => {
  const startTime = performance.now()
  
  try {
    if (force) {
      api.clearCache('/api/sheets')
    }
    
    const [sheetsResponse, modelsResponse] = await Promise.all([
      api.sheets.getAll(),
      api.models.getAll()
    ])
    
    if (sheetsResponse.success) {
      allSheets.value = sheetsResponse.data || []
      applyFilters()
      
      if (sheetsResponse.cached) {
        showInfoToast(`Loaded ${allSheets.value.length} sheets (cached)`, 2000)
      }
    }
    
    if (modelsResponse.success) {
      const allModels = modelsResponse.data || []
      availableDrawings.value = allModels.filter(model => model.modelType === 'DRAWING')
      availableModels.value = allModels.filter(model => 
        model.modelType === 'PART' || model.modelType === 'ASSEMBLY'
      )
    }
    
  } catch (error: any) {
    handleError(error, 'sheets-loading', {
      showToast: true,
      onRetry: () => loadSheets(true)
    })
  } finally {
    trackRenderPerformance()
  }
}

// Enhanced search with debouncing
const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return (fn: Function, delay = 300) => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, delay)
  }
})()

const performSearch = (): void => {
  debouncedSearch(() => {
    applyFilters()
  })
}

// Advanced filtering
const applyFilters = (): void => {
  let filtered = [...allSheets.value]
  
  // Text search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(sheet =>
      sheet.code?.toLowerCase().includes(query) ||
      sheet.name?.toLowerCase().includes(query) ||
      sheet.creoId?.toLowerCase().includes(query)
    )
  }
  
  // Format filter
  if (selectedFormat.value) {
    filtered = filtered.filter(sheet => sheet.formatType === selectedFormat.value)
  }
  
  // Drawing filter
  if (selectedDrawing.value) {
    const drawingId = parseInt(selectedDrawing.value)
    filtered = filtered.filter(sheet => sheet.drawing?.id === drawingId)
  }
  
  // Model filter
  if (selectedModel.value) {
    const modelId = parseInt(selectedModel.value)
    filtered = filtered.filter(sheet =>
      sheet.models?.some(model => model.id === modelId)
    )
  }
  
  // Advanced filters
  if (advancedFilters.value.hasDrawing !== null) {
    filtered = filtered.filter(sheet =>
      advancedFilters.value.hasDrawing ? !!sheet.drawing : !sheet.drawing
    )
  }
  
  if (advancedFilters.value.hasModels !== null) {
    filtered = filtered.filter(sheet =>
      advancedFilters.value.hasModels 
        ? (sheet.models && sheet.models.length > 0)
        : (!sheet.models || sheet.models.length === 0)
    )
  }
  
  // Sort
  filtered.sort((a, b) => {
    const field = sortConfig.value.field as keyof SheetWithRelations
    const aVal = a[field] || ''
    const bVal = b[field] || ''
    
    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortConfig.value.direction === 'asc' ? result : -result
  })
  
  filteredSheets.value = filtered
  currentPage.value = 1
}

// Enhanced CRUD operations
const saveSheet = async (): Promise<void> => {
  if (!validateSheetForm()) return
  
  try {
    const sheetData = {
      ...formData.value,
      drawing: null as any,
      models: [] as any[]
    }
    
    // Add drawing association
    if (formData.value.drawingId) {
      const drawing = availableDrawings.value.find(d => 
        d.id?.toString() === formData.value.drawingId
      )
      if (drawing) {
        sheetData.drawing = drawing
      }
    }
    
    // Add models associations
    if (formData.value.modelIds.length) {
      sheetData.models = availableModels.value.filter(model =>
        formData.value.modelIds.includes(model.id?.toString() || '')
      )
    }
    
    let response
    if (editingSheet.value?.id) {
      response = await api.sheets.update(editingSheet.value.id, sheetData)
    } else {
      response = await api.sheets.create(sheetData)
    }
    
    if (response.success) {
      closeModal()
      await loadSheets(true)
    }
    
  } catch (error: any) {
    handleError(error, 'sheet-save')
  }
}

const confirmDeleteSheet = async (sheet: SheetWithRelations): Promise<void> => {
  const confirmed = confirm(
    t('sheets:confirmDelete', { name: sheet.name || sheet.code })
  )
  if (!confirmed) return
  
  try {
    if (sheet.id) {
      const response = await api.sheets.delete(sheet.id)
      if (response.success) {
        await loadSheets(true)
      }
    }
  } catch (error: any) {
    handleError(error, 'sheet-delete')
  }
}

// Bulk operations
const handleBulkDelete = async (): Promise<void> => {
  const confirmed = confirm(
    `Delete ${selectedSheets.value.length} selected sheets?`
  )
  if (!confirmed) return
  
  try {
    await Promise.all(
      selectedSheets.value.map(sheet =>
        sheet.id ? api.sheets.delete(sheet.id) : Promise.resolve()
      )
    )
    
    selectedSheets.value = []
    await loadSheets(true)
    showSuccessToast(`Deleted ${selectedSheets.value.length} sheets`)
  } catch (error: any) {
    handleError(error, 'bulk-delete')
  }
}

const handleBulkExport = async (): Promise<void> => {
  try {
    const exportData = selectedSheets.value.map(sheet => ({
      id: sheet.id,
      code: sheet.code,
      name: sheet.name,
      formatType: sheet.formatType,
      drawing: sheet.drawing?.code,
      models: sheet.models?.map(m => m.code).join(', ')
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sheets-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showSuccessToast(`Exported ${selectedSheets.value.length} sheets`)
  } catch (error: any) {
    handleError(error, 'export')
  }
}

// Event handlers
const handleSelectionChanged = (sheets: SheetWithRelations[]): void => {
  selectedSheets.value = sheets
}

const handleSortChanged = (field: string, direction: 'asc' | 'desc'): void => {
  sortConfig.value = { field, direction }
  applyFilters()
}

const handlePageSizeChanged = (size: number): void => {
  itemsPerPage.value = size
  currentPage.value = 1
}

const handleRefresh = async (): Promise<void> => {
  api.clearCache('/api/sheets')
  await loadSheets(true)
}

// Form validation
const validateSheetForm = (): boolean => {
  validationErrors.value = {}
  
  if (!formData.value.code.trim()) {
    validationErrors.value.code = t('sheets:validation.codeRequired')
  }
  
  if (!formData.value.name.trim()) {
    validationErrors.value.name = t('sheets:validation.nameRequired')
  }
  
  if (!formData.value.formatType) {
    validationErrors.value.formatType = t('sheets:validation.formatRequired')
  }
  
  return Object.keys(validationErrors.value).length === 0
}

// Modal management
const closeModal = (): void => {
  showCreateModal.value = false
  editingSheet.value = null
  resetForm()
}

const resetForm = (): void => {
  formData.value = {
    code: '',
    name: '',
    formatType: '',
    creoId: '',
    drawingId: '',
    modelIds: [],
    description: '',
    tags: []
  }
  validationErrors.value = {}
}

// Watchers
watch([selectedFormat, selectedDrawing, selectedModel], () => {
  applyFilters()
})

watch(searchQuery, () => {
  performSearch()
})

// Lifecycle
onMounted(async () => {
  await loadNamespace('sheets')
  await loadSheets()
})

// SEO
useHead({
  title: computed(() => `${t('sheets:title')} - Dashboard Optimized`),
  meta: [
    { 
      name: 'description', 
      content: 'Optimized technical sheets management with enhanced performance and UX' 
    }
  ]
})
</script>

<style scoped>
.sheets-dashboard-optimized {
  padding: 1rem;
  min-height: 100vh;
}

.quick-actions-section {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-actions {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Performance optimizations */
.sheets-table-container {
  contain: layout style paint;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sheets-dashboard-optimized {
    padding: 0.5rem;
  }
  
  .quick-actions-section .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>