<!--
  Pagina Dashboard per la gestione dei Balloon e Note con AttributeEntity
  Struttura: Balloon (1:1) Note (1:4) AttributeEntity
  @version 1.0.0
-->
<template>
  <div class="balloons-dashboard">
    <!-- Header della pagina -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">
            <i class="bi bi-geo-alt me-2"></i>
            Balloons
          </h1>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" @click="handleRefresh" :disabled="loading">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Aggiorna
            </button>
            <button class="btn btn-success" @click="openCreateModal" :disabled="loading">
              <i class="bi bi-plus-lg me-2"></i>
              Crea Balloon (Modal)
            </button>
            <NuxtLink to="/dashboard/balloon/new" class="btn btn-primary">
              <i class="bi bi-plus-lg me-2"></i>
              Crea Balloon (Pagina)
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="stats-title mb-0">
          <i class="bi bi-graph-up me-2"></i>
          Statistiche
        </h6>
        <button 
          class="btn btn-sm btn-outline-secondary"
          @click="toggleStatsCollapse"
          :title="isStatsCollapsed ? 'Espandi statistiche' : 'Comprimi statistiche'"
        >
          <i class="bi" :class="isStatsCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
        </button>
      </div>
      
      <div class="row collapse-content" v-show="!isStatsCollapsed">
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h6 class="card-subtitle mb-2 text-muted">Totale Balloons</h6>
                  <h3 class="card-title mb-0">{{ balloons.length }}</h3>
                </div>
                <div class="text-primary">
                  <i class="bi bi-geo-alt fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h6 class="card-subtitle mb-2 text-muted">Totale Note</h6>
                  <h3 class="card-title mb-0">{{ notes.length }}</h3>
                </div>
                <div class="text-success">
                  <i class="bi bi-sticky fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h6 class="card-subtitle mb-2 text-muted">Coppie Associate</h6>
                  <h3 class="card-title mb-0">{{ associatedPairsCount }}</h3>
                </div>
                <div class="text-warning">
                  <i class="bi bi-link-45deg fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h6 class="card-subtitle mb-2 text-muted">Totale Attributi</h6>
                  <h3 class="card-title mb-0">{{ totalAttributesCount }}</h3>
                </div>
                <div class="text-info">
                  <i class="bi bi-tags fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="card mb-3">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="bi bi-funnel me-2"></i>
            Filtri
          </h6>
          <button 
            class="btn btn-sm btn-outline-secondary"
            @click="toggleFiltersCollapse"
            :title="isFiltersCollapsed ? 'Espandi filtri' : 'Comprimi filtri'"
          >
            <i class="bi" :class="isFiltersCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
          </button>
        </div>
      </div>
      
      <div class="card-body collapse-content" v-show="!isFiltersCollapsed">
        <div class="row">
          <div class="col-md-6">
            <label for="filterDrawing" class="form-label">Disegno</label>
            <select
              id="filterDrawing"
              v-model="filterDrawingId"
              @change="onFilterDrawingChange($event)"
              class="form-select"
            >
              <option value="">Seleziona un disegno...</option>
              <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                {{ drawing.code || drawing.name }} - {{ drawing.name }}
              </option>
            </select>
          </div>
          
          <div class="col-md-6">
            <label for="filterSheet" class="form-label">Foglio (Creo ID)</label>
            <select
              id="filterSheet"
              v-model="filterSheetId"
              @change="onFilterSheetChange"
              class="form-select"
              :disabled="!filterDrawingId"
            >
              <option value="">Seleziona un foglio...</option>
              <option v-for="sheet in filteredSheetsForFilter" :key="sheet.id" :value="sheet.id">
                {{ sheet.creoId || sheet.code || sheet.name }} - {{ sheet.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="row mt-3">
          <div class="col-12">
            <button 
              class="btn btn-outline-secondary btn-sm me-2"
              @click="clearFilters"
            >
              <i class="bi bi-x-circle me-1"></i>
              Pulisci Filtri
            </button>
            <small class="text-muted">
              Visualizzati: {{ filteredBalloonNoteRows.length }} 
              <span v-if="filterSheetId">balloon per foglio selezionato</span>
              <span v-else>balloon senza foglio associato</span>
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Tabella Balloons</h5>
          <button 
            class="btn btn-sm btn-outline-secondary"
            @click="toggleTableCollapse"
            :title="isTableCollapsed ? 'Espandi tabella' : 'Comprimi tabella'"
          >
            <i class="bi" :class="isTableCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
          </button>
        </div>
      </div>
      
      <div class="card-body collapse-content" v-show="!isTableCollapsed">
        <!-- Loading state -->
        <div v-if="loading || loadingFiltered" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">{{ loadingFiltered ? 'Caricamento dati filtrati...' : 'Caricamento...' }}</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-danger">
          <strong>Errore:</strong> {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="handleRefresh">
            Riprova
          </button>
        </div>

        <!-- Empty state - No sheet filter (showing balloons without sheet) -->
        <div v-else-if="!filterSheetId && filteredBalloonNoteRows.length === 0 && !loadingFiltered" class="text-center py-5">
          <i class="bi bi-geo-alt-slash display-1 text-muted"></i>
          <h4 class="mt-3">Nessun Balloon senza foglio associato</h4>
          <p class="text-muted">Tutti i balloon hanno un foglio associato. Seleziona un foglio per visualizzare i balloon correlati o crea nuovi balloon.</p>
          <NuxtLink to="/dashboard/balloon/new" class="btn btn-primary">
            <i class="bi bi-plus-lg me-2"></i>
            Crea nuovo Balloon
          </NuxtLink>
        </div>

        <!-- Empty state - Sheet selected but no balloons -->
        <div v-else-if="!filteredBalloonNoteRows.length" class="text-center py-5">
          <i class="bi bi-geo-alt display-1 text-muted"></i>
          <h4 class="mt-3">Nessun Balloon per questo Foglio</h4>
          <p class="text-muted">Non ci sono balloon associati al foglio selezionato. Crea un nuovo balloon.</p>
          <NuxtLink to="/dashboard/balloon/new" class="btn btn-primary">
            <i class="bi bi-plus-lg me-2"></i>
            Crea Balloon per Foglio
          </NuxtLink>
        </div>

        <!-- Simple Balloon-Note Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover table-bordered table-sm">
            <thead class="table-secondary">
              <tr>
                <th style="width: 12%">Balloon</th>
                <th style="width: 12%">Nota</th>
                <th style="width: 16%">Attributo 1</th>
                <th style="width: 16%">Attributo 2</th>
                <th style="width: 16%">Attributo 3</th>
                <th style="width: 16%">Attributo 4</th>
                <th style="width: 12%">Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredBalloonNoteRows" :key="getRowKey(row)" class="balloon-row">
                <!-- Balloon Column -->
                <td class="balloon-cell">
                  <div v-if="row.balloon" class="balloon-info">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-geo-alt text-primary me-2"></i>
                      <div>
                        <strong>{{ row.balloon.baloonValue || row.balloon.name || '-' }}</strong>
                        <div class="small text-muted">{{ row.balloon.creoId || 'No Creo ID' }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted fst-italic">
                    Nessun Balloon
                  </div>
                </td>

                <!-- Note Column -->
                <td class="note-cell">
                  <div v-if="row.note" class="note-info">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-sticky text-success me-2"></i>
                      <div>
                        <strong>{{ row.note.creoId || row.note.name || '-' }}</strong>
                        <div class="small text-muted">{{ row.note.noteValue || 'No Value' }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted fst-italic">
                    Nessuna Nota
                  </div>
                </td>

                <!-- Attribute Columns (1-4) -->
                <td v-for="i in 4" :key="`attr-${i}`" class="attribute-cell">
                  <div v-if="row.attributes && row.attributes[i-1] && row.attributes[i-1].attributeValue" class="attribute-info">
                    <div class="attribute-value">
                      {{ row.attributes[i-1].attributeValue }}
                    </div>
                    <div class="small text-muted d-flex justify-content-between">
                      <span>Ordine {{ i }}</span>
                      <span class="badge bg-secondary">{{ row.attributes[i-1].typeValue || 'STRING' }}</span>
                    </div>
                  </div>
                  <div v-else class="text-muted fst-italic">
                    -
                  </div>
                </td>

                <!-- Actions Column -->
                <td class="actions-cell">
                  <div class="btn-group-vertical btn-group-sm">
                    <button 
                      v-if="!row.balloon || !row.note"
                      @click="associateRow(row)" 
                      class="btn btn-outline-warning btn-sm"
                      title="Associa"
                    >
                      <i class="bi bi-link"></i>
                    </button>
                    <button 
                      @click="viewBalloonJson(row)" 
                      class="btn btn-outline-primary btn-sm"
                      title="Visualizza JSON"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <NuxtLink 
                      v-if="row.balloon?.id"
                      :to="`/dashboard/balloon/${row.balloon.id}`"
                      class="btn btn-outline-secondary btn-sm"
                      title="Modifica"
                    >
                      <i class="bi bi-pencil"></i>
                    </NuxtLink>
                    <button 
                      v-else
                      @click="editRow(row)" 
                      class="btn btn-outline-secondary btn-sm"
                      title="Modifica"
                      disabled
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      @click="deleteRow(row)" 
                      class="btn btn-outline-danger btn-sm"
                      title="Elimina"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Simple Create/Edit Balloon Modal -->
    <BalloonFormModal
      :show="showCreateModal"
      :editing-balloon="editingBalloon"
      v-model:form-data="balloonFormData"
      v-model:selected-drawing-id="selectedDrawingId"
      v-model:selected-sheet-id="selectedSheetId"
      :errors="formErrors"
      :saving="saving"
      :available-drawings="availableDrawings"
      :available-sheets="allSheets"
      @close="closeCreateModal"
      @save="handleCreateSave"
    />

    <!-- JSON View Modal -->
    <div v-if="showJsonModal" class="modal show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Visualizza JSON - {{ jsonViewBalloon?.baloonValue || jsonViewBalloon?.name || 'Balloon' }}</h5>
            <button class="btn-close" @click="closeJsonModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingJson" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">Caricamento...</p>
            </div>
            <div v-else-if="jsonError" class="alert alert-danger">
              <strong>Errore:</strong> {{ jsonError }}
            </div>
            <div v-else>
              <pre class="json-display"><code>{{ formattedBalloonJson }}</code></pre>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeJsonModal">Chiudi</button>
            <button class="btn btn-primary" @click="copyJsonToClipboard" :disabled="!jsonViewBalloon">
              <i class="bi bi-clipboard me-2"></i>
              Copia JSON
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Association Modal -->
    <div v-if="showAssociationModal" class="modal show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Associa Balloon e Nota</h5>
            <button class="btn-close" @click="closeAssociationModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <label class="form-label">Seleziona Balloon</label>
                <select v-model="selectedBalloonId" class="form-select">
                  <option value="">Scegli un balloon...</option>
                  <option v-for="balloon in availableBalloons" :key="balloon.id" :value="balloon.id">
                    {{ balloon.baloonValue || balloon.name }} ({{ balloon.creoId }})
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Seleziona Nota</label>
                <select v-model="selectedNoteId" class="form-select">
                  <option value="">Scegli una nota...</option>
                  <option v-for="note in availableNotes" :key="note.id" :value="note.id">
                    {{ note.creoId || note.name }} ({{ note.noteValue }})
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeAssociationModal">Annulla</button>
            <button class="btn btn-primary" @click="performAssociation" :disabled="!selectedBalloonId || !selectedNoteId">
              Associa
            </button>
          </div>
        </div>
      </div>
    </div>

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
              Debug API Panel - Balloons
            </span>
            <i :class="['bi', showDebugPanel ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
          </button>
        </div>
        <div v-show="showDebugPanel" class="card-body">
          <div class="row small mb-3">
            <div class="col-md-6">
              <strong>Auth Status:</strong> 
              <span :class="isAuthenticated ? 'text-success' : 'text-danger'">
                {{ isAuthenticated ? 'Authenticated' : 'Not authenticated' }}
              </span><br>
              <strong>User:</strong> {{ user?.login || 'None' }}<br>
              <strong>All Balloons:</strong> {{ balloons.length }}<br>
              <strong>All Notes:</strong> {{ notes.length }}<br>
              <strong>All Rows:</strong> {{ balloonNoteRows.length }}<br>
              <strong>Filtered Balloons:</strong> {{ filteredBalloons.length }}<br>
              <strong>Filtered Rows:</strong> {{ filteredBalloonNoteRows.length }}<br>
              <strong>Filter Sheet ID:</strong> {{ filterSheetId || 'None' }}<br>
              <strong>Loading:</strong> {{ loading }}<br>
              <strong>Loading Filtered:</strong> {{ loadingFiltered }}
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '~/composables/useApi'
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IAttributeEntity } from '~/model/attribute-entity.model'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'
import BalloonFormModal from '~/components/Balloons/BalloonFormModal.vue'

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { balloons: balloonsApi, notes: notesApi, attributeEntities: attributesApi, models: modelsApi, sheets: sheetsApi } = useApi()
const { isAuthenticated, user } = useAuth()
const { isDebugMode } = useDebug()

// Reactive state
const balloons = ref<IBaloon[]>([])
const notes = ref<INote[]>([])
const attributeEntities = ref<IAttributeEntity[]>([])
const allModels = ref<IModel[]>([])
const allSheets = ref<ISheet[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Collapse states
const isStatsCollapsed = ref(false)
const isTableCollapsed = ref(false)
const isFiltersCollapsed = ref(false)

// Filter states
const filterDrawingId = ref('')
const filterSheetId = ref('')

// Modal state
const showCreateModal = ref(false)
const showAssociationModal = ref(false)
const showJsonModal = ref(false)
const selectedBalloonId = ref<number | null>(null)
const selectedNoteId = ref<number | null>(null)
const associatingRow = ref<any>(null)
const editingBalloon = ref<IBaloon | null>(null)
const saving = ref(false)

// JSON view state
const jsonViewBalloon = ref<IBaloon | null>(null)
const loadingJson = ref(false)
const jsonError = ref<string | null>(null)

// Drawing and Sheet selection state for modal
const selectedDrawingId = ref('')
const selectedSheetId = ref('')

// Simple form state (no associations)
const balloonFormData = ref({
  balloon: {
    creoId: '',
    code: '',
    name: '',
    baloonValue: '',
    baloonType: ''
  },
  note: {
    creoId: '',
    code: '',
    name: '',
    noteValue: '',
    noteType: ''
  }
})

const formErrors = ref<Record<string, string>>({})

// Simple balloon-note rows for display (no complex grouping)
const balloonNoteRows = computed(() => {
  try {
    const rows = []
    
    // Create rows for existing balloons with their notes
    for (const balloon of balloons.value) {
      const balloonNotes = notes.value.filter(note => note.baloon?.id === balloon.id)
      
      if (balloonNotes.length > 0) {
        for (const note of balloonNotes) {
          const noteAttributes = attributeEntities.value
            .filter(attr => attr.note?.id === note.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
          
          // Ensure we have 4 attributes
          while (noteAttributes.length < 4) {
            noteAttributes.push({
              id: null,
              order: noteAttributes.length + 1,
              attributeValue: '',
              note: note
            })
          }
          
          rows.push({
            balloon,
            note,
            attributes: noteAttributes.slice(0, 4)
          })
        }
      } else {
        // Balloon without note
        rows.push({
          balloon,
          note: null,
          attributes: createEmptyAttributes()
        })
      }
    }
    
    // Add orphaned notes (notes without balloons)
    const usedNoteIds = new Set(rows.map(row => row.note?.id).filter(Boolean))
    for (const note of notes.value) {
      if (!usedNoteIds.has(note.id) && !note.baloon) {
        const noteAttributes = attributeEntities.value
          .filter(attr => attr.note?.id === note.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        
        while (noteAttributes.length < 4) {
          noteAttributes.push({
            id: null,
            order: noteAttributes.length + 1,
            attributeValue: '',
            note: note
          })
        }
        
        rows.push({
          balloon: null,
          note,
          attributes: noteAttributes.slice(0, 4)
        })
      }
    }
    
    return rows
  } catch (err) {
    console.error('[Balloons] Error in balloonNoteRows:', err)
    return []
  }
})

// Computed properties for form data
const availableDrawings = computed(() => {
  return allModels.value.filter(model => model.modelType === 'DRAWING')
})

// Computed properties for filters
const filteredSheetsForFilter = computed(() => {
  console.log('[Balloons] Computing filteredSheetsForFilter, drawing ID:', filterDrawingId.value)
  console.log('[Balloons] Available sheets:', allSheets.value.length)
  
  if (!filterDrawingId.value) {
    console.log('[Balloons] No drawing selected, returning empty array')
    return []
  }
  
  const filtered = allSheets.value.filter(sheet => {
    const matches = sheet.drawing?.id?.toString() === filterDrawingId.value
    if (matches) {
      console.log('[Balloons] Sheet matches:', sheet.creoId || sheet.name, 'drawing ID:', sheet.drawing?.id)
    }
    return matches
  })
  
  console.log('[Balloons] Filtered sheets for drawing:', filtered.length)
  return filtered
})

// Filtered data from API calls
const filteredBalloons = ref<IBaloon[]>([])
const filteredNotes = ref<INote[]>([])
const filteredAttributes = ref<IAttributeEntity[]>([])
const loadingFiltered = ref(false)

// Build rows from filtered data - shared function
const buildRowsFromFilteredData = () => {
  const rows = []
  
  // Create rows for filtered balloons with their notes
  for (const balloon of filteredBalloons.value) {
    const balloonNotes = filteredNotes.value.filter(note => note.baloon?.id === balloon.id)
    
    if (balloonNotes.length > 0) {
      for (const note of balloonNotes) {
        const noteAttributes = filteredAttributes.value
          .filter(attr => attr.note?.id === note.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        
        // Ensure we have 4 attributes
        while (noteAttributes.length < 4) {
          noteAttributes.push({
            id: null,
            order: noteAttributes.length + 1,
            attributeValue: '',
            note: note
          })
        }
        
        rows.push({
          balloon,
          note,
          attributes: noteAttributes.slice(0, 4)
        })
      }
    } else {
      // Balloon without note
      rows.push({
        balloon,
        note: null,
        attributes: createEmptyAttributes()
      })
    }
  }
  
  // Add orphaned notes (notes without balloons) from filtered data
  const usedNoteIds = new Set(rows.map(row => row.note?.id).filter(Boolean))
  for (const note of filteredNotes.value) {
    if (!usedNoteIds.has(note.id) && !note.baloon) {
      const noteAttributes = filteredAttributes.value
        .filter(attr => attr.note?.id === note.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      
      while (noteAttributes.length < 4) {
        noteAttributes.push({
          id: null,
          order: noteAttributes.length + 1,
          attributeValue: '',
          note: note
        })
      }
      
      rows.push({
        balloon: null,
        note,
        attributes: noteAttributes.slice(0, 4)
      })
    }
  }
  
  const contextInfo = filterSheetId.value ? `sheet ID: ${filterSheetId.value}` : 'balloons without sheet'
  console.log(`[Balloons] Built ${rows.length} filtered rows for ${contextInfo}`)
  return rows
}

// Build balloon-note rows for filtered data
const filteredBalloonNoteRows = computed(() => {
  try {
    // REGOLA: Se non è selezionato un foglio, mostra balloon senza foglio
    if (!filterSheetId.value) {
      console.log('[Balloons] No sheet filter selected, showing balloons without sheet')
      // Use filtered balloons (loaded by loadBalloonsWithoutSheet)
      return buildRowsFromFilteredData()
    }
    
    // Use shared function to build rows from filtered data
    return buildRowsFromFilteredData()
    
  } catch (err) {
    console.error('[Balloons] Error in filteredBalloonNoteRows:', err)
    return []
  }
})

// Simple computed properties for available data
const availableBalloons = computed(() => {
  try {
    const usedBalloonIds = new Set()
    balloonNoteRows.value.forEach(row => {
      if (row?.balloon?.id) {
        usedBalloonIds.add(row.balloon.id)
      }
    })
    return balloons.value.filter(balloon => balloon?.id && !usedBalloonIds.has(balloon.id))
  } catch (err) {
    console.error('[Balloons] Error in availableBalloons:', err)
    return balloons.value
  }
})

const availableNotes = computed(() => {
  try {
    const usedNoteIds = new Set()
    balloonNoteRows.value.forEach(row => {
      if (row?.note?.id) {
        usedNoteIds.add(row.note.id)
      }
    })
    return notes.value.filter(note => note?.id && !usedNoteIds.has(note.id))
  } catch (err) {
    console.error('[Balloons] Error in availableNotes:', err)
    return notes.value
  }
})

// Debug state
const showDebugPanel = ref(false)
const debugInfo = ref<string>('')

// JSON formatting
const formattedBalloonJson = computed(() => {
  if (!jsonViewBalloon.value) return ''
  try {
    return JSON.stringify(jsonViewBalloon.value, null, 2)
  } catch (err) {
    return 'Error formatting JSON: ' + err
  }
})

// Simple computed properties for stats (use filtered data)
const associatedPairsCount = computed(() => {
  try {
    return filteredBalloonNoteRows.value.filter(row => row?.balloon && row?.note).length
  } catch (err) {
    console.error('[Balloons] Error in associatedPairsCount:', err)
    return 0
  }
})

const totalAttributesCount = computed(() => {
  try {
    return filteredBalloonNoteRows.value.reduce((total, row) => {
      return total + (row?.attributes?.filter(attr => attr?.attributeValue).length || 0)
    }, 0)
  } catch (err) {
    console.error('[Balloons] Error in totalAttributesCount:', err)
    return 0
  }
})

// Helper functions
const createEmptyAttributes = () => {
  return Array.from({ length: 4 }, (_, index) => ({
    id: null,
    order: index + 1,
    attributeValue: '',
    note: null
  }))
}

const getRowKey = (row: any) => {
  return `${row.balloon?.id || 'b-null'}-${row.note?.id || 'n-null'}`
}

// Toggle functions
const toggleStatsCollapse = () => {
  isStatsCollapsed.value = !isStatsCollapsed.value
}

const toggleTableCollapse = () => {
  isTableCollapsed.value = !isTableCollapsed.value
}

const toggleFiltersCollapse = () => {
  isFiltersCollapsed.value = !isFiltersCollapsed.value
}

// Filter functions
const onFilterDrawingChange = (event?: Event) => {
  // Get value from event if provided, otherwise use reactive value
  const newValue = event ? (event.target as HTMLSelectElement).value : filterDrawingId.value
  
  console.log('[Balloons] onFilterDrawingChange called')
  console.log('[Balloons] Event value:', newValue)
  console.log('[Balloons] Reactive value:', filterDrawingId.value)
  
  // Ensure reactive value is updated
  filterDrawingId.value = newValue
  
  // Reset sheet filter when drawing changes
  filterSheetId.value = ''
  console.log('[Balloons] Drawing filter changed to:', newValue, 'reset sheet filter')
  
  // Force reactivity update - trigger computed property
  console.log('[Balloons] Available sheets for new drawing:', filteredSheetsForFilter.value.length)
}

const onFilterSheetChange = async () => {
  console.log('[Balloons] Sheet filter changed to:', filterSheetId.value)
  
  if (!filterSheetId.value) {
    // Special case: show balloons without sheet (sheet = null)
    await loadBalloonsWithoutSheet()
    return
  }
  
  await loadFilteredData()
}

const clearFilters = async () => {
  filterDrawingId.value = ''
  filterSheetId.value = ''
  console.log('[Balloons] All filters cleared')
  
  // Load balloons without sheet when filters are cleared
  await loadBalloonsWithoutSheet()
}

// Load balloons without sheet association (sheet = null)
const loadBalloonsWithoutSheet = async () => {
  loadingFiltered.value = true
  console.log('[Balloons] Loading balloons without sheet association')
  
  try {
    // Use API filter for balloons without sheet (sheet is null)
    const balloonsResponse = await balloonsApi.getAll('sheet.specified=false')
    
    if (balloonsResponse.success) {
      filteredBalloons.value = balloonsResponse.data || []
      console.log(`[Balloons] Loaded ${filteredBalloons.value.length} balloons without sheet via API`)
      
      // Get balloon IDs to filter notes and attributes
      const balloonIds = new Set(filteredBalloons.value.map(b => b.id))
      
      // Filter notes from already loaded data that belong to these balloons
      filteredNotes.value = notes.value.filter(note => 
        note.baloon?.id && balloonIds.has(note.baloon.id)
      )
      console.log(`[Balloons] Filtered ${filteredNotes.value.length} notes for balloons without sheet`)
      
      // Filter attributes from already loaded data that belong to these notes
      const noteIds = new Set(filteredNotes.value.map(n => n.id))
      filteredAttributes.value = attributeEntities.value.filter(attr => 
        attr.note?.id && noteIds.has(attr.note.id)
      )
      console.log(`[Balloons] Filtered ${filteredAttributes.value.length} attributes for balloons without sheet`)
    } else {
      console.error('[Balloons] Failed to load balloons without sheet:', balloonsResponse.error)
      filteredBalloons.value = []
      filteredNotes.value = []
      filteredAttributes.value = []
    }
    
  } catch (err) {
    console.error('[Balloons] Error loading balloons without sheet:', err)
    error.value = 'Failed to load balloons without sheet: ' + (err instanceof Error ? err.message : 'Unknown error')
    // Reset filtered data on error
    filteredBalloons.value = []
    filteredNotes.value = []
    filteredAttributes.value = []
  } finally {
    loadingFiltered.value = false
  }
}

// Load filtered data by sheet
const loadFilteredData = async () => {
  if (!filterSheetId.value) return
  
  loadingFiltered.value = true
  console.log('[Balloons] Loading filtered data for sheet ID:', filterSheetId.value)
  
  try {
    // Get the selected sheet object
    const selectedSheet = allSheets.value.find(sheet => 
      sheet.id?.toString() === filterSheetId.value
    )
    
    if (!selectedSheet) {
      console.warn('[Balloons] Selected sheet not found in allSheets for ID:', filterSheetId.value)
      console.log('[Balloons] Available sheet IDs:', allSheets.value.map(s => s.id))
      // Continue anyway - we can still filter by sheet ID
    } else {
      console.log('[Balloons] Loading data for sheet:', selectedSheet.creoId || selectedSheet.name)
    }
    
    // Use API filter by sheet ID
    console.log('[Balloons] Loading filtered data via API for sheet ID:', filterSheetId.value)
    
    // Make API call with sheet filter
    const balloonsResponse = await balloonsApi.getAll(`sheetId.in=${filterSheetId.value}`)
    
    if (balloonsResponse.success) {
      filteredBalloons.value = balloonsResponse.data || []
      console.log(`[Balloons] Loaded ${filteredBalloons.value.length} balloons for sheet via API`)
      
      // Get balloon IDs to filter notes and attributes
      const balloonIds = new Set(filteredBalloons.value.map(b => b.id))
      
      // Filter notes from already loaded data that belong to these balloons
      filteredNotes.value = notes.value.filter(note => 
        note.baloon?.id && balloonIds.has(note.baloon.id)
      )
      console.log(`[Balloons] Filtered ${filteredNotes.value.length} notes for sheet from loaded data`)
      
      // Filter attributes from already loaded data that belong to these notes
      const noteIds = new Set(filteredNotes.value.map(n => n.id))
      filteredAttributes.value = attributeEntities.value.filter(attr => 
        attr.note?.id && noteIds.has(attr.note.id)
      )
      console.log(`[Balloons] Filtered ${filteredAttributes.value.length} attributes for sheet from loaded data`)
    } else {
      console.error('[Balloons] Failed to load filtered balloons:', balloonsResponse.error)
      filteredBalloons.value = []
      filteredNotes.value = []
      filteredAttributes.value = []
    }
    
  } catch (err) {
    console.error('[Balloons] Error filtering data:', err)
    error.value = 'Failed to filter data: ' + (err instanceof Error ? err.message : 'Unknown error')
    // Reset filtered data on error
    filteredBalloons.value = []
    filteredNotes.value = []
    filteredAttributes.value = []
  } finally {
    loadingFiltered.value = false
  }
}


// Association functions
const associateRow = (row: any) => {
  associatingRow.value = row
  showAssociationModal.value = true
}

const closeAssociationModal = () => {
  showAssociationModal.value = false
  associatingRow.value = null
  selectedBalloonId.value = null
  selectedNoteId.value = null
}

const performAssociation = async () => {
  // Implementation will depend on your API
  console.log('Performing association:', {
    balloonId: selectedBalloonId.value,
    noteId: selectedNoteId.value
  })
  
  closeAssociationModal()
  await loadData()
}

// Modal functions
const openCreateModal = () => {
  console.log('[Balloons] Opening create modal')
  
  // Reset form data for new balloon
  editingBalloon.value = null
  resetFormData()
  formErrors.value = {}
  
  // Reset selections
  selectedDrawingId.value = ''
  selectedSheetId.value = ''
  
  // Open modal
  showCreateModal.value = true
  
  console.log('[Balloons] Create modal opened with available data:', {
    drawings: availableDrawings.value.length,
    sheets: allSheets.value.length,
    sheetsWithDrawing: allSheets.value.filter(s => s.drawing?.id).length
  })
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingBalloon.value = null
  resetFormData()
  formErrors.value = {}
  // Reset sheet selections
  selectedDrawingId.value = ''
  selectedSheetId.value = ''
}

// JSON Modal functions
const closeJsonModal = () => {
  showJsonModal.value = false
  jsonViewBalloon.value = null
  jsonError.value = null
  loadingJson.value = false
}

const copyJsonToClipboard = async () => {
  if (!jsonViewBalloon.value) return
  
  try {
    const jsonText = JSON.stringify(jsonViewBalloon.value, null, 2)
    await navigator.clipboard.writeText(jsonText)
    
    // You could add a toast notification here
    console.log('[Balloons] JSON copied to clipboard')
    
  } catch (err) {
    console.error('[Balloons] Failed to copy JSON to clipboard:', err)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = JSON.stringify(jsonViewBalloon.value, null, 2)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('[Balloons] JSON copied to clipboard (fallback)')
    } catch (fallbackErr) {
      console.error('[Balloons] Fallback copy also failed:', fallbackErr)
    }
  }
}

const resetFormData = () => {
  balloonFormData.value = {
    balloon: {
      creoId: '',
      code: '',
      name: '',
      baloonValue: '',
      baloonType: ''
    },
    note: {
      creoId: '',
      code: '',
      name: '',
      noteValue: '',
      noteType: ''
    }
  }
}

const validateForm = (): boolean => {
  const errors: Record<string, string> = {}
  
  // OBBLIGATORIO: Deve essere selezionato un foglio
  if (!selectedSheetId.value?.trim()) {
    const sheetRequiredMsg = 'È obbligatorio selezionare un foglio'
    errors.sheetRequired = sheetRequiredMsg
    error.value = sheetRequiredMsg
  }
  
  // Validate balloon required fields
  if (!balloonFormData.value.balloon.creoId?.trim()) {
    errors.balloonCreoId = 'Questo campo è obbligatorio'
  }
  if (!balloonFormData.value.balloon.baloonValue?.trim()) {
    errors.balloonValue = 'Questo campo è obbligatorio'
  }
  
  // Validate note required fields
  if (!balloonFormData.value.note.creoId?.trim()) {
    errors.noteCreoId = 'Questo campo è obbligatorio'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleCreateSave = async (): Promise<void> => {
  console.log('[Balloons] Save balloon started - editing mode:', !!editingBalloon.value)
  console.log('[Balloons] Selected sheet ID:', selectedSheetId.value)
  
  if (!validateForm()) {
    console.log('[Balloons] Validation failed')
    return
  }
  
  saving.value = true
  error.value = null
  
  try {
    // Get selected sheet object if one is selected
    let selectedSheet = null
    if (selectedSheetId.value) {
      selectedSheet = allSheets.value.find(sheet => sheet.id?.toString() === selectedSheetId.value)
      console.log('[Balloons] Found selected sheet:', selectedSheet)
    }
    
    if (editingBalloon.value) {
      // UPDATE MODE - Update existing balloon
      console.log('[Balloons] Updating existing balloon:', editingBalloon.value.id)
      
      const balloonData = {
        id: editingBalloon.value.id,
        creoId: balloonFormData.value.balloon.creoId || null,
        code: balloonFormData.value.balloon.code || null,
        name: balloonFormData.value.balloon.name || null,
        baloonValue: balloonFormData.value.balloon.baloonValue || null,
        baloonType: balloonFormData.value.balloon.baloonType || null,
        // Use selected sheet or preserve existing
        sheet: selectedSheet || editingBalloon.value.sheet || null,
        position: editingBalloon.value.position || null,
        symbol: editingBalloon.value.symbol || null
      }
      
      console.log('[Balloons] Updating balloon with data:', balloonData)
      const balloonResponse = await balloonsApi.update(balloonData.id, balloonData)
      
      if (!balloonResponse.success) {
        throw new Error(balloonResponse.error || 'Failed to update balloon')
      }
      
      console.log('[Balloons] Balloon updated successfully')
      
      // Update note if it exists and has data
      if (balloonFormData.value.note.creoId || balloonFormData.value.note.noteValue) {
        // Find the associated note
        const associatedNote = notes.value.find(note => note.baloon?.id === editingBalloon.value?.id)
        
        if (associatedNote) {
          const noteData = {
            id: associatedNote.id,
            creoId: balloonFormData.value.note.creoId || null,
            code: balloonFormData.value.note.code || null,
            name: balloonFormData.value.note.name || null,
            noteValue: balloonFormData.value.note.noteValue || null,
            noteType: balloonFormData.value.note.noteType || null,
            baloon: editingBalloon.value
          }
          
          console.log('[Balloons] Updating note with data:', noteData)
          const noteResponse = await notesApi.update(noteData.id, noteData)
          
          if (!noteResponse.success) {
            console.warn('[Balloons] Failed to update note:', noteResponse.error)
          } else {
            console.log('[Balloons] Note updated successfully')
          }
        }
      }
      
    } else {
      // CREATE MODE - Create new balloon and note
      console.log('[Balloons] Creating new balloon')
      
      const balloonData = {
        creoId: balloonFormData.value.balloon.creoId || null,
        code: balloonFormData.value.balloon.code || null,
        name: balloonFormData.value.balloon.name || null,
        baloonValue: balloonFormData.value.balloon.baloonValue || null,
        baloonType: balloonFormData.value.balloon.baloonType || null,
        // Associate with selected sheet
        sheet: selectedSheet || null
      }
      
      console.log('[Balloons] Creating balloon:', balloonData)
      const balloonResponse = await balloonsApi.create(balloonData)
      
      if (!balloonResponse.success || !balloonResponse.data) {
        throw new Error(balloonResponse.error || 'Failed to create balloon')
      }
      
      const createdBalloon = balloonResponse.data
      console.log('[Balloons] Balloon created successfully:', createdBalloon)
      
      // Step 2: Create note associated with the balloon
      const noteData = {
        creoId: balloonFormData.value.note.creoId || null,
        code: balloonFormData.value.note.code || null,
        name: balloonFormData.value.note.name || null,
        noteValue: balloonFormData.value.note.noteValue || null,
        noteType: balloonFormData.value.note.noteType || null,
        baloon: createdBalloon // Associate with the balloon
      }
      
      console.log('[Balloons] Creating note:', noteData)
      const noteResponse = await notesApi.create(noteData)
      
      if (!noteResponse.success || !noteResponse.data) {
        throw new Error(noteResponse.error || 'Failed to create note')
      }
      
      const createdNote = noteResponse.data
      console.log('[Balloons] Note created successfully:', createdNote)
      
      // Step 3: Create 4 empty attributes for the note
      console.log('[Balloons] Creating 4 attributes for note')
      const attributePromises = []
      
      for (let i = 1; i <= 4; i++) {
        const attributeData = {
          order: i,
          attributeValue: '',
          note: createdNote
        }
        
        console.log(`[Balloons] Creating attribute ${i}:`, attributeData)
        attributePromises.push(attributesApi.create(attributeData))
      }
      
      // Wait for all attributes to be created
      const attributeResults = await Promise.allSettled(attributePromises)
      
      attributeResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          console.log(`[Balloons] Attribute ${index + 1} created successfully:`, result.value.data)
        } else if (result.status === 'fulfilled') {
          console.warn(`[Balloons] Failed to create attribute ${index + 1}:`, result.value.error)
        } else {
          console.warn(`[Balloons] Failed to create attribute ${index + 1}:`, result.reason)
        }
      })
      
      console.log('[Balloons] Balloon, note, and attributes creation completed')
    }
    
    // Close modal and refresh data
    closeCreateModal()
    await loadData()
    
    console.log('[Balloons] Data refreshed successfully')
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    const operation = editingBalloon.value ? 'update' : 'create'
    error.value = `Failed to ${operation} balloon and note: ${errorMessage}`
    console.error(`[Balloons] ${operation} exception:`, err)
  } finally {
    saving.value = false
  }
}

// CRUD functions
const viewBalloonJson = async (row: any) => {
  console.log('[Balloons] View JSON for row:', row)
  
  if (!row.balloon?.id) {
    console.warn('[Balloons] No balloon ID found for JSON view')
    error.value = 'No balloon found to view'
    return
  }
  
  loadingJson.value = true
  jsonError.value = null
  showJsonModal.value = true
  
  try {
    // Load the balloon by ID to get fresh data with all relationships
    console.log('[Balloons] Loading balloon by ID for JSON view:', row.balloon.id)
    const balloonResponse = await balloonsApi.getById(row.balloon.id)
    
    if (!balloonResponse.success || !balloonResponse.data) {
      throw new Error(balloonResponse.error || 'Failed to load balloon')
    }
    
    jsonViewBalloon.value = balloonResponse.data
    console.log('[Balloons] Balloon loaded for JSON view:', jsonViewBalloon.value)
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    jsonError.value = `Failed to load balloon for JSON view: ${errorMessage}`
    console.error('[Balloons] Error loading balloon for JSON view:', err)
  } finally {
    loadingJson.value = false
  }
}

const editRow = async (row: any) => {
  console.log('[Balloons] Edit row:', row)
  
  if (!row.balloon?.id) {
    console.warn('[Balloons] No balloon ID found for editing')
    error.value = 'No balloon found to edit'
    return
  }
  
  try {
    // Load the balloon by ID to get fresh data
    console.log('[Balloons] Loading balloon by ID:', row.balloon.id)
    const balloonResponse = await balloonsApi.getById(row.balloon.id)
    
    if (!balloonResponse.success || !balloonResponse.data) {
      throw new Error(balloonResponse.error || 'Failed to load balloon')
    }
    
    const balloon = balloonResponse.data
    console.log('[Balloons] Balloon loaded for editing:', balloon)
    console.log('[Balloons] Balloon sheet info:', {
      hasSheet: !!balloon.sheet,
      sheetId: balloon.sheet?.id,
      sheetName: balloon.sheet?.name,
      sheetCreoId: balloon.sheet?.creoId,
      hasDrawing: !!balloon.sheet?.drawing,
      drawingId: balloon.sheet?.drawing?.id,
      drawingName: balloon.sheet?.drawing?.name
    })
    
    // Set editing mode
    editingBalloon.value = balloon
    
    // Populate form with balloon and note data
    balloonFormData.value = {
      balloon: {
        creoId: balloon.creoId || '',
        code: balloon.code || '',
        name: balloon.name || '',
        baloonValue: balloon.baloonValue || '',
        baloonType: balloon.baloonType || ''
      },
      note: {
        creoId: row.note?.creoId || '',
        code: row.note?.code || '',
        name: row.note?.name || '',
        noteValue: row.note?.noteValue || '',
        noteType: row.note?.noteType || ''
      }
    }
    
    // Populate sheet selections if balloon has a sheet association
    if (balloon.sheet?.id) {
      console.log('[Balloons] Balloon has sheet association:', balloon.sheet)
      selectedSheetId.value = balloon.sheet.id.toString()
      
      // Always look up the full sheet info from allSheets to get complete drawing data
      const fullSheet = allSheets.value.find(sheet => sheet.id === balloon.sheet?.id)
      console.log('[Balloons] Full sheet from allSheets:', fullSheet)
      
      if (fullSheet?.drawing?.id) {
        selectedDrawingId.value = fullSheet.drawing.id.toString()
        console.log('[Balloons] Set drawing ID from full sheet:', selectedDrawingId.value)
        console.log('[Balloons] Drawing info:', {
          id: fullSheet.drawing.id,
          name: fullSheet.drawing.name,
          code: fullSheet.drawing.code
        })
      } else {
        console.warn('[Balloons] Could not find drawing for sheet in allSheets')
        console.log('[Balloons] Available sheets:', allSheets.value.map(s => ({
          id: s.id,
          name: s.name,
          hasDrawing: !!s.drawing,
          drawingId: s.drawing?.id
        })))
        selectedDrawingId.value = ''
      }
    } else {
      // Reset selections if no sheet association
      selectedDrawingId.value = ''
      selectedSheetId.value = ''
      console.log('[Balloons] No sheet association, reset selections')
    }
    
    // Clear any previous errors
    formErrors.value = {}
    
    // Open modal
    showCreateModal.value = true
    
    console.log('[Balloons] Modal opened for editing with data:', balloonFormData.value)
    console.log('[Balloons] Selected IDs:', {
      drawingId: selectedDrawingId.value,
      sheetId: selectedSheetId.value
    })
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    error.value = `Failed to load balloon for editing: ${errorMessage}`
    console.error('[Balloons] Error loading balloon for edit:', err)
  }
}

const deleteRow = async (row: any) => {
  if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return
  
  console.log('Delete row:', row)
  await loadData()
}

// Data loading (balloon, note, attributes, models, sheets for modal)
const loadData = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Load core data in parallel
    const [balloonsResponse, notesResponse, attributesResponse, modelsResponse, sheetsResponse] = await Promise.all([
      balloonsApi.getAll(),
      notesApi.getAll(),
      attributesApi.getAll(),
      modelsApi.getAll(),
      sheetsApi.getAll()
    ])
    
    if (balloonsResponse.success) {
      balloons.value = balloonsResponse.data || []
    }
    
    if (notesResponse.success) {
      notes.value = notesResponse.data || []
    }
    
    if (attributesResponse.success) {
      attributeEntities.value = attributesResponse.data || []
    }
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
    }
    
    if (sheetsResponse.success) {
      allSheets.value = sheetsResponse.data || []
    }
    
    console.log('Data loaded:', {
      balloons: balloons.value.length,
      notes: notes.value.length,
      attributes: attributeEntities.value.length,
      models: allModels.value.length,
      sheets: allSheets.value.length
    })
    
    // DEBUG: Check drawings and sheets data
    console.log('[Balloons] Available drawings:', availableDrawings.value.length)
    availableDrawings.value.forEach((drawing, index) => {
      console.log(`[Balloons] Drawing ${index + 1}:`, {
        id: drawing.id,
        code: drawing.code,
        name: drawing.name,
        modelType: drawing.modelType
      })
    })
    
    console.log('[Balloons] Available sheets:', allSheets.value.length)
    allSheets.value.forEach((sheet, index) => {
      console.log(`[Balloons] Sheet ${index + 1}:`, {
        id: sheet.id,
        creoId: sheet.creoId,
        name: sheet.name,
        hasDrawing: !!sheet.drawing,
        drawingId: sheet.drawing?.id,
        drawingName: sheet.drawing?.name
      })
    })
    
    // DEBUG: Verifica associazioni sheet
    console.log('[Balloons] Checking sheet associations:')
    balloons.value.forEach((balloon, index) => {
      console.log(`[Balloons] Balloon ${index + 1}:`, {
        id: balloon.id,
        baloonValue: balloon.baloonValue,
        hasSheet: !!balloon.sheet,
        sheetId: balloon.sheet?.id,
        sheetCreoId: balloon.sheet?.creoId,
        sheetName: balloon.sheet?.name
      })
    })
    
  } catch (err) {
    error.value = 'Failed to load data'
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  await loadData()
  // Reload filtered data if a sheet is selected
  if (filterSheetId.value) {
    await loadFilteredData()
  } else {
    await loadBalloonsWithoutSheet()
  }
}

// Auto-refresh when returning from editor
const handleVisibilityChange = async () => {
  if (!document.hidden && isAuthenticated.value) {
    console.log('[Balloons] Page became visible, refreshing data')
    await handleRefresh()
  }
}

// Initialize
onMounted(async () => {
  if (isAuthenticated.value) {
    await loadData()
    // After loading all data, show balloons without sheet by default
    await loadBalloonsWithoutSheet()
    
    // Listen for page visibility changes to auto-refresh
    document.addEventListener('visibilitychange', handleVisibilityChange)
  } else {
    error.value = 'Authentication required'
  }
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.balloons-dashboard {
  padding: 1rem;
}

/* Stats section styling */
.stats-section {
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.stats-title {
  color: #495057;
  font-weight: 600;
}

/* Table styling */
.table-bordered {
  border: 2px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
  vertical-align: middle;
}

.balloon-row:hover {
  background-color: #f8f9fa;
}

/* Cell specific styling */
.balloon-cell,
.note-cell {
  background-color: #f8fffe;
}

.attribute-cell {
  background-color: #fefff8;
}

.actions-cell {
  background-color: #fafafa;
}

/* Attribute display styling */
.attribute-value {
  font-weight: 500;
  color: #495057;
  min-height: 1.2rem;
  padding: 0.5rem;
}

.badge {
  font-size: 0.7rem;
}

/* Group styling */
.group-section {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.group-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.group-header h6 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.group-header .small {
  color: #6c757d;
}

/* Animation */
.collapse-content {
  transition: all 0.3s ease-in-out;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Modal styling */
.modal.show {
  display: block !important;
}

/* JSON Display */
.json-display {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.json-display code {
  background: none;
  color: #495057;
  padding: 0;
  font-size: inherit;
}

/* Responsive */
@media (max-width: 768px) {
  .balloons-dashboard {
    padding: 0.5rem;
  }
  
  .stats-section .d-flex {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.5rem;
  }
  
  .stats-section .btn {
    align-self: center;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-vertical .btn {
    margin-bottom: 0.25rem;
  }
}
</style>