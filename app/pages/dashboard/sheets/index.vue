<!--
  Pagina Dashboard per la gestione degli sheet - Versione Modulare
  Utilizza componenti separati per una migliore manutenibilità
  
  @version 1.0.0 - Modular Architecture
-->
<template>
  <div class="sheets-dashboard">
    <!-- Header della pagina -->
    <SheetsPageHeader 
      :loading="loading"
      @refresh="refreshData"
      @create="showCreateModal = true"
    />

    <!-- Cards statistiche -->
    <SheetsStatsCards 
      :sheets="allSheets"
      :total-count="sheetCount"
    />

    <!-- Filtri e ricerca -->
    <SheetsSearchFilters 
      v-model:search-code="searchCode"
      v-model:search-name="searchName"
      v-model:selected-format="selectedFormat"
      v-model:selected-drawing="selectedDrawing"
      :available-formats="availableFormats"
      :loading="loading"
      @search="performSearchByCode"
      @search-by-name="performSearchByName"
      @filters-changed="applyFilters"
      @clear-filters="clearFilters"
    />

    <!-- Tabella sheet -->
    <SheetsTable 
      :sheets="paginatedSheets"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      @view="viewSheet"
      @edit="editSheet"
      @delete="confirmDelete"
      @retry="loadSheets"
      @create-first="showCreateModal = true"
      @change-page="changePage"
    />

    <!-- Modal per creazione/modifica sheet -->
    <SheetFormModal 
      :show="showCreateModal"
      :editing-sheet="editingSheet"
      v-model:form-data="formData"
      :errors="formErrors"
      :available-formats="availableFormats"
      :available-drawings="availableDrawings"
      :available-models="availableModels"
      :saving="saving"
      @close="closeModal"
      @save="saveSheet"
    />

    <!-- Modal per visualizzazione JSON -->
    <SheetViewModal 
      :show="showViewModal"
      :sheet="viewingSheet"
      @close="closeViewModal"
      @copy="copySheetJson"
      @download="downloadSheetJson"
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
              Debug API Panel - Sheets
            </span>
            <i :class="['bi', showDebugPanel ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
          </button>
        </div>
        <div v-show="showDebugPanel" class="card-body p-0">
          <ApiDebugPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import dei componenti modulari
import SheetsPageHeader from '~/components/Sheets/SheetsPageHeader.vue'
import SheetsStatsCards from '~/components/Sheets/SheetsStatsCards.vue'
import SheetsSearchFilters from '~/components/Sheets/SheetsSearchFilters.vue'
import SheetsTable from '~/components/Sheets/SheetsTable.vue'
import SheetFormModal from '~/components/Sheets/SheetFormModal.vue'
import SheetViewModal from '~/components/Sheets/SheetViewModal.vue'
import ApiDebugPanel from '~/components/Debug/ApiDebugPanel.vue'

// Import dei composables e tipi
import { useApi, type SheetWithRelations, type ApiResponse } from '~/composables/useApi'
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'
import { getAvailableFormats } from '~/utils/formats'

const { t, loadNamespace } = useI18n()

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})

// Dati reattivi
const { sheets, models } = useApi()
const allSheets = ref<SheetWithRelations[]>([])
const filteredSheets = ref<SheetWithRelations[]>([])
const sheetCount = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Filtri e ricerca
const searchCode = ref('')
const searchName = ref('')
const selectedFormat = ref('')
const selectedDrawing = ref('')
const availableFormats = ref<string[]>([])
const availableDrawings = ref<Model[]>([])
const availableModels = ref<Model[]>([])  // Per PART/ASSEMBLY

// Paginazione
const currentPage = ref(1)
const itemsPerPage = 20

// Modal e form
const showCreateModal = ref(false)
const showViewModal = ref(false)
const viewingSheet = ref<SheetWithRelations | null>(null)
const editingSheet = ref<SheetWithRelations | null>(null)
const saving = ref(false)
const formData = ref({
  code: '',
  name: '',
  formatType: '',
  creoId: '',
  drawingId: '',
  modelIds: [] as string[],
  balloon: ''
})
const formErrors = ref<Record<string, string>>({})

// Debug panel
const { isDebugMode } = useDebug()
const showDebugPanel = ref(false)

// Computed properties
const paginatedSheets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSheets.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSheets.value.length / itemsPerPage)
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

// Metodi per il caricamento dati
const refreshData = async (): Promise<void> => {
  console.log('[Sheets] Refresh data requested')
  searchCode.value = ''
  searchName.value = ''
  selectedFormat.value = ''
  selectedDrawing.value = ''
  currentPage.value = 1
  
  await loadSheets()
}

