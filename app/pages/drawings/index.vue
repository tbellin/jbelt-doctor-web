<template>
  <div class="container mt-5">
    <!-- Header della pagina -->
    <div class="mb-4">
      <h3 style="color: red;">Pagina Test - Export Disegni</h3>
      
      <!-- Campo di ricerca con bottone -->
      <div class="mb-4">
        <h4>Ricerca Disegni</h4>
        <div class="input-group mb-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Inserisci nome disegno"
            aria-label="Nome Disegno"
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
            Cerca
          </button>
        </div>
      </div>
    </div>

    <!-- Lista disegni trovati -->
    <div v-if="searchResults.length > 0 && !showContent" class="mb-4">
      <h5>Disegni trovati ({{ searchResults.length }})</h5>
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
          <small class="text-muted">{{ drawing.description || 'Nessuna descrizione' }}</small>
        </a>
      </div>
    </div>

    <!-- Messaggio nessun risultato -->
    <div v-if="searchPerformed && searchResults.length === 0 && !searching" class="alert alert-warning">
      <i class="bi bi-search me-2"></i>
      Nessun disegno trovato con il nome "{{ searchQuery }}"
    </div>

    <!-- Loading search -->
    <div v-if="searching" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Ricerca in corso...</p>
    </div>

    <!-- Contenuto visibile DOPO la selezione del disegno -->
    <div v-if="showContent">
      <!-- Nome Disegno selezionato -->
      <div class="mb-3 alert alert-info">
        <strong>Disegno selezionato:</strong> {{ selectedDrawing.name || selectedDrawing.code }}
        <button @click="goBackToSearch" class="btn btn-sm btn-outline-secondary ms-3">
          <i class="bi bi-arrow-left me-1"></i>
          Torna alla ricerca
        </button>
      </div>

      <!-- Selezione Foglio -->
      <div class="mb-4" v-if="availableSheets.length > 0">
        <h5>Seleziona Foglio</h5>
        <div class="row">
          <div class="col-md-6">
            <select v-model="selectedSheetId" @change="onSheetChange" class="form-select">
              <option value="">Seleziona un foglio...</option>
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
        Nessun foglio associato a questo disegno
      </div>

      <!-- Contenuto foglio selezionato -->
      <div v-if="selectedSheet">
        <!-- Informazioni foglio -->
        <div class="mb-4">
          <h5>Foglio: {{ selectedSheet.creoId || selectedSheet.name }}</h5>
          <p class="text-muted">{{ selectedSheet.name || selectedSheet.description || 'Nessuna descrizione' }}</p>
        </div>

        <!-- Loading dati -->
        <div v-if="loadingSheetData" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Caricamento dati foglio...</p>
        </div>

        <!-- Contenuto dinamico con dati reali -->
        <div v-else-if="balloonData.length > 0">
          <!-- Lista modelli associati al foglio -->
          <div class="mb-4">
            <h6>Modelli associati al foglio:</h6>
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
              Nessun modello associato trovato
            </div>
          </div>

          <!-- Tabella balloon con note e attributi -->
          <div class="table-responsive mb-4">
            <table class="table table-bordered table-striped">
              <thead class="table-dark">
                <tr>
                  <th>Balloon</th>
                  <th>Nota</th>
                  <th>Attributo 1</th>
                  <th>Attributo 2</th>
                  <th>Attributo 3</th>
                  <th>Attributo 4</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dataPoint, idx) in balloonData" :key="idx">
                  <td>
                    <strong>{{ dataPoint.balloon?.baloonValue || dataPoint.balloon?.creoId || '-' }}</strong>
                    <br>
                    <small class="text-muted">{{ dataPoint.balloon?.creoId || 'No Creo ID' }}</small>
                  </td>
                  <td>
                    <strong>{{ dataPoint.note?.creoId || dataPoint.note?.name || '-' }}</strong>
                    <br>
                    <small class="text-muted">{{ dataPoint.note?.noteValue || 'No Value' }}</small>
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
            Scarica Excel
          </button>
        </div>

        <!-- Nessun dato balloon -->
        <div v-else-if="!loadingSheetData">
          <!-- Mostra comunque i modelli se ci sono -->
          <div v-if="sheetModels.length > 0" class="mb-4">
            <h6>Modelli associati al foglio:</h6>
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
            Nessun balloon trovato per questo foglio
          </div>
        </div>
      </div>
    </div>

    <!-- Debug panel temporaneo -->
    <div v-if="showContent" class="mt-4">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">Debug Info</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <strong>Selected Drawing:</strong> {{ selectedDrawing?.name || 'None' }} (ID: {{ selectedDrawing?.id }})<br>
              <strong>Available Sheets:</strong> {{ availableSheets.length }}<br>
              <strong>Selected Sheet ID:</strong> {{ selectedSheetId || 'None' }} ({{ typeof selectedSheetId }})<br>
              <strong>Selected Sheet:</strong> {{ selectedSheet?.creoId || selectedSheet?.name || 'None' }}<br>
              <strong>Sheet IDs:</strong> {{ availableSheets.map(s => s.id).join(', ') }}<br>
            </div>
            <div class="col-md-6">
              <strong>Loading Sheet Data:</strong> {{ loadingSheetData }}<br>
              <strong>Sheet Models:</strong> {{ sheetModels.length }}<br>
              <strong>Balloon Data:</strong> {{ balloonData.length }}<br>
              <strong>Auth Status:</strong> {{ isAuthenticated }}<br>
              <strong>Show Content:</strong> {{ showContent }}<br>
            </div>
          </div>
          
          <!-- Show available sheets for debug -->
          <div v-if="availableSheets.length > 0" class="mt-2">
            <strong>Available Sheets Details:</strong>
            <ul class="small">
              <li v-for="sheet in availableSheets.slice(0, 3)" :key="sheet.id">
                ID: {{ sheet.id }} ({{ typeof sheet.id }}) - {{ sheet.creoId || sheet.name }}
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
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IAttributeEntity } from '~/model/attribute-entity.model'

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { models: modelsApi, sheets: sheetsApi, balloons: balloonsApi, notes: notesApi, attributeEntities: attributesApi } = useApi()
const { isAuthenticated } = useAuth()

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

// Excel download function
const downloadExcel = () => {
  if (!selectedDrawing.value || !selectedSheet.value || balloonData.value.length === 0) {
    console.warn('[Drawings] Cannot download Excel: missing data')
    return
  }
  
  console.log('[Drawings] Generating Excel for:', {
    drawing: selectedDrawing.value.name,
    sheet: selectedSheet.value.creoId || selectedSheet.value.name,
    balloonCount: balloonData.value.length
  })
  
  try {
    // Create worksheet data with models section
    const worksheetData = [
      ['Nome Disegno', selectedDrawing.value.name || selectedDrawing.value.code || ''],
      ['Nome Foglio', selectedSheet.value.creoId || selectedSheet.value.name || ''],
      ['ID Foglio', selectedSheet.value.id?.toString() || ''],
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
    const drawingName = selectedDrawing.value.name || selectedDrawing.value.code || 'disegno'
    const sheetName = selectedSheet.value.creoId || selectedSheet.value.name || 'foglio'
    const filename = `${drawingName}_${sheetName}_export.xlsx`.replace(/[^a-zA-Z0-9_.]/g, '_')
    
    // Download file
    XLSX.writeFile(wb, filename)
    
    console.log('[Drawings] Excel file downloaded:', filename)
    
  } catch (err) {
    console.error('[Drawings] Error generating Excel:', err)
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