<template>
  <div v-if="show" class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-earmark-plus me-2"></i>
            {{ t('models:sheets.addSheetsToModel') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <!-- Model Information -->
          <div class="alert alert-info">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="d-flex align-items-center">
                  <i class="bi bi-info-circle me-2"></i>
                  <div>
                    <strong>{{ t('models:sheets.addingToModel') }}:</strong>
                    <span class="ms-2">{{ model.name }} ({{ model.code }})</span>
                    <div class="small text-muted">
                      {{ t('models:sheets.modelType') }}: {{ model.modelType }}
                      <span v-if="model.instanceType" class="ms-2">
                        | {{ t('models:instances.' + (model.instanceType?.toLowerCase() || 'normal')) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 text-end">
                <small class="text-muted">
                  {{ t('models:sheets.currentModelType') }}: 
                  <span class="badge bg-secondary">{{ model.modelType }}</span>
                </small>
              </div>
            </div>
          </div>

          <!-- Search and Filters -->
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">{{ t('common:search') }}</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  v-model="searchTerm"
                  type="text" 
                  class="form-control"
                  :placeholder="t('models:sheets.searchSheets')"
                >
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">{{ t('sheets:filter.format') }}</label>
              <select v-model="selectedFormat" class="form-select">
                <option value="">{{ t('common:all') }}</option>
                <option v-for="format in availableFormats" :key="format" :value="format">
                  {{ format }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">{{ t('sheets:filter.drawing') }}</label>
              <select v-model="drawingFilter" class="form-select">
                <option value="">{{ t('common:all') }}</option>
                <option value="with">{{ t('sheets:filter.withDrawing') }}</option>
                <option value="without">{{ t('sheets:filter.withoutDrawing') }}</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">&nbsp;</label>
              <div class="d-grid">
                <button 
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="clearFilters"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  {{ t('common:clear') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="row mb-3">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  {{ t('sheets:stats.total') }}: <strong>{{ availableSheets.length }}</strong> |
                  {{ t('common:filtered') }}: <strong>{{ filteredSheets.length }}</strong> |
                  {{ t('common:selected') }}: <strong>{{ selectedSheetIds.length }}</strong>
                </small>
                <div class="btn-group btn-group-sm">
                  <button 
                    type="button"
                    class="btn btn-outline-primary"
                    @click="selectAll"
                    :disabled="selectableSheets.length === 0"
                  >
                    {{ t('common:selectAll') }}
                  </button>
                  <button 
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="deselectAll"
                    :disabled="selectedSheetIds.length === 0"
                  >
                    {{ t('common:deselectAll') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Available Sheets -->
          <div class="available-sheets" style="max-height: 500px; overflow-y: auto;">
            <!-- Loading state -->
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">{{ t('common:loading') }}</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="filteredSheets.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-search fs-1 opacity-25"></i>
              <h6 class="mt-3">{{ t('models:sheets.noSheetsFound') }}</h6>
              <p class="small">
                <span v-if="searchTerm || selectedFormat || drawingFilter">
                  {{ t('common:tryDifferentFilters') }}
                </span>
                <span v-else>
                  {{ t('models:sheets.noSheetsAvailable') }}
                </span>
              </p>
            </div>
            
            <!-- Sheets grid -->
            <div v-else class="row">
              <div 
                v-for="sheet in filteredSheets" 
                :key="sheet.id"
                class="col-md-6 col-lg-4 mb-3"
              >
                <div 
                  class="sheet-card border rounded p-3 h-100"
                  :class="{ 
                    'border-success bg-success bg-opacity-10': selectedSheetIds.includes(sheet.id!),
                    'border-warning bg-warning bg-opacity-10': isAlreadyAssociated(sheet),
                    'border-light': !selectedSheetIds.includes(sheet.id!) && !isAlreadyAssociated(sheet)
                  }"
                >
                  <div class="form-check">
                    <input 
                      :id="`sheet-${sheet.id}`"
                      type="checkbox" 
                      class="form-check-input"
                      :value="sheet.id"
                      v-model="selectedSheetIds"
                      :disabled="isAlreadyAssociated(sheet)"
                    >
                    <label :for="`sheet-${sheet.id}`" class="form-check-label w-100">
                      <!-- Sheet header -->
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="sheet-title">
                          <span class="badge bg-info me-2">{{ sheet.formatType || 'N/A' }}</span>
                          <strong class="text-primary">{{ sheet.code || 'NO_CODE' }}</strong>
                        </div>
                        <div class="sheet-status">
                          <span v-if="isAlreadyAssociated(sheet)" class="badge bg-warning">
                            <i class="bi bi-check-circle me-1"></i>
                            {{ t('models:sheets.alreadyAssociated') }}
                          </span>
                          <span v-else-if="selectedSheetIds.includes(sheet.id!)" class="badge bg-success">
                            <i class="bi bi-check-square me-1"></i>
                            {{ t('common:selected') }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Sheet name -->
                      <div class="sheet-name mb-2">
                        <span class="text-muted">{{ sheet.name || 'Unnamed Sheet' }}</span>
                      </div>
                      
                      <!-- Sheet details -->
                      <div class="sheet-details small text-muted">
                        <div class="row">
                          <div class="col-12">
                            <div v-if="sheet.creoId" class="mb-1">
                              <i class="bi bi-tag me-1"></i>
                              <strong>Creo:</strong> {{ sheet.creoId }}
                            </div>
                            <div v-if="sheet.drawing" class="mb-1">
                              <i class="bi bi-image me-1"></i>
                              <strong>{{ t('sheets:table.drawing') }}:</strong> 
                              {{ getDrawingDisplayName(sheet.drawing) }}
                            </div>
                            <div v-if="sheet.models && sheet.models.length > 0" class="mb-1">
                              <i class="bi bi-gear me-1"></i>
                              <strong>{{ t('models:sheets.associatedModels') }}:</strong> 
                              {{ sheet.models.length }}
                            </div>
                            <div class="mb-1">
                              <i class="bi bi-hash me-1"></i>
                              <strong>ID:</strong> {{ sheet.id }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="me-auto">
            <small class="text-muted">
              {{ t('models:sheets.selectedCount', { count: selectedSheetIds.length }) }}
              <span v-if="selectedSheetIds.length > 0">
                / {{ filteredSheets.length }} {{ t('common:available') }}
              </span>
            </small>
          </div>
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            {{ t('common:cancel') }}
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleAdd"
            :disabled="selectedSheetIds.length === 0 || loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-plus-circle me-2"></i>
            {{ loading ? t('common:saving') : t('models:sheets.addSelected') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { IModel } from '~/model/model.model'
import type { SheetWithRelations } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'
import { useApi } from '~/composables/useApi'
import { getAvailableFormats } from '~/utils/formats'

const { t } = useI18n()
const { sheets: sheetsApi } = useApi()

interface Props {
  show: boolean
  model: IModel
  existingSheetIds: number[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'add': [sheetIds: number[]]
}>()

// Reactive state
const availableSheets = ref<SheetWithRelations[]>([])
const selectedSheetIds = ref<number[]>([])
const searchTerm = ref('')
const selectedFormat = ref('')
const drawingFilter = ref('')
const localLoading = ref(false)

// Computed properties
const loading = computed(() => props.loading || localLoading.value)

const availableFormats = computed(() => {
  const existingFormats = availableSheets.value
    .map(sheet => sheet.formatType)
    .filter(Boolean)
  return getAvailableFormats(existingFormats)
})

const filteredSheets = computed(() => {
  let sheets = availableSheets.value

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    sheets = sheets.filter(sheet => 
      sheet.code?.toLowerCase().includes(term) ||
      sheet.name?.toLowerCase().includes(term) ||
      sheet.creoId?.toLowerCase().includes(term)
    )
  }

  // Filter by format
  if (selectedFormat.value) {
    sheets = sheets.filter(sheet => sheet.formatType === selectedFormat.value)
  }

  // Filter by drawing association
  if (drawingFilter.value === 'with') {
    sheets = sheets.filter(sheet => sheet.drawing)
  } else if (drawingFilter.value === 'without') {
    sheets = sheets.filter(sheet => !sheet.drawing)
  }

  return sheets.sort((a, b) => {
    // Sort by code, then by name
    const codeComparison = (a.code || '').localeCompare(b.code || '')
    if (codeComparison !== 0) return codeComparison
    return (a.name || '').localeCompare(b.name || '')
  })
})

const selectableSheets = computed(() => {
  return filteredSheets.value.filter(sheet => !isAlreadyAssociated(sheet))
})

// Methods
const isAlreadyAssociated = (sheet: SheetWithRelations): boolean => {
  return props.existingSheetIds.includes(sheet.id!)
}

const loadAvailableSheets = async (): Promise<void> => {
  localLoading.value = true
  try {
    console.log('[AdvancedAddSheets] Loading available sheets...')
    const response = await sheetsApi.getAll()
    
    if (response.success) {
      availableSheets.value = response.data || []
      console.log(`[AdvancedAddSheets] Loaded ${availableSheets.value.length} available sheets`)
    } else {
      console.error('[AdvancedAddSheets] Failed to load sheets:', response.error)
    }
  } catch (error) {
    console.error('[AdvancedAddSheets] Error loading sheets:', error)
  } finally {
    localLoading.value = false
  }
}

const selectAll = (): void => {
  const selectableIds = selectableSheets.value.map(sheet => sheet.id!).filter(Boolean)
  selectedSheetIds.value = [...new Set([...selectedSheetIds.value, ...selectableIds])]
}

const deselectAll = (): void => {
  selectedSheetIds.value = []
}

const clearFilters = (): void => {
  searchTerm.value = ''
  selectedFormat.value = ''
  drawingFilter.value = ''
}

const handleAdd = (): void => {
  if (selectedSheetIds.value.length === 0) return
  console.log('[AdvancedAddSheets] Adding sheets:', selectedSheetIds.value)
  emit('add', [...selectedSheetIds.value])
}

const getDrawingDisplayName = (drawing: any): string => {
  if (!drawing) return 'No Drawing'
  
  if (typeof drawing === 'object') {
    return drawing.name || drawing.code || `Drawing ${drawing.id}`
  }
  
  return `Drawing ID: ${drawing}`
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedSheetIds.value = []
    clearFilters()
    loadAvailableSheets()
  }
})

// Load sheets on mount if modal is initially shown
onMounted(() => {
  if (props.show) {
    loadAvailableSheets()
  }
})
</script>

<style scoped>
.sheet-card {
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 180px;
}

.sheet-card:hover:not(.border-warning) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sheet-card.border-success {
  border-color: #198754 !important;
}

.sheet-card.border-warning {
  border-color: #ffc107 !important;
  cursor: not-allowed;
}

.sheet-card.border-warning .form-check-input {
  cursor: not-allowed;
}

.sheet-title {
  flex: 1;
}

.sheet-status .badge {
  font-size: 0.7rem;
}

.sheet-details {
  line-height: 1.3;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.available-sheets {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .sheet-card {
    min-height: auto;
  }
  
  .col-md-6,
  .col-lg-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>