const loadSheets = async (): Promise<void> => {
  console.log('[Sheets] Inizio caricamento sheet...')
  loading.value = true
  error.value = null
  
  try {
    console.log('[Sheets] Chiamata API: GET /api/sheets')
    const sheetsResponse = await sheets.getAll()
    console.log('[Sheets] Risposta getAll():', sheetsResponse)
    
    if (sheetsResponse.success) {
      allSheets.value = sheetsResponse.data || []
      console.log('[Sheets] Sheet caricati:', allSheets.value.length)
      
      // Debug: mostra la struttura dei primi sheet per vedere come vengono i campi drawing e models
      if (allSheets.value.length > 0) {
        console.log('[Sheets] Sample sheet structure:', allSheets.value[0])
        allSheets.value.slice(0, 3).forEach((sheet, index) => {
          console.log(`[Sheets] Sheet ${index + 1} drawing field:`, sheet.drawing, 'type:', typeof sheet.drawing)
          console.log(`[Sheets] Sheet ${index + 1} models field:`, sheet.models, 'type:', typeof sheet.models)
          console.log(`[Sheets] Sheet ${index + 1} balloon field:`, sheet.balloon, 'type:', typeof sheet.balloon)
          if (sheet.models && Array.isArray(sheet.models)) {
            console.log(`[Sheets] Sheet ${index + 1} models details:`, sheet.models.map(m => ({ id: m?.id, type: typeof m })))
          }
        })
      }
      
      extractAvailableFormats()
      applyFilters()
    } else {
      console.error('[Sheets] Errore getAll():', sheetsResponse.error)
      error.value = sheetsResponse.error || 'Errore nel caricamento degli sheet'
    }
    
    console.log('[Sheets] Chiamata API: GET /api/sheets/count')
    const countResponse = await sheets.getCount()
    console.log('[Sheets] Risposta getCount():', countResponse)
    
    if (countResponse.success) {
      sheetCount.value = countResponse.data || 0
      console.log('[Sheets] Conteggio sheet:', sheetCount.value)
    } else {
      console.error('[Sheets] Errore getCount():', countResponse.error)
    }
  } catch (err) {
    console.error('[Sheets] Errore generale:', err)
    error.value = err instanceof Error ? err.message : 'Errore sconosciuto'
  } finally {
    loading.value = false
    console.log('[Sheets] Fine caricamento sheet')
  }
}

const loadDrawings = async (): Promise<void> => {
  try {
    console.log('[Sheets] Loading models for drawings and PART/ASSEMBLY...')
    const response = await models.getAll()
    console.log('[Sheets] Models API response:', response)
    
    if (response.success) {
      const allModels = response.data || []
      console.log('[Sheets] Total models loaded:', allModels.length)
      
      availableDrawings.value = allModels.filter(model => model.modelType === 'DRAWING')
      availableModels.value = allModels.filter(model => model.modelType === 'PART' || model.modelType === 'ASSEMBLY')
      
      console.log('[Sheets] Loaded', availableDrawings.value.length, 'drawings')
      console.log('[Sheets] Loaded', availableModels.value.length, 'models (PART/ASSEMBLY)')
      
      if (availableModels.value.length > 0) {
        console.log('[Sheets] Sample PART/ASSEMBLY models:', availableModels.value.slice(0, 3).map(m => ({ id: m.id, code: m.code, type: m.modelType })))
      } else {
        console.warn('[Sheets] No PART/ASSEMBLY models found!')
      }
    } else {
      console.error('[Sheets] Failed to load models:', response.error)
    }
  } catch (err) {
    console.error('[Sheets] Error loading drawings:', err)
  }
}

const extractAvailableFormats = (): void => {
  const existingFormats = allSheets.value.map(sheet => sheet.formatType)
  availableFormats.value = getAvailableFormats(existingFormats)
  
  console.log('[Sheets] Available formats:', availableFormats.value)
}

// Metodi per i filtri
const applyFilters = (): void => {
  let filtered = [...allSheets.value]
  
  if (selectedFormat.value) {
    filtered = filtered.filter(sheet => sheet.formatType === selectedFormat.value)
  }
  
  if (selectedDrawing.value) {
    if (selectedDrawing.value === 'WITH_DRAWING') {
      filtered = filtered.filter(sheet => sheet.drawing)
    } else if (selectedDrawing.value === 'WITHOUT_DRAWING') {
      filtered = filtered.filter(sheet => !sheet.drawing)
    }
  }
  
  filteredSheets.value = filtered
  currentPage.value = 1
}

