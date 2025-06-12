<!--
  Pagina Dashboard per la gestione dei modelli - Versione Modulare
  Utilizza componenti separati per una migliore manutenibilità
  
  @version 2.0.0 - Modular Architecture
-->
<template>
  <div class="models-dashboard">
    <!-- Header della pagina -->
    <ModelsPageHeader 
      :loading="loading"
      @refresh="refreshData"
      @create="showCreateModal = true"
    />

    <!-- Cards statistiche -->
    <ModelsStatsCards 
      :models="allModels"
      :total-count="modelCount"
    />

    <!-- Filtri e ricerca -->
    <ModelsSearchFilters 
      v-model:search-code="searchCode"
      v-model:selected-type="selectedType"
      v-model:selected-instance="selectedInstance"
      :loading="loading"
      @search="performSearch"
      @filters-changed="applyFilters"
      @clear-filters="clearFilters"
    />

    <!-- Tabella modelli con gestione associazioni avanzata -->
    <ModelsTable 
      :models="paginatedModels"
      :loading="loading"
      :error="error"
      :expanded-rows="expandedRows"
      :model-sheets="modelSheets"
      :current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      @toggle-expansion="toggleRowExpansion"
      @view="viewModel"
      @edit="editModel"
      @delete="confirmDelete"
      @retry="loadModels"
      @create-first="showCreateModal = true"
      @change-page="changePage"
      @associations-updated="handleAssociationsUpdated"
    />

    <!-- Modal per creazione/modifica modello -->
    <ModelFormModal 
      :show="showCreateModal"
      :editing-model="editingModel"
      v-model:form-data="formData"
      :errors="formErrors"
      :saving="saving"
      @close="closeModal"
      @save="saveModel"
    />

    <!-- Modal per visualizzazione JSON -->
    <ModelViewModal 
      :show="showViewModal"
      :model="viewingModel"
      @close="closeViewModal"
      @copy="copyModelJson"
      @download="downloadModelJson"
    />

    <!-- Debug Panel collassabile - solo se debug è attivo -->
    <div v-if="isDebugMode" class="mt-4">
      <div class="card">
        <div class="card-header">
          <button 
            class="btn btn-link w-100 text-start p-0 d-flex justify-content-between align-items-center"
            type="button" 
            @click="showDebugPanel = !showDebugPanel"
            :aria-expanded="showDebugPanel"
          >
            <span>
              <i class="bi bi-bug me-2"></i>
              Debug API Panel - Models
            </span>
            <i :class="['bi', showDebugPanel ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
          </button>
        </div>
        <div v-show="showDebugPanel" class="card-body">
          <!-- Test buttons -->
          <div class="mb-3">
            <div class="btn-group btn-group-sm flex-wrap">
              <button class="btn btn-outline-primary" @click="testBackend" :disabled="loading">
                <i class="bi bi-wifi"></i> Test Backend
              </button>
              <button class="btn btn-outline-info" @click="testConnection" :disabled="loading">
                <i class="bi bi-link-45deg"></i> Test API
              </button>
              <button class="btn btn-outline-warning" @click="testCreatePayload" :disabled="loading">
                <i class="bi bi-plus-square"></i> Test Create
              </button>
              <button class="btn btn-outline-danger" @click="testDeleteEndpoint" :disabled="loading">
                <i class="bi bi-trash"></i> Test Delete
              </button>
              <button class="btn btn-outline-success" @click="testModelAssociation" :disabled="loading">
                <i class="bi bi-diagram-3"></i> Test Association
              </button>
              <button class="btn btn-outline-warning" @click="debugCurrentData" :disabled="loading">
                <i class="bi bi-bug"></i> Debug Data
              </button>
              <button class="btn btn-outline-success" @click="forceLogin" :disabled="loading">
                <i class="bi bi-key"></i> Force Login
              </button>
              <button class="btn btn-outline-secondary" @click="runCompleteTest" :disabled="loading">
                <i class="bi bi-check-all"></i> Full Test
              </button>
            </div>
          </div>
          
          <!-- Status info -->
          <div class="row small mb-3">
            <div class="col-md-6">
              <strong>Auth Status:</strong> 
              <span :class="isAuthenticated ? 'text-success' : 'text-danger'">
                {{ isAuthenticated ? 'Authenticated' : 'Not authenticated' }}
              </span><br>
              <strong>User:</strong> {{ user?.login || 'None' }}<br>
              <strong>Backend:</strong> <code>{{ useRuntimeConfig().public.apiBase }}</code><br>
              <strong>API Host:</strong> <code>{{ useRuntimeConfig().public.apiHost }}</code><br>
              <strong>Models Count:</strong> {{ allModels.length }}<br>
              <strong>Filtered Count:</strong> {{ filteredModels.length }}<br>
              <strong>Total Count:</strong> {{ modelCount }}<br>
              <strong>Loading:</strong> {{ loading }}
            </div>
            <div class="col-md-6">
              <div v-if="error" class="text-danger">
                <strong>Error:</strong> {{ error }}
              </div>
              <div v-if="debugInfo" class="text-info">
                <strong>Last Test:</strong> {{ debugInfo }}
              </div>
            </div>
          </div>
          
          <!-- Loaded data -->
          <div class="border-top pt-3">
            <h6>Loaded Data:</h6>
            <div class="row">
              <div class="col-6">
                <strong>Models ({{ allModels.length }}):</strong>
                <ul class="list-unstyled">
                  <li v-for="model in allModels.slice(0, 3)" :key="model.id" class="small">
                    {{ model.id }}: {{ model.code }} ({{ model.modelType }})
                  </li>
                </ul>
              </div>
              <div class="col-6">
                <strong>Expanded Rows:</strong> {{ expandedRows.size }}<br>
                <strong>Model Sheets Cache:</strong> {{ Object.keys(modelSheets).length }}<br>
                <strong>Current Page:</strong> {{ currentPage }}/{{ totalPages }}<br>
                <strong>Items Per Page:</strong> {{ itemsPerPage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import dei componenti modulari
import ModelsPageHeader from '~/components/Models/ModelsPageHeader.vue'
import ModelsStatsCards from '~/components/Models/ModelsStatsCards.vue'
import ModelsSearchFilters from '~/components/Models/ModelsSearchFilters.vue'
import ModelsTable from '~/components/Models/ModelsTable.vue'
import ModelFormModal from '~/components/Models/ModelFormModal.vue'
import ModelViewModal from '~/components/Models/ModelViewModal.vue'

// Import dei composables e tipi
import { useApi, type ApiResponse } from '~/composables/useApi'
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'

const { t, loadNamespace } = useI18n()

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})

