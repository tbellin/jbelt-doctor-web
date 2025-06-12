<template>
  <div v-if="show" class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-earmark-plus me-2"></i>
            {{ t('models:sheets.addSheetsToModel') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <!-- Info del modello -->
          <div class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle me-2"></i>
              <div>
                <strong>{{ t('models:sheets.addingToModel') }}:</strong>
                <span class="ms-2">{{ model.name }} ({{ model.code }})</span>
                <div class="small text-muted">
                  {{ t('models:sheets.modelType') }}: {{ model.modelType }}
                </div>
              </div>
            </div>
          </div>

          <!-- Filtri -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">{{ t('common:search') }}</label>
              <input 
                v-model="searchTerm"
                type="text" 
                class="form-control"
                :placeholder="t('models:sheets.searchSheets')"
              >
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ t('sheets:formatType') }}</label>
              <select v-model="selectedFormat" class="form-select">
                <option value="">{{ t('common:all') }}</option>
                <option v-for="format in availableFormats" :key="format" :value="format">
                  {{ format }}
                </option>
              </select>
            </div>
          </div>

          <!-- Lista fogli disponibili -->
          <div class="available-sheets" style="max-height: 400px; overflow-y: auto;">
            <div v-if="filteredSheets.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-search fs-1 opacity-25"></i>
              <p class="mb-0">{{ t('models:sheets.noSheetsFound') }}</p>
            </div>
            
            <div v-else>
              <div class="form-check mb-2">
                <input 
                  id="selectAll"
                  type="checkbox" 
                  class="form-check-input"
                  :checked="allVisibleSelected"
                  :indeterminate="someVisibleSelected"
                  @change="toggleSelectAll"
                >
                <label for="selectAll" class="form-check-label fw-bold">
                  {{ t('common:selectAll') }} ({{ filteredSheets.length }})
                </label>
              </div>
              
              <hr>
              
              <div 
                v-for="sheet in filteredSheets" 
                :key="sheet.id"
                class="form-check sheet-option p-2 border rounded mb-2"
                :class="{ 
                  'bg-light': isAlreadyAssociated(sheet),
                  'border-success': selectedSheetIds.includes(sheet.id!)
                }"
              >
                <input 
                  :id="`sheet-${sheet.id}`"
                  type="checkbox" 
                  class="form-check-input"
                  :value="sheet.id"
                  v-model="selectedSheetIds"
                  :disabled="isAlreadyAssociated(sheet)"
                >
                <label :for="`sheet-${sheet.id}`" class="form-check-label w-100">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="sheet-info">
                      <strong class="text-primary">{{ sheet.code }}</strong>
                      <span class="text-muted ms-2">{{ sheet.name }}</span>
                      <div class="small text-muted">
                        <i class="bi bi-rulers me-1"></i>{{ sheet.formatType }}
                        <span v-if="sheet.drawing" class="ms-2">
                          <i class="bi bi-image me-1"></i>{{ getDrawingInfo(sheet.drawing) }}
                        </span>
                        <span v-if="sheet.models && sheet.models.length > 0" class="ms-2">
                          <i class="bi bi-gear me-1"></i>{{ sheet.models.length }} {{ t('models:sheets.associatedModels') }}
                        </span>
                      </div>
                      <div v-if="isAlreadyAssociated(sheet)" class="small text-success">
                        <i class="bi bi-check-circle me-1"></i>{{ t('models:sheets.alreadyAssociated') }}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="me-auto">
            <small class="text-muted">
              {{ t('models:sheets.selectedCount', { count: selectedSheetIds.length }) }}
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
import type { Model } from '~/types/model'
import type { SheetWithRelations } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'
import { getAvailableFormats } from '~/utils/formats'

const { t } = useI18n()

interface Props {
  show: boolean
  model: Model
  existingSheets: SheetWithRelations[]
  availableSheets: SheetWithRelations[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'add': [sheetIds: number[]]
}>()

const selectedSheetIds = ref<number[]>([])
const searchTerm = ref('')
const selectedFormat = ref('')

// Formati disponibili - lista completa predefinita + formati esistenti
const availableFormats = computed(() => {
  const existingFormats = props.availableSheets.map(sheet => sheet.formatType)
  return getAvailableFormats(existingFormats)
})

// Fogli filtrati
const filteredSheets = computed(() => {
  let sheets = props.availableSheets

  // Filtro per ricerca
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    sheets = sheets.filter(sheet => 
      sheet.code?.toLowerCase().includes(term) ||
      sheet.name?.toLowerCase().includes(term)
    )
  }

  // Filtro per formato
  if (selectedFormat.value) {
    sheets = sheets.filter(sheet => sheet.formatType === selectedFormat.value)
  }

  return sheets.sort((a, b) => (a.code || '').localeCompare(b.code || ''))
})

// Controlla se un foglio è già associato
const isAlreadyAssociated = (sheet: SheetWithRelations): boolean => {
  return props.existingSheets.some(existing => existing.id === sheet.id)
}

// Gestione selezione tutti
const allVisibleSelected = computed(() => {
  const selectableSheets = filteredSheets.value.filter(sheet => !isAlreadyAssociated(sheet))
  return selectableSheets.length > 0 && 
         selectableSheets.every(sheet => selectedSheetIds.value.includes(sheet.id!))
})

const someVisibleSelected = computed(() => {
  const selectableSheets = filteredSheets.value.filter(sheet => !isAlreadyAssociated(sheet))
  const selectedCount = selectableSheets.filter(sheet => selectedSheetIds.value.includes(sheet.id!)).length
  return selectedCount > 0 && selectedCount < selectableSheets.length
})

const toggleSelectAll = () => {
  const selectableSheets = filteredSheets.value.filter(sheet => !isAlreadyAssociated(sheet))
  
  if (allVisibleSelected.value) {
    // Deseleziona tutti
    selectedSheetIds.value = selectedSheetIds.value.filter(id => 
      !selectableSheets.some(sheet => sheet.id === id)
    )
  } else {
    // Seleziona tutti
    const newSelections = selectableSheets
      .map(sheet => sheet.id!)
      .filter(id => !selectedSheetIds.value.includes(id))
    selectedSheetIds.value = [...selectedSheetIds.value, ...newSelections]
  }
}

// Gestisce l'aggiunta
const handleAdd = () => {
  if (selectedSheetIds.value.length === 0) return
  emit('add', [...selectedSheetIds.value])
}

// Helper per info disegno
const getDrawingInfo = (drawing: any): string => {
  if (typeof drawing === 'object' && drawing.name) {
    return drawing.name
  }
  return `Drawing ID: ${drawing}`
}

// Reset quando si apre/chiude il modal
watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedSheetIds.value = []
    searchTerm.value = ''
    selectedFormat.value = ''
  }
})
</script>

<style scoped>
.sheet-option {
  cursor: pointer;
  transition: all 0.2s ease;
}

.sheet-option:hover:not(.bg-light) {
  background-color: #f8f9fa !important;
}

.sheet-option.border-success {
  border-color: #198754 !important;
  background-color: #d1e7dd !important;
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

.form-check-input:indeterminate {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>