const performSearchByCode = async (): Promise<void> => {
  if (!searchCode.value.trim()) {
    applyFilters()
    return
  }
  
  loading.value = true
  try {
    const response = await sheets.searchByCode(searchCode.value.trim())
    if (response.success) {
      allSheets.value = response.data || []
      extractAvailableFormats()
      applyFilters()
    } else {
      error.value = response.error || 'Errore nella ricerca per codice'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Errore nella ricerca per codice'
  } finally {
    loading.value = false
  }
}

const performSearchByName = async (): Promise<void> => {
  if (!searchName.value.trim()) {
    applyFilters()
    return
  }
  
  loading.value = true
  try {
    const response = await sheets.searchByName(searchName.value.trim())
    if (response.success) {
      allSheets.value = response.data || []
      extractAvailableFormats()
      applyFilters()
    } else {
      error.value = response.error || 'Errore nella ricerca per nome'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Errore nella ricerca per nome'
  } finally {
    loading.value = false
  }
}

const clearFilters = (): void => {
  searchCode.value = ''
  searchName.value = ''
  selectedFormat.value = ''
  selectedDrawing.value = ''
  loadSheets()
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
    balloon: ''
  }
  formErrors.value = {}
}

const validateForm = (): boolean => {
  formErrors.value = {}
  
  if (!formData.value.code.trim()) {
    formErrors.value.code = t('sheets:validation.codeRequired')
  }
  
  if (!formData.value.name.trim()) {
    formErrors.value.name = t('sheets:validation.nameRequired')
  }
  
  if (!formData.value.formatType) {
    formErrors.value.formatType = t('sheets:validation.formatRequired')
  }
  
  return Object.keys(formErrors.value).length === 0
}


const saveSheet = async (): Promise<void> => {
  console.log('[Sheets] Save sheet started')
  
  if (!validateForm()) {
    console.log('[Sheets] Validation failed')
    return
  }
  
  saving.value = true
  
  try {
    // Prepara i dati del sheet
    const sheetData: any = {
      code: formData.value.code,
      name: formData.value.name,
      formatType: formData.value.formatType,
      creoId: formData.value.creoId || undefined,
      balloon: formData.value.balloon || undefined
    }
    
    // Gestione modelli associati (PART/ASSEMBLY) - invia oggetti completi
    console.log('[Sheets] Current formData.modelIds:', formData.value.modelIds)
    
    if (formData.value.modelIds.length > 0) {
      const selectedModels = formData.value.modelIds
        .map(id => availableModels.value.find(model => model.id?.toString() === id))
        .filter(Boolean)
        .map(model => ({
          id: model!.id,
          code: model!.code,
          name: model!.name,
          modelType: model!.modelType,
          instanceType: model!.instanceType,
          file: model!.file,
          designer: model!.designer,
          item: model!.item,
          parent: model!.parent,
          instance: model!.instance
          // NON includere sheets per evitare referenze circolari
        }))
      
      sheetData.models = selectedModels
      console.log('[Sheets] Adding models objects to sheet:', selectedModels.map(m => ({ id: m.id, name: m.name })))
    }
    
    // Gestione del campo drawing - invia oggetto completo
    if (formData.value.drawingId) {
      const selectedDrawing = availableDrawings.value.find(
        drawing => drawing.id?.toString() === formData.value.drawingId
      )
      
      if (selectedDrawing) {
        sheetData.drawing = {
          id: selectedDrawing.id,
          code: selectedDrawing.code,
          name: selectedDrawing.name,
          modelType: selectedDrawing.modelType,
          instanceType: selectedDrawing.instanceType,
          file: selectedDrawing.file,
          designer: selectedDrawing.designer,
          item: selectedDrawing.item,
          parent: selectedDrawing.parent,
          instance: selectedDrawing.instance
          // NON includere sheets per evitare referenze circolari
        }
        console.log('[Sheets] Adding drawing object to sheet:', { id: selectedDrawing.id, name: selectedDrawing.name })
      }
    }
    
    console.log('[Sheets] Final sheet data to send:', sheetData)
    console.log('[Sheets] JSON string of data to send:', JSON.stringify(sheetData, null, 2))
    
    let response: ApiResponse<SheetWithRelations>
    
    if (editingSheet.value) {
      console.log('[Sheets] Updating sheet with ID:', editingSheet.value.id)
      // Il backend vuole l'ID nel body oltre che nell'URL
      // Metti models e drawing PRIMA dell'id
      const updateData = {
        ...sheetData,
        id: editingSheet.value.id
      }
      console.log('[Sheets] Update payload (models first, then id):', updateData)
      response = await sheets.update(editingSheet.value.id!, updateData)
    } else {
      console.log('[Sheets] Creating new sheet:', sheetData)
      response = await sheets.create(sheetData)
    }
    
    if (response.success) {
      closeModal()
      console.log('[Sheets] Operazione completata, aggiornamento dati...')
      await loadSheets()
      
      const message = editingSheet.value 
        ? t('sheets:messages.updateSuccess')
        : t('sheets:messages.createSuccess')
      
      console.log('[Sheets] Success message:', message)
    } else {
      console.error('[Sheets] Save failed:', response.error)
      error.value = response.error || 'Errore nel salvataggio'
    }
  } catch (err) {
    console.error('[Sheets] Save exception:', err)
    error.value = err instanceof Error ? err.message : 'Errore nel salvataggio'
  } finally {
    saving.value = false
  }
}

const viewSheet = (sheet: SheetWithRelations): void => {
  console.log('[Sheets] View sheet clicked:', sheet)
  viewingSheet.value = sheet
  showViewModal.value = true
}

const closeViewModal = (): void => {
  showViewModal.value = false
  viewingSheet.value = null
}

const downloadSheetJson = (): void => {
  if (!viewingSheet.value) return
  
  const jsonData = JSON.stringify(viewingSheet.value, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sheet-${viewingSheet.value.code}-${viewingSheet.value.id}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  console.log('[Sheets] JSON file downloaded for sheet:', viewingSheet.value.code)
}

const copySheetJson = async (): Promise<void> => {
  if (!viewingSheet.value) return
  
  const jsonData = JSON.stringify(viewingSheet.value, null, 2)
  try {
    await navigator.clipboard.writeText(jsonData)
    console.log('[Sheets] JSON copied to clipboard for sheet:', viewingSheet.value.code)
  } catch (err) {
    console.error('[Sheets] Failed to copy JSON to clipboard:', err)
    const textarea = document.querySelector('#jsonContent') as HTMLTextAreaElement
    if (textarea) {
      textarea.select()
      document.execCommand('copy')
    }
  }
}

const editSheet = (sheet: SheetWithRelations): void => {
  console.log('[Sheets] Edit sheet clicked:', sheet)
  console.log('[Sheets] Sheet models field:', sheet.models, 'type:', typeof sheet.models)
  editingSheet.value = sheet
  
  // Estrai gli ID dei modelli dal sheet esistente
  let modelIds: string[] = []
  if (sheet.models) {
    console.log('[Sheets] Processing existing models:', sheet.models)
    if (Array.isArray(sheet.models)) {
      modelIds = sheet.models.map(model => {
        let id = ''
        if (typeof model === 'number') {
          id = model.toString()
        } else if (model && typeof model === 'object' && model.id) {
          id = model.id.toString()
        }
        console.log('[Sheets] Extracted model ID:', id, 'from:', model)
        return id
      }).filter(id => id !== '')
    } else {
      console.log('[Sheets] Models is not an array:', sheet.models)
    }
  } else {
    console.log('[Sheets] No models found in sheet')
  }
  
  console.log('[Sheets] Final extracted modelIds:', modelIds)
  
  formData.value = {
    code: sheet.code,
    name: sheet.name,
    formatType: sheet.formatType,
    creoId: sheet.creoId || '',
    drawingId: sheet.drawing ? (typeof sheet.drawing === 'number' ? sheet.drawing.toString() : sheet.drawing.id?.toString() || '') : '',
    modelIds: modelIds,
    balloon: sheet.balloon || ''
  }
  
  console.log('[Sheets] Form data set to:', formData.value)
  showCreateModal.value = true
}

const confirmDelete = async (sheet: SheetWithRelations): Promise<void> => {
  const confirmed = confirm(t('sheets:confirmDelete', { name: sheet.name }))
  if (!confirmed) return
  
  loading.value = true
  try {
    const response = await sheets.delete(sheet.id || 0)
    if (response.success) {
      console.log('[Sheets] Sheet eliminato, aggiornamento dati...')
      await loadSheets()
      console.log(t('sheets:messages.deleteSuccess'))
    } else {
      error.value = response.error || 'Errore nella cancellazione'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Errore nella cancellazione'
  } finally {
    loading.value = false
  }
}

// Watchers per i filtri
watch([selectedFormat, selectedDrawing], () => {
  applyFilters()
})

// Lifecycle hooks
onMounted(async () => {
  console.log('[Sheets] Componente montato, caricamento traduzioni...')
  
  await loadNamespace('common')
  await loadNamespace('sheets')
  
  const { isAuthenticated, user } = useAuth()
  console.log('[Sheets] Stato autenticazione:', {
    isAuthenticated: isAuthenticated.value,
    user: user.value
  })
  
  await loadDrawings()
  await loadSheets()
})

// SEO e Meta
useHead({
  title: computed(() => t('sheets:title') + ' - Dashboard'),
  meta: [
    { name: 'description', content: 'Gestione completa degli sheet CAD nel sistema JBelt' }
  ]
})
</script>

<style scoped>
.sheets-dashboard {
  padding: 1rem;
}

@media (max-width: 768px) {
  .sheets-dashboard {
    padding: 0.5rem;
  }
}
</style>