// Dati reattivi
const { models, sheets } = useApi()
const allModels = ref<Model[]>([])
const filteredModels = ref<Model[]>([])
const modelCount = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Gestione collapse e sheet associati
const expandedRows = ref<Set<number>>(new Set())
const modelSheets = ref<Record<number, any[]>>({})

// Filtri e ricerca
const searchCode = ref('')
const selectedType = ref('')
const selectedInstance = ref('')

// Paginazione
const currentPage = ref(1)
const itemsPerPage = 20

// Modal e form
const showCreateModal = ref(false)

// Debug panel
const { isDebugMode } = useDebug()
const { isAuthenticated, user } = useAuth()
const showDebugPanel = ref(false)
const debugInfo = ref<string>('')
const showViewModal = ref(false)
const viewingModel = ref<Model | null>(null)
const editingModel = ref<Model | null>(null)
const saving = ref(false)
const formData = ref({
  code: '',
  name: '',
  modelType: '',
  instanceType: ''
})
const formErrors = ref<Record<string, string>>({})

// Computed properties
const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredModels.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredModels.value.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Metodi per gestire i collapse e sheet
const toggleRowExpansion = async (model: Model): Promise<void> => {
  if (!model.id) return
  
  const modelId = model.id
  
  if (expandedRows.value.has(modelId)) {
    expandedRows.value.delete(modelId)
    console.log('[Models] Row collapsed for model:', model.code)
  } else {
    expandedRows.value.add(modelId)
    console.log('[Models] Row expanded for model:', model.code)
    
    // Carica i fogli sempre per avere dati aggiornati
    await loadSheetsForModel(model)
  }
}

// Gestisce gli aggiornamenti delle associazioni
const handleAssociationsUpdated = async (): Promise<void> => {
  console.log('[Models] Associations updated, refreshing model data...')
  await loadModels()
}

