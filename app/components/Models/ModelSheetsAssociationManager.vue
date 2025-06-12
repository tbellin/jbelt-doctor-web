<template>
  <div class="model-sheets-association-manager">
    <!-- Header con informazioni del modello -->
    <div class="header-section mb-3">
      <div class="d-flex justify-content-between align-items-start">
        <div class="model-info">
          <h6 class="mb-1">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i>
            {{ t('models:sheets.associatedSheets') }}
          </h6>
          <div class="small text-muted">
            <strong>{{ model.name }}</strong> ({{ model.code }}) - {{ model.modelType }}
            <span v-if="sheets.length > 0" class="ms-2">
              <span class="badge bg-primary">{{ sheets.length }}</span>
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            v-if="canHaveSheets" 
            type="button" 
            class="btn btn-sm btn-outline-primary"
            @click="showAddModal = true"
            :disabled="loading || !hasAvailableSheets"
            :title="hasAvailableSheets ? t('models:sheets.addSheet') : t('models:sheets.noSheetsAvailable')"
          >
            <i class="bi bi-plus-circle me-1"></i>
            {{ t('models:sheets.addSheet') }}
          </button>
          <div v-else class="alert alert-info py-2 px-3 mb-0 small">
            <i class="bi bi-info-circle me-2"></i>
            {{ t('models:sheets.onlyPartAssemblyCanHaveSheets') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stato caricamento -->
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span class="ms-2">{{ t('models:loading') }}</span>
    </div>

    <!-- Lista fogli associati -->
    <div v-else-if="sheets.length > 0" class="sheets-list">
      <div class="row">
        <div 
          v-for="sheet in sheets" 
          :key="sheet.id"
          class="col-12 mb-2"
        >
          <div class="sheet-card border rounded p-3">
            <div class="row align-items-center">
              <!-- Informazioni foglio -->
              <div class="col-md-8">
                <div class="sheet-info">
                  <div class="d-flex align-items-center mb-2">
                    <span class="badge bg-info me-2">{{ sheet.formatType || 'N/A' }}</span>
                    <strong class="text-primary me-2">{{ sheet.code || 'NO_CODE' }}</strong>
                    <span class="text-muted">{{ sheet.name || 'Unnamed Sheet' }}</span>
                  </div>
                  
                  <div class="sheet-details small text-muted">
                    <div class="row">
                      <div class="col-md-6">
                        <div v-if="sheet.creoId">
                          <i class="bi bi-tag me-1"></i>
                          <strong>Creo ID:</strong> {{ sheet.creoId }}
                        </div>
                        <div v-if="sheet.drawing">
                          <i class="bi bi-image me-1"></i>
                          <strong>{{ t('sheets:table.drawing') }}:</strong> {{ getDrawingDisplayName(sheet.drawing) }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div v-if="sheet.models && sheet.models.length > 0">
                          <i class="bi bi-gear me-1"></i>
                          <strong>{{ t('models:sheets.associatedModels') }}:</strong> {{ sheet.models.length }}
                        </div>
                        <div>
                          <i class="bi bi-hash me-1"></i>
                          <strong>ID:</strong> {{ sheet.id }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Azioni -->
              <div class="col-md-4 text-end">
                <div class="btn-group">
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-secondary"
                    @click="viewSheet(sheet)"
                    :title="t('common:view')"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-warning"
                    @click="editSheetAssociation(sheet)"
                    :title="t('common:edit')"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmRemoveAssociation(sheet)"
                    :title="t('models:sheets.removeAssociation')"
                  >
                    <i class="bi bi-unlink"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stato vuoto -->
    <div v-else class="empty-state text-center py-4">
      <i class="bi bi-file-earmark-text fs-1 text-muted opacity-25"></i>
      <h6 class="mt-3 text-muted">{{ t('models:sheets.noSheetsAssociated') }}</h6>
      <p class="text-muted small mb-3">
        <span v-if="canHaveSheets">{{ t('models:sheets.clickAddToAssociate') }}</span>
        <span v-else>{{ t('models:sheets.onlyPartAssemblyCanHaveSheets') }}</span>
      </p>
      <button 
        v-if="canHaveSheets && hasAvailableSheets"
        type="button" 
        class="btn btn-primary btn-sm"
        @click="showAddModal = true"
      >
        <i class="bi bi-plus-circle me-2"></i>
        {{ t('models:sheets.addSheet') }}
      </button>
    </div>

    <!-- Modal per aggiungere fogli -->
    <AdvancedAddSheetsModal 
      :show="showAddModal"
      :model="model"
      :existing-sheet-ids="existingSheetIds"
      :loading="modalLoading"
      @close="closeAddModal"
      @add="handleAddSheets"
    />

    <!-- Modal per visualizzare foglio -->
    <SheetViewModal
      v-if="viewingSheet"
      :show="showViewModal"
      :sheet="viewingSheet"
      @close="closeViewModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import { useI18n } from '~/composables/useI18n'
import { useApi, type SheetWithRelations } from '~/composables/useApi'
import AdvancedAddSheetsModal from './AdvancedAddSheetsModal.vue'
import SheetViewModal from '../Sheets/SheetViewModal.vue'
import { 
  enrichPartialSheets, 
  createCleanModelForUpdate, 
  createCleanSheetForUpdate,
  validateObjectForUpdate,
  debugLogObject 
} from '~/utils/objectEnrichment'

const { t } = useI18n()
const { sheets: sheetsApi } = useApi()

interface Props {
  model: IModel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update': []
  'sheet-updated': [sheet: ISheet]
}>()

// Reactive state
const sheets = ref<SheetWithRelations[]>([])
const availableSheets = ref<SheetWithRelations[]>([])
const loading = ref(false)
const modalLoading = ref(false)
const showAddModal = ref(false)
const showViewModal = ref(false)
const viewingSheet = ref<SheetWithRelations | null>(null)

// Computed properties
const canHaveSheets = computed(() => {
  return props.model.modelType === 'PART' || props.model.modelType === 'ASSEMBLY'
})

const existingSheetIds = computed(() => {
  return sheets.value.map(sheet => sheet.id).filter(Boolean) as number[]
})

const hasAvailableSheets = computed(() => {
  return availableSheets.value.length > existingSheetIds.value.length
})

// Methods
const loadModelSheets = async (): Promise<void> => {
  if (!props.model.id) return
  
  loading.value = true
  try {
    console.log(`[ModelSheetsAssoc] Loading sheets for model ${props.model.id} (${props.model.code})`)
    
    // Always search through all sheets for most up-to-date associations
    const allSheetsResponse = await sheetsApi.getAll()
    
    if (allSheetsResponse.success) {
      const allSheets = allSheetsResponse.data || []
      
      // Find sheets that reference this model
      const modelSheets = allSheets.filter(sheet => {
        if (sheet.models && Array.isArray(sheet.models)) {
          return sheet.models.some((sheetModel: any) => {
            const sheetModelId = typeof sheetModel === 'object' ? sheetModel.id : sheetModel
            return sheetModelId === props.model.id
          })
        }
        return false
      })
      
      // Enrich partial sheet data if we have model sheets from props
      let enrichedSheets = modelSheets
      
      if (props.model.sheets && Array.isArray(props.model.sheets) && props.model.sheets.length > 0) {
        console.log(`[ModelSheetsAssoc] Enriching ${props.model.sheets.length} partial sheets with complete data`)
        enrichedSheets = enrichPartialSheets(props.model.sheets, allSheets)
        debugLogObject(enrichedSheets[0], 'First enriched sheet')
      }
      
      sheets.value = enrichedSheets
      console.log(`[ModelSheetsAssoc] Loaded ${sheets.value.length} sheets for model ${props.model.id}`)
      
      // Debug log each sheet
      sheets.value.forEach((sheet, index) => {
        debugLogObject(sheet, `Sheet ${index + 1}`)
      })
    } else {
      console.error('[ModelSheetsAssoc] Failed to load sheets:', allSheetsResponse.error)
      sheets.value = []
    }
  } catch (error) {
    console.error('[ModelSheetsAssoc] Error loading model sheets:', error)
    sheets.value = []
  } finally {
    loading.value = false
  }
}

const loadAvailableSheets = async (): Promise<void> => {
  try {
    const response = await sheetsApi.getAll()
    if (response.success) {
      availableSheets.value = response.data || []
      console.log(`[ModelSheetsAssoc] Loaded ${availableSheets.value.length} available sheets`)
    }
  } catch (error) {
    console.error('[ModelSheetsAssoc] Error loading available sheets:', error)
    availableSheets.value = []
  }
}

const handleAddSheets = async (selectedSheetIds: number[]): Promise<void> => {
  if (!props.model.id || selectedSheetIds.length === 0) return

  modalLoading.value = true
  try {
    console.log(`[ModelSheetsAssoc] Adding ${selectedSheetIds.length} sheets to model ${props.model.id}`)
    
    // Process each selected sheet
    for (const sheetId of selectedSheetIds) {
      const targetSheet = availableSheets.value.find(s => s.id === sheetId)
      if (!targetSheet) {
        console.warn(`[ModelSheetsAssoc] Could not find sheet with ID ${sheetId}`)
        continue
      }

      // Get current models associated with this sheet
      const currentModels = targetSheet.models || []
      const currentModelIds = currentModels.map(m => 
        typeof m === 'object' ? m.id : m
      ).filter(Boolean)
      
      // Skip if already associated
      if (currentModelIds.includes(props.model.id)) {
        console.log(`[ModelSheetsAssoc] Model ${props.model.id} already associated to sheet ${sheetId}`)
        continue
      }

      // Validate and create clean model object to add
      if (!validateObjectForUpdate(props.model, 'Model')) {
        console.error('[ModelSheetsAssoc] Invalid model for association:', props.model)
        continue
      }
      
      const modelToAdd = createCleanModelForUpdate(props.model)
      debugLogObject(modelToAdd, 'Model to add')

      // Create updated models array
      const updatedModels = [...currentModels, modelToAdd]

      // Validate target sheet and create update payload with complete data preservation
      if (!validateObjectForUpdate(targetSheet, 'Target Sheet')) {
        console.error('[ModelSheetsAssoc] Invalid target sheet for update:', targetSheet)
        continue
      }
      
      const updatePayload = {
        ...createCleanSheetForUpdate(targetSheet),
        models: updatedModels               // Add new model
      }
      
      debugLogObject(updatePayload, 'Sheet update payload')

      console.log(`[ModelSheetsAssoc] Updating sheet ${sheetId} with payload:`, updatePayload)
      const updateResponse = await sheetsApi.update(sheetId, updatePayload)
      
      if (!updateResponse.success) {
        console.error(`[ModelSheetsAssoc] Failed to update sheet ${sheetId}:`, updateResponse.error)
        throw new Error(`Failed to update sheet ${targetSheet.code}: ${updateResponse.error}`)
      }
      
      console.log(`[ModelSheetsAssoc] Successfully added model to sheet ${sheetId}`)
    }

    // Close modal and refresh data
    closeAddModal()
    await loadModelSheets()
    emit('update')
    
    console.log(`[ModelSheetsAssoc] Successfully associated ${selectedSheetIds.length} sheets`)
    
  } catch (error) {
    console.error('[ModelSheetsAssoc] Error adding sheets:', error)
    alert(`Error adding sheets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    modalLoading.value = false
  }
}

const confirmRemoveAssociation = async (sheet: SheetWithRelations): Promise<void> => {
  const sheetName = sheet.name || sheet.code || `Sheet ${sheet.id}`
  const modelName = props.model.name || props.model.code || `Model ${props.model.id}`
  
  const confirmed = confirm(
    t('models:sheets.confirmRemoveAssociation', { 
      sheetName, 
      modelName 
    })
  )
  
  if (!confirmed) return

  try {
    console.log(`[ModelSheetsAssoc] Removing model ${props.model.id} from sheet ${sheet.id}`)
    
    // Remove this model from the sheet's models array
    const currentModels = sheet.models || []
    const updatedModels = currentModels.filter(model => {
      const modelId = typeof model === 'object' ? model.id : model
      return modelId !== props.model.id
    })

    // Validate sheet and create update payload preserving all other data
    if (!validateObjectForUpdate(sheet, 'Sheet for model removal')) {
      console.error('[ModelSheetsAssoc] Invalid sheet for model removal:', sheet)
      return
    }
    
    const updatePayload = {
      ...createCleanSheetForUpdate(sheet),
      models: updatedModels         // Remove the model
    }
    
    debugLogObject(updatePayload, 'Model removal payload')

    console.log(`[ModelSheetsAssoc] Removing association with payload:`, updatePayload)
    const response = await sheetsApi.update(sheet.id!, updatePayload)
    
    if (response.success) {
      await loadModelSheets()
      emit('update')
      console.log(`[ModelSheetsAssoc] Successfully removed association`)
    } else {
      console.error('[ModelSheetsAssoc] Failed to remove association:', response.error)
      alert(`Failed to remove association: ${response.error}`)
    }
  } catch (error) {
    console.error('[ModelSheetsAssoc] Error removing association:', error)
    alert(`Error removing association: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

const viewSheet = (sheet: SheetWithRelations): void => {
  viewingSheet.value = sheet
  showViewModal.value = true
}

const editSheetAssociation = (sheet: SheetWithRelations): void => {
  // Navigate to sheets page with this sheet selected for editing
  navigateTo(`/dashboard/sheets?edit=${sheet.id}`)
}

const closeAddModal = (): void => {
  showAddModal.value = false
}

const closeViewModal = (): void => {
  showViewModal.value = false
  viewingSheet.value = null
}

const getDrawingDisplayName = (drawing: any): string => {
  if (!drawing) return 'No Drawing'
  
  if (typeof drawing === 'object') {
    return drawing.name || drawing.code || `Drawing ${drawing.id}`
  }
  
  return `Drawing ID: ${drawing}`
}

// Lifecycle
onMounted(async () => {
  console.log('[ModelSheetsAssoc] Component mounted for model:', props.model.code)
  await loadAvailableSheets()
  await loadModelSheets()
})

// Watch for model changes
watch(() => props.model.id, async (newId) => {
  if (newId) {
    if (availableSheets.value.length === 0) {
      await loadAvailableSheets()
    }
    await loadModelSheets()
  }
})
</script>

<style scoped>
.model-sheets-association-manager {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.header-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.75rem;
}

.model-info h6 {
  color: #495057;
  margin-bottom: 0.25rem;
}

.sheet-card {
  background: white;
  transition: all 0.2s ease;
}

.sheet-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.empty-state {
  background: white;
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.sheets-list {
  max-height: 400px;
  overflow-y: auto;
}

.sheet-details {
  line-height: 1.4;
}

.sheet-details div {
  margin-bottom: 0.25rem;
}

.header-actions .alert {
  font-size: 0.75rem;
  max-width: 250px;
}

@media (max-width: 768px) {
  .header-section .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .header-actions {
    margin-top: 0.75rem;
  }
  
  .sheet-card .row {
    flex-direction: column;
  }
  
  .sheet-card .col-md-4 {
    text-align: left !important;
    margin-top: 0.75rem;
  }
}
</style>