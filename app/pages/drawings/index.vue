<template>
  <div class="container mt-5">
    <!-- Header della pagina -->
    <div class="mb-4">
      <h3 style="color: blue;">{{ t('page_title') }}</h3>
      
      <!-- Campo di ricerca con bottone -->
      <div class="mb-4">
        <h4>{{ t('search_drawings_title') }}</h4>
        <div class="input-group mb-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            :placeholder="t('search_placeholder')"
            :aria-label="t('drawing_name')"
            @keyup.enter="onSearch"
            :disabled="searching"
          />
          <button 
            @click="onSearch" 
            class="btn btn-primary" 
            type="button" 
            :disabled="searching || !searchQuery.trim()"
          >
            <span v-if="searching" class="spinner-border spinner-border-sm me-2"></span>
            {{ t('search_button') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Lista disegni trovati -->
    <div v-if="searchResults.length > 0 && !showContent" class="mb-4">
      <h5>{{ t('drawings_found') }} ({{ searchResults.length }})</h5>
      <div class="list-group">
        <a 
          v-for="drawing in searchResults" 
          :key="drawing.id"
          @click="selectDrawing(drawing)"
          class="list-group-item list-group-item-action"
          href="#"
        >
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">{{ drawing.name || drawing.code }}</h6>
            <small class="text-muted">ID: {{ drawing.id }}</small>
          </div>
          <p class="mb-1">{{ drawing.code }}</p>
          <small class="text-muted">{{ drawing.description || t('no_description') }}</small>
        </a>
      </div>
    </div>

    <!-- Messaggio nessun risultato -->
    <div v-if="searchPerformed && searchResults.length === 0 && !searching" class="alert alert-warning">
      <i class="bi bi-search me-2"></i>
      {{ t('no_drawings_found') }} "{{ searchQuery }}"
    </div>

    <!-- Loading search -->
    <div v-if="searching" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">{{ t('search_in_progress') }}</p>
    </div>

    <!-- Contenuto visibile DOPO la selezione del disegno -->
    <div v-if="showContent">
      <!-- Nome Disegno selezionato -->
      <div class="mb-3 alert alert-info">
        <strong>{{ t('selected_drawing') }}:</strong> {{ selectedDrawing.name || selectedDrawing.code }}
        <button @click="goBackToSearch" class="btn btn-sm btn-outline-secondary ms-3">
          <i class="bi bi-arrow-left me-1"></i>
          {{ t('back_to_search') }}
        </button>
      </div>

      <!-- Selezione Foglio -->
      <div class="mb-4" v-if="availableSheets.length > 0">
        <h5>{{ t('select_sheet') }}</h5>
        <div class="row">
          <div class="col-md-6">
            <select v-model="selectedSheetId" @change="onSheetChange" class="form-select">
              <option value="">{{ t('select_sheet_placeholder') }}</option>
              <option v-for="sheet in availableSheets" :key="sheet.id" :value="sheet.id">
                {{ sheet.creoId || sheet.code || sheet.name }} - {{ sheet.name }} (ID: {{ sheet.id }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Messaggio nessun foglio -->
      <div v-if="availableSheets.length === 0" class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ t('no_sheets_associated') }}
      </div>

      <!-- Contenuto foglio selezionato -->
      <div v-if="selectedSheet">
        <!-- Informazioni foglio -->
        <div class="mb-4">
          <h5>{{ t('sheet') }}: {{ selectedSheet.creoId || selectedSheet.name }}</h5>
          <p class="text-muted">{{ selectedSheet.name || selectedSheet.description || t('no_description') }}</p>
        </div>

        <!-- Loading dati -->
        <div v-if="loadingSheetData" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">{{ t('loading_sheet_data') }}</p>
        </div>

        <!-- Contenuto dinamico con dati reali -->
        <div v-else-if="balloonData.length > 0">
          <!-- Lista modelli associati al foglio -->
          <div class="mb-4">
            <h6>{{ t('associated_models') }}:</h6>
            <div v-if="sheetModels.length > 0" class="mb-3">
              <div class="d-flex flex-wrap gap-2">
                <span 
                  v-for="model in sheetModels" 
                  :key="model.id"
                  class="badge bg-secondary fs-6 px-3 py-2"
                >
                  {{ model.name || model.code }}
                  <small class="text-muted ms-1">({{ model.modelType }})</small>
                </span>
              </div>
            </div>
            <div v-else class="text-muted fst-italic">
              {{ t('no_models_found') }}
            </div>
          </div>

          <!-- Tabella balloon con note e attributi -->
          <div class="table-responsive mb-4">
            <table class="table table-bordered table-striped">
              <thead class="table-primary">
                <tr>
                  <th>{{ t('balloon') }}</th>
                  <th>{{ t('note') }}</th>
                  <th>{{ t('attribute_1') }}</th>
                  <th>{{ t('attribute_2') }}</th>
                  <th>{{ t('attribute_3') }}</th>
                  <th>{{ t('attribute_4') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dataPoint, idx) in balloonData" :key="idx">
                  <td>
                    <strong>{{ dataPoint.balloon?.baloonValue || dataPoint.balloon?.creoId || '-' }}</strong>
                    <br>
                    <small class="text-muted">{{ dataPoint.balloon?.creoId || t('no_creo_id') }}</small>
                  </td>
                  <td>
                    <strong>{{ dataPoint.note?.creoId || dataPoint.note?.name || '-' }}</strong>
                    <br>
                    <small class="text-muted">{{ dataPoint.note?.noteValue || t('no_value') }}</small>
                  </td>
                  <td>{{ getAttributeByOrder(dataPoint.attributes, 1) || '-' }}</td>
                  <td>{{ getAttributeByOrder(dataPoint.attributes, 2) || '-' }}</td>
                  <td>{{ getAttributeByOrder(dataPoint.attributes, 3) || '-' }}</td>
                  <td>{{ getAttributeByOrder(dataPoint.attributes, 4) || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottone per scaricare Excel -->
          <button 
            @click="downloadExcel" 
            class="btn btn-success mt-3"
            :disabled="loadingSheetData"
          >
            <i class="bi bi-file-earmark-excel me-2"></i>
            {{ t('download_excel') }}
          </button>
        </div>

        <!-- Nessun dato balloon -->
        <div v-else-if="!loadingSheetData">
          <!-- Mostra comunque i modelli se ci sono -->
          <div v-if="sheetModels.length > 0" class="mb-4">
            <h6>{{ t('associated_models') }}:</h6>
            <div class="d-flex flex-wrap gap-2">
              <span 
                v-for="model in sheetModels" 
                :key="model.id"
                class="badge bg-secondary fs-6 px-3 py-2"
              >
                {{ model.name || model.code }}
                <small class="text-muted ms-1">({{ model.modelType }})</small>
              </span>
            </div>
          </div>
          
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            {{ t('no_balloons_found') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Debug panel collassabile - solo se debug è attivo -->
    <div v-if="isDebugMode && showContent" class="mt-4">
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
              {{ t('debug_panel_title') }}
            </span>
            <i :class="['bi', showDebugPanel ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
          </button>
        </div>
        <div v-show="showDebugPanel" class="card-body">
          <div class="row small mb-3">
            <div class="col-md-6">
              <strong>{{ t('debug.selected_drawing') }}:</strong> {{ selectedDrawing?.name || 'None' }} (ID: {{ selectedDrawing?.id }})<br>
              <strong>{{ t('debug.available_sheets') }}:</strong> {{ availableSheets.length }}<br>
              <strong>{{ t('debug.selected_sheet_id') }}:</strong> {{ selectedSheetId || 'None' }} ({{ typeof selectedSheetId }})<br>
              <strong>{{ t('debug.selected_sheet') }}:</strong> {{ selectedSheet?.creoId || selectedSheet?.name || 'None' }}<br>
              <strong>{{ t('debug.sheet_ids') }}:</strong> {{ availableSheets.map(s => s.id).join(', ') }}<br>
            </div>
            <div class="col-md-6">
              <strong>{{ t('debug.loading_sheet_data') }}:</strong> {{ loadingSheetData }}<br>
              <strong>{{ t('debug.sheet_models') }}:</strong> {{ sheetModels.length }}<br>
              <strong>{{ t('debug.balloon_data') }}:</strong> {{ balloonData.length }}<br>
              <strong>{{ t('debug.auth_status') }}:</strong> {{ isAuthenticated }}<br>
              <strong>{{ t('debug.show_content') }}:</strong> {{ showContent }}<br>
              <strong>{{ t('debug.debug_mode') }}:</strong> {{ isDebugMode }}<br>
            </div>
          </div>
          
          <!-- Show available sheets for debug -->
          <div v-if="availableSheets.length > 0" class="mt-2">
            <strong>{{ t('debug.available_sheets_details') }}:</strong>
            <ul class="small">
              <li v-for="sheet in availableSheets.slice(0, 3)" :key="sheet.id">
                ID: {{ sheet.id }} ({{ typeof sheet.id }}) - {{ sheet.creoId || sheet.name }}
              </li>
            </ul>
          </div>
          
          <!-- Show sheet models for debug -->
          <div v-if="sheetModels.length > 0" class="mt-2">
            <strong>{{ t('debug.sheet_models_details') }}:</strong>
            <ul class="small">
              <li v-for="model in sheetModels" :key="model.id">
                ID: {{ model.id }} - {{ model.name || model.code }} ({{ model.modelType }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'
import { useI18n } from '~/composables/useI18n'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IAttributeEntity } from '~/model/attribute-entity.model'

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})

const { models: modelsApi, sheets: sheetsApi, balloons: balloonsApi, notes: notesApi, attributeEntities: attributesApi } = useApi()
const { isAuthenticated } = useAuth()
const { isDebugMode } = useDebug()
const { t, loadNamespace } = useI18n('drawings')

// Carica le traduzioni necessarie
await Promise.all([
  loadNamespace('drawings'),
  loadNamespace('common')
])

// Search state
const searchQuery = ref('')
const searching = ref(false)
const searchPerformed = ref(false)
const searchResults = ref<IModel[]>([])
const showContent = ref(false)

// Selected data
const selectedDrawing = ref<IModel | null>(null)
const availableSheets = ref<ISheet[]>([])
const selectedSheetId = ref('')

// Sheet data loading
const loadingSheetData = ref(false)
const balloonData = ref<any[]>([])
const sheetModels = ref<IModel[]>([])

// Debug panel state
const showDebugPanel = ref(false)

// Computed property for selected sheet
const selectedSheet = computed(() => {
  if (!selectedSheetId.value) return null
  
  // Try both string and number comparison to handle type mismatches
  const sheetId = selectedSheetId.value
  const found = availableSheets.value.find(sheet => 
    sheet.id?.toString() === sheetId.toString() || 
    sheet.id === parseInt(sheetId) || 
    sheet.id === sheetId
  )
  
  console.log('[Drawings] selectedSheet computed:', {
    sheetId: sheetId,
    sheetIdType: typeof sheetId,
    availableSheets: availableSheets.value.length,
    availableSheetsIds: availableSheets.value.map(s => ({ id: s.id, type: typeof s.id, name: s.name })),
    found: !!found,
    foundSheet: found ? { id: found.id, name: found.name } : null
  })
  
  return found || null
})

// Search function
const onSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  searching.value = true
  searchPerformed.value = true
  searchResults.value = []
  showContent.value = false
  
  try {
    console.log('[Drawings] Searching for drawings with name:', searchQuery.value)
    
    // Load all models and filter for drawings containing search query
    const modelsResponse = await modelsApi.getAll()
    
    if (modelsResponse.success) {
      const allModels = modelsResponse.data || []
      
      // Filter for drawings that match the search query
      searchResults.value = allModels.filter(model => 
        model.modelType === 'DRAWING' && 
        (model.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
         model.code?.toLowerCase().includes(searchQuery.value.toLowerCase()))
      )
      
      console.log(`[Drawings] Found ${searchResults.value.length} drawings matching "${searchQuery.value}"`)
    } else {
      console.error('[Drawings] Failed to load models:', modelsResponse.error)
    }
    
  } catch (err) {
    console.error('[Drawings] Search error:', err)
  } finally {
    searching.value = false
  }
}

// Select drawing function
const selectDrawing = async (drawing: IModel) => {
  console.log('[Drawings] Drawing selected:', drawing)
  
  selectedDrawing.value = drawing
  availableSheets.value = []
  selectedSheetId.value = ''
  balloonData.value = []
  sheetModels.value = []
  showContent.value = true
  
  try {
    // Load sheets for this drawing
    console.log('[Drawings] Loading sheets for drawing ID:', drawing.id)
    const sheetsResponse = await sheetsApi.getAll()
    
    if (sheetsResponse.success) {
      const allSheets = sheetsResponse.data || []
      console.log(`[Drawings] Total sheets loaded: ${allSheets.length}`)
      
      // Debug: show all sheets with their drawing associations
      allSheets.forEach((sheet, index) => {
        if (index < 5) { // Show first 5 for debug
          console.log(`[Drawings] Sheet ${index}: ID=${sheet.id}, name=${sheet.name}, drawingId=${sheet.drawing?.id}`)
        }
      })
      
      // Filter sheets that belong to this drawing
      availableSheets.value = allSheets.filter(sheet => 
        sheet.drawing?.id === drawing.id
      )
      
      console.log(`[Drawings] Found ${availableSheets.value.length} sheets for drawing ID ${drawing.id}`)
      availableSheets.value.forEach(sheet => {
        console.log(`[Drawings] Available sheet: ID=${sheet.id}, name=${sheet.name}, creoId=${sheet.creoId}`)
      })
    } else {
      console.error('[Drawings] Failed to load sheets:', sheetsResponse.error)
    }
    
  } catch (err) {
    console.error('[Drawings] Error loading sheets:', err)
  }
}

// Go back to search function
const goBackToSearch = () => {
  showContent.value = false
  selectedDrawing.value = null
  availableSheets.value = []
  selectedSheetId.value = ''
  balloonData.value = []
  sheetModels.value = []
}

// Sheet change function
const onSheetChange = async () => {
  console.log('[Drawings] onSheetChange called, selectedSheetId:', selectedSheetId.value)
  
  if (!selectedSheetId.value) {
    console.log('[Drawings] No sheet selected, clearing data')
    balloonData.value = []
    sheetModels.value = []
    return
  }
  
  const sheet = selectedSheet.value
  if (!sheet) {
    console.log('[Drawings] Sheet not found in computed')
    balloonData.value = []
    sheetModels.value = []
    return
  }
  
  console.log('[Drawings] Sheet selected:', sheet.creoId || sheet.name, 'ID:', sheet.id)
  
  loadingSheetData.value = true
  balloonData.value = []
  sheetModels.value = []
  
  try {
    console.log('[Drawings] Starting data load for sheet ID:', sheet.id)
    
    // Load detailed sheet info with models
    console.log('[Drawings] Loading detailed sheet info...')
    const detailedSheetResponse = await sheetsApi.getById(sheet.id)
    console.log('[Drawings] Detailed sheet response:', detailedSheetResponse.success, detailedSheetResponse.data)
    
    // Extract models from detailed sheet response
    if (detailedSheetResponse.success && detailedSheetResponse.data) {
      const detailedSheet = detailedSheetResponse.data
      sheetModels.value = detailedSheet.models || []
      console.log(`[Drawings] Found ${sheetModels.value.length} models in sheet`)
      sheetModels.value.forEach(model => {
        console.log('[Drawings] Sheet model:', {
          id: model.id,
          name: model.name || model.code,
          modelType: model.modelType
        })
      })
    } else {
      console.error('[Drawings] Failed to load detailed sheet:', detailedSheetResponse.error)
      sheetModels.value = []
    }
    
    // Load balloons for this sheet
    console.log('[Drawings] Loading balloons...')
    const balloonsResponse = await balloonsApi.getAll(`sheetId.in=${sheet.id}`)
    console.log('[Drawings] Balloons response:', balloonsResponse.success, balloonsResponse.data?.length || 0)
    
    if (balloonsResponse.success) {
      const balloons = balloonsResponse.data || []
      console.log(`[Drawings] Found ${balloons.length} balloons for sheet`)
      
      if (balloons.length > 0) {
        // Load notes and attributes
        console.log('[Drawings] Loading notes and attributes...')
        const [notesResponse, attributesResponse] = await Promise.all([
          notesApi.getAll(),
          attributesApi.getAll()
        ])
        
        console.log('[Drawings] Notes response:', notesResponse.success, notesResponse.data?.length || 0)
        console.log('[Drawings] Attributes response:', attributesResponse.success, attributesResponse.data?.length || 0)
        
        if (notesResponse.success && attributesResponse.success) {
          const allNotes = notesResponse.data || []
          const allAttributes = attributesResponse.data || []
          
          // Build balloon data with notes and attributes
          balloonData.value = balloons.map(balloon => {
            // Find notes for this balloon
            const balloonNotes = allNotes.filter(note => note.baloon?.id === balloon.id)
            const note = balloonNotes.length > 0 ? balloonNotes[0] : null
            
            // Find attributes for the note
            let attributes: IAttributeEntity[] = []
            if (note) {
              attributes = allAttributes
                .filter(attr => attr.note?.id === note.id)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
            }
            
            console.log(`[Drawings] Balloon ${balloon.baloonValue || balloon.creoId}:`, {
              hasNote: !!note,
              attributeCount: attributes.length
            })
            
            return {
              balloon,
              note,
              attributes: attributes
            }
          })
          
          console.log(`[Drawings] Built ${balloonData.value.length} balloon data entries`)
        } else {
          console.error('[Drawings] Failed to load notes or attributes')
          // Still show balloons even without notes/attributes
          balloonData.value = balloons.map(balloon => ({
            balloon,
            note: null,
            attributes: []
          }))
        }
      } else {
        console.log('[Drawings] No balloons found for this sheet')
        balloonData.value = []
      }
    } else {
      console.error('[Drawings] Failed to load balloons:', balloonsResponse.error)
      balloonData.value = []
    }
    
    console.log('[Drawings] Sheet data loading completed. Final state:', {
      balloonDataCount: balloonData.value.length,
      sheetModelsCount: sheetModels.value.length,
      loading: false
    })
    
  } catch (err) {
    console.error('[Drawings] Error loading sheet data:', err)
    balloonData.value = []
    sheetModels.value = []
  } finally {
    loadingSheetData.value = false
    console.log('[Drawings] Loading finished, loadingSheetData set to false')
  }
}

// Helper function to get attribute value by order
const getAttributeByOrder = (attributes: IAttributeEntity[], order: number): string => {
  const attribute = attributes.find(attr => attr.order === order)
  return attribute?.attributeValue || ''
}

// Excel download function using template coordinates
const downloadExcel = async () => {
  if (!selectedDrawing.value || !selectedSheet.value) {
    console.warn('[Drawings] Cannot download Excel: missing data')
    return
  }
  
  console.log('[Drawings] Generating Excel using template coordinates for:', {
    drawing: selectedDrawing.value.name,
    sheet: selectedSheet.value.creoId || selectedSheet.value.name,
    balloonCount: balloonData.value.length,
    modelsCount: sheetModels.value.length
  })
  
  try {
    // Prepara i dati per la nuova API
    const requestData = {
      drawingName: selectedDrawing.value.name || '',
      drawingCode: selectedDrawing.value.code || '',
      sheetName: selectedSheet.value.name || '',
      sheetId: selectedSheet.value.id?.toString() || '',
      sheetCreoId: selectedSheet.value.creoId || '',
      models: sheetModels.value.map(model => ({
        id: model.id?.toString() || '',
        name: model.name || '',
        code: model.code || '',
        modelType: model.modelType || ''
      })),
      balloons: balloonData.value
    }
    
    console.log('[Drawings] Request data prepared:', {
      drawingName: requestData.drawingName,
      sheetName: requestData.sheetName,
      modelsCount: requestData.models.length,
      balloonsCount: requestData.balloons.length
    })
    
    // Chiama la nuova API per drawings
    console.log('[Drawings] Calling generateExcelDrawings API...')
    const response = await $fetch('/api/generateExcelDrawings', {
      method: 'POST',
      body: requestData,
      responseType: 'blob'
    })
    
    // Crea il blob e avvia il download
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Genera filename
    const drawingName = selectedDrawing.value.name || selectedDrawing.value.code || 'disegno'
    const sheetName = selectedSheet.value.creoId || selectedSheet.value.name || 'foglio'
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    link.download = `${drawingName}_${sheetName}_${timestamp}.xlsx`.replace(/[^a-zA-Z0-9_.]/g, '_')
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('[Drawings] Excel file downloaded successfully:', link.download)
    
  } catch (err) {
    console.error('[Drawings] Error generating Excel with coordinates:', err)
    console.log('[Drawings] Falling back to simple Excel generation')
    await downloadExcelFallback()
  }
}

// Fallback function per Excel semplice
const downloadExcelFallback = () => {
  try {
    // Create worksheet data with models section (fallback method)
    const worksheetData = [
      ['Nome Disegno', selectedDrawing.value?.name || selectedDrawing.value?.code || ''],
      ['Nome Foglio', selectedSheet.value?.creoId || selectedSheet.value?.name || ''],
      ['ID Foglio', selectedSheet.value?.id?.toString() || ''],
      [],
      ['MODELLI ASSOCIATI AL FOGLIO'],
      ['ID Modello', 'Nome Modello', 'Codice', 'Tipo'],
      ...sheetModels.value.map(model => [
        model.id?.toString() || '-',
        model.name || '-',
        model.code || '-',
        model.modelType || '-'
      ]),
      [],
      ['BALLOON E NOTE'],
      ['Balloon', 'Nota', 'Attributo 1', 'Attributo 2', 'Attributo 3', 'Attributo 4'],
      ...balloonData.value.map(dataPoint => [
        dataPoint.balloon?.baloonValue || dataPoint.balloon?.creoId || '-',
        dataPoint.note?.creoId || dataPoint.note?.noteValue || '-',
        getAttributeByOrder(dataPoint.attributes, 1) || '-',
        getAttributeByOrder(dataPoint.attributes, 2) || '-',
        getAttributeByOrder(dataPoint.attributes, 3) || '-',
        getAttributeByOrder(dataPoint.attributes, 4) || '-'
      ])
    ]
    
    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)
    const wb = XLSX.utils.book_new()
    
    XLSX.utils.book_append_sheet(wb, ws, 'Dati Disegno')
    
    // Generate filename
    const drawingName = selectedDrawing.value?.name || selectedDrawing.value?.code || 'disegno'
    const sheetName = selectedSheet.value?.creoId || selectedSheet.value?.name || 'foglio'
    const filename = `${drawingName}_${sheetName}_fallback.xlsx`.replace(/[^a-zA-Z0-9_.]/g, '_')
    
    // Download file
    XLSX.writeFile(wb, filename)
    
    console.log('[Drawings] Fallback Excel file downloaded:', filename)
    
  } catch (err) {
    console.error('[Drawings] Error generating fallback Excel:', err)
  }
}
</script>

<style scoped>
.container {
  max-width: 960px;
}
.table th,
.table td {
  vertical-align: middle;
}
.btn-success {
  background-color: #198754;
}
.btn-success:hover {
  background-color: #157347;
}
.input-group .btn {
  white-space: nowrap;
}
.alert {
  font-size: 0.95rem;
}
.list-group-item {
  cursor: pointer;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>