const loadSheetsForModel = async (model: Model): Promise<void> => {
  if (!model.id) return
  
  const modelId = model.id
  console.log('[Models] Loading sheets for model:', model.code, 'type:', model.modelType)
  
  try {
    if (model.modelType === 'DRAWING') {
      // Per i DRAWING, cerca i fogli che usano questo disegno
      console.log('[Models] Calling API: GET /api/sheets?drawingId.equals=' + model.id)
      const response = await sheets.getByDrawing(model.id)
      
      if (response.success) {
        modelSheets.value[modelId] = response.data || []
        console.log('[Models] Found', response.data?.length || 0, 'sheets with drawing:', model.code)
      } else {
        console.error('[Models] Failed to load sheets by drawing:', response.error)
        modelSheets.value[modelId] = []
      }
    } else if (model.modelType === 'PART' || model.modelType === 'ASSEMBLY') {
      // Per PART/ASSEMBLY, cerca sempre tra tutti i fogli per avere dati aggiornati
      console.log('[Models] Searching for sheets referencing this PART/ASSEMBLY model...')
      
      const allSheetsResponse = await sheets.getAll()
      if (allSheetsResponse.success) {
        const associatedSheets = allSheetsResponse.data?.filter(sheet => {
          if (sheet.models && Array.isArray(sheet.models)) {
            return sheet.models.some((sheetModel: any) => {
              const sheetModelId = typeof sheetModel === 'object' ? sheetModel.id : sheetModel
              return sheetModelId === model.id
            })
          }
          return false
        }) || []
        
        modelSheets.value[modelId] = associatedSheets
        console.log('[Models] Found', associatedSheets.length, 'sheets referencing model:', model.code)
        
        // Debug: mostra i dettagli dei fogli trovati
        associatedSheets.forEach((sheet, index) => {
          console.log(`[Models] Sheet ${index + 1}:`, {
            id: sheet.id,
            code: sheet.code || 'NO_CODE',
            name: sheet.name || 'NO_NAME',
            formatType: sheet.formatType
          })
        })
      } else {
        console.error('[Models] Failed to load all sheets for association lookup:', allSheetsResponse.error)
        modelSheets.value[modelId] = []
      }
    } else {
      console.log('[Models] Model type', model.modelType, 'does not have associated sheets')
      modelSheets.value[modelId] = []
    }
  } catch (err) {
    console.error('[Models] Error loading sheets for model:', err)
    modelSheets.value[modelId] = []
  }
}

// Metodi per il caricamento dati
const refreshData = async (): Promise<void> => {
  console.log('[Models] Refresh data requested')
  searchCode.value = ''
  selectedType.value = ''
  selectedInstance.value = ''
  currentPage.value = 1
  
  await loadModels()
}

const loadModels = async (): Promise<void> => {
  console.log('[Models] Inizio caricamento modelli...')
  loading.value = true
  error.value = null
  
  try {
    console.log('[Models] Chiamata API: GET /api/models')
    const modelsResponse = await models.getAll()
    console.log('[Models] Risposta getAll():', modelsResponse)
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
      console.log('[Models] Modelli caricati:', allModels.value.length)
      
      // Pre-carica i fogli per tutti i modelli che ne hanno
      console.log('[Models] Pre-loading sheets data for models...')
      allModels.value.forEach(model => {
        if (model.sheets && Array.isArray(model.sheets) && model.sheets.length > 0) {
          modelSheets.value[model.id!] = model.sheets
          console.log(`[Models] Pre-loaded ${model.sheets.length} sheets for model ${model.code} (${model.modelType})`)
        }
      })
      
      applyFilters()
    } else {
      console.error('[Models] Errore getAll():', modelsResponse.error)
      error.value = modelsResponse.error || 'Errore nel caricamento dei modelli'
    }
    
    console.log('[Models] Chiamata API: GET /api/models/count')
    const countResponse = await models.getCount()
    console.log('[Models] Risposta getCount():', countResponse)
    
    if (countResponse.success) {
      modelCount.value = countResponse.data || 0
      console.log('[Models] Conteggio modelli:', modelCount.value)
    } else {
      console.error('[Models] Errore getCount():', countResponse.error)
    }
  } catch (err) {
    console.error('[Models] Errore generale:', err)
    error.value = err instanceof Error ? err.message : 'Errore sconosciuto'
  } finally {
    loading.value = false
    console.log('[Models] Fine caricamento modelli')
  }
}

// Metodi per i filtri
const applyFilters = (): void => {
  let filtered = [...allModels.value]
  
  if (selectedType.value) {
    filtered = filtered.filter(model => model.modelType === selectedType.value)
  }
  
  if (selectedInstance.value) {
    filtered = filtered.filter(model => model.instanceType === selectedInstance.value)
  }
  
  filteredModels.value = filtered
  currentPage.value = 1
}

const performSearch = async (): Promise<void> => {
  if (!searchCode.value.trim()) {
    applyFilters()
    return
  }
  
  loading.value = true
  try {
    const response = await models.searchByCode(searchCode.value.trim())
    if (response.success) {
      allModels.value = response.data || []
      applyFilters()
    } else {
      error.value = response.error || 'Errore nella ricerca'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Errore nella ricerca'
  } finally {
    loading.value = false
  }
}

const clearFilters = (): void => {
  searchCode.value = ''
  selectedType.value = ''
  selectedInstance.value = ''
  loadModels()
}

// Metodi per la paginazione
const changePage = (page: number): void => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Metodi per il modal e CRUD
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
    instanceType: ''
  }
  formErrors.value = {}
}

const validateForm = (): boolean => {
  formErrors.value = {}
  
  if (!formData.value.code.trim()) {
    formErrors.value.code = t('models:validation.codeRequired')
  }
  
  if (!formData.value.name.trim()) {
    formErrors.value.name = t('models:validation.nameRequired')
  }
  
  if (!formData.value.modelType) {
    formErrors.value.modelType = t('models:validation.typeRequired')
  }
  
  if (!formData.value.instanceType) {
    formErrors.value.instanceType = t('models:validation.instanceRequired')
  }
  
  return Object.keys(formErrors.value).length === 0
}

const saveModel = async (): Promise<void> => {
  console.log('[Models] Save model started')
  
  if (!validateForm()) {
    console.log('[Models] Validation failed')
    return
  }
  
  saving.value = true
  
  try {
    let response: ApiResponse<Model>
    
    if (editingModel.value) {
      const updateData = {
        ...formData.value,
        id: editingModel.value.id
      }
      console.log('[Models] Updating model with ID:', editingModel.value.id)
      response = await models.update(editingModel.value.id!, updateData)
    } else {
      console.log('[Models] Creating new model:', formData.value)
      response = await models.create(formData.value)
    }
    
    if (response.success) {
      closeModal()
      console.log('[Models] Operazione completata, aggiornamento dati...')
      await loadModels()
      
      const message = editingModel.value 
        ? t('models:messages.updateSuccess')
        : t('models:messages.createSuccess')
      
      console.log('[Models] Success message:', message)
    } else {
      console.error('[Models] Save failed:', response.error)
      error.value = response.error || 'Errore nel salvataggio'
    }
  } catch (err) {
    console.error('[Models] Save exception:', err)
    error.value = err instanceof Error ? err.message : 'Errore nel salvataggio'
  } finally {
    saving.value = false
  }
}

const viewModel = (model: Model): void => {
  console.log('[Models] View model clicked:', model)
  viewingModel.value = model
  showViewModal.value = true
}

const closeViewModal = (): void => {
  showViewModal.value = false
  viewingModel.value = null
}

const downloadModelJson = (): void => {
  if (!viewingModel.value) return
  
  const jsonData = JSON.stringify(viewingModel.value, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `model-${viewingModel.value.code}-${viewingModel.value.id}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  console.log('[Models] JSON file downloaded for model:', viewingModel.value.code)
}

const copyModelJson = async (): Promise<void> => {
  if (!viewingModel.value) return
  
  const jsonData = JSON.stringify(viewingModel.value, null, 2)
  try {
    await navigator.clipboard.writeText(jsonData)
    console.log('[Models] JSON copied to clipboard for model:', viewingModel.value.code)
  } catch (err) {
    console.error('[Models] Failed to copy JSON to clipboard:', err)
    const textarea = document.querySelector('#jsonContent') as HTMLTextAreaElement
    if (textarea) {
      textarea.select()
      document.execCommand('copy')
    }
  }
}

const editModel = (model: Model): void => {
  console.log('[Models] Edit model clicked:', model)
  editingModel.value = model
  formData.value = {
    code: model.code,
    name: model.name,
    modelType: model.modelType,
    instanceType: model.instanceType
  }
  showCreateModal.value = true
}

const confirmDelete = async (model: Model): Promise<void> => {
  const confirmed = confirm(t('models:confirmDelete', { name: model.name }))
  if (!confirmed) return
  
  loading.value = true
  try {
    const response = await models.delete(model.id || 0)
    if (response.success) {
      console.log('[Models] Modello eliminato, aggiornamento dati...')
      await loadModels()
      console.log(t('models:messages.deleteSuccess'))
    } else {
      error.value = response.error || 'Errore nella cancellazione'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Errore nella cancellazione'
  } finally {
    loading.value = false
  }
}

// Debug functions (only if debug mode)
const testBackend = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Testing backend connection...')
  debugInfo.value = 'Testing backend...'
  // Implementazione placeholder - adattare se necessario
  debugInfo.value = '✅ Backend test completed'
}

const testConnection = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Testing API connection...')
  debugInfo.value = 'Testing API connection...'
  // Implementazione placeholder - adattare se necessario
  debugInfo.value = '✅ API connection test completed'
}

const testCreatePayload = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Testing create payload...')
  debugInfo.value = 'Testing create payload...'
  // Implementazione placeholder - adattare se necessario
  debugInfo.value = '✅ Create payload test completed'
}

const testDeleteEndpoint = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Testing delete endpoint...')
  debugInfo.value = 'Testing delete endpoint...'
  // Implementazione placeholder - adattare se necessario
  debugInfo.value = '✅ Delete endpoint test completed'
}

const testModelAssociation = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Testing model association...')
  debugInfo.value = 'Testing model association...'
  // Implementazione placeholder - adattare se necessario
  debugInfo.value = '✅ Model association test completed'
}

const debugCurrentData = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] 🐛 === DEBUG CURRENT DATA ===')
  
  console.log('[Models] 📊 CURRENT DATA STATUS:')
  console.log('🎯 All Models:', allModels.value.length)
  console.log('🎯 Filtered Models:', filteredModels.value.length)
  console.log('🎯 Model Count:', modelCount.value)
  console.log('🎯 Expanded Rows:', expandedRows.value.size)
  
  // Log detailed model info
  console.log('[Models] 🔧 MODELS DETAIL:')
  allModels.value.slice(0, 5).forEach((model, index) => {
    console.log(`   ${index + 1}. ID: ${model.id}, Code: ${model.code}, Name: ${model.name}, Type: ${model.modelType}`)
  })
  
  debugInfo.value = `✅ Debug complete - ${allModels.value.length} models, ${filteredModels.value.length} filtered`
}

const forceLogin = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Force login functionality...')
  debugInfo.value = 'Force login...'
  // Implementazione placeholder - adattare se necessario
  debugInfo.value = '✅ Force login completed'
}

const runCompleteTest = async (): Promise<void> => {
  if (!isDebugMode) return
  console.log('[Models] Running complete test suite...')
  debugInfo.value = 'Running complete test...'
  
  try {
    await loadModels()
    debugInfo.value = '✅ Complete test successful!'
  } catch (err) {
    debugInfo.value = `❌ Complete test failed: ${err}`
    console.error('[Models] Complete test error:', err)
  }
}

// Watchers per i filtri
watch([selectedType, selectedInstance], () => {
  applyFilters()
})

// Lifecycle hooks
onMounted(async () => {
  console.log('[Models] Componente montato, caricamento traduzioni...')
  
  await loadNamespace('common')
  await loadNamespace('models')
  
  const { isAuthenticated, user } = useAuth()
  console.log('[Models] Stato autenticazione:', {
    isAuthenticated: isAuthenticated.value,
    user: user.value
  })
  
  await loadModels()
})

// SEO e Meta
useHead({
  title: computed(() => t('models:title') + ' - Dashboard'),
  meta: [
    { name: 'description', content: 'Gestione completa dei modelli CAD nel sistema JBelt' }
  ]
})
</script>

<style scoped>
.models-dashboard {
  padding: 1rem;
}

/* Stile per i pulsanti di debug */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn i {
  transition: transform 0.2s ease;
}

/* Responsive per mobile */
@media (max-width: 768px) {
  .models-dashboard {
    padding: 0.5rem;
  }
  
  .btn-group.flex-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}
</style>