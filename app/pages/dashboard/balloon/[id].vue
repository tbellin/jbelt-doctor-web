<!--
  Pagina Editor per Balloon - Creazione e Modifica
  URL: /dashboard/balloon/new (creazione)
  URL: /dashboard/balloon/{id} (modifica)
  @version 1.0.0
-->
<template>
  <div class="balloon-editor">
    <!-- Header della pagina -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <NuxtLink to="/dashboard">Panel</NuxtLink>
                </li>
                <li class="breadcrumb-item">
                  <NuxtLink to="/dashboard/balloons">Balloons</NuxtLink>
                </li>
                <li class="breadcrumb-item active">
                  {{ isEditMode ? 'Modifica' : 'Nuovo' }} Balloon
                </li>
              </ol>
            </nav>
            <h1 class="h3 mb-0">
              <i class="bi bi-geo-alt me-2"></i>
              {{ isEditMode ? 'Modifica Balloon' : 'Nuovo Balloon' }}
              <span v-if="isEditMode && balloonFormData.balloon.baloonValue" class="text-muted ms-2">
                #{{ balloonFormData.balloon.baloonValue }}
              </span>
            </h1>
          </div>
          <div class="btn-group">
            <NuxtLink to="/dashboard/balloons" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-2"></i>
              Torna alla Lista
            </NuxtLink>
            <button 
              v-if="isEditMode && currentBalloon" 
              @click="viewBalloonJson" 
              class="btn btn-outline-info"
            >
              <i class="bi bi-eye me-2"></i>
              Visualizza JSON
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">{{ loadingMessage }}</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      <h5 class="alert-heading">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Errore
      </h5>
      <p class="mb-3">{{ error }}</p>
      <div>
        <button class="btn btn-outline-danger me-2" @click="handleRefresh">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Riprova
        </button>
        <NuxtLink to="/dashboard/balloons" class="btn btn-secondary">
          Torna alla Lista
        </NuxtLink>
      </div>
    </div>

    <!-- Main Editor Form -->
    <form v-else @submit.prevent="handleSave" class="balloon-form">
      <!-- Drawing and Sheet Selection Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-diagram-3 me-2"></i>
            Associazione Disegno e Foglio
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <label for="drawingSelect" class="form-label">Disegno *</label>
              <select
                id="drawingSelect"
                v-model="selectedDrawingId"
                @change="onDrawingChange"
                class="form-select"
                :class="{ 'is-invalid': formErrors.drawing }"
                required
              >
                <option value="">Seleziona un disegno...</option>
                <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                  {{ drawing.code || drawing.name }} - {{ drawing.name }}
                </option>
              </select>
              <div v-if="formErrors.drawing" class="invalid-feedback">
                {{ formErrors.drawing }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="sheetSelect" class="form-label">Foglio *</label>
              <select
                id="sheetSelect"
                v-model="selectedSheetId"
                class="form-select"
                :class="{ 'is-invalid': formErrors.sheet }"
                :disabled="!selectedDrawingId"
                required
              >
                <option value="">Seleziona un foglio...</option>
                <option v-for="sheet in filteredSheets" :key="sheet.id" :value="sheet.id">
                  {{ sheet.creoId || sheet.code || sheet.name }} - {{ sheet.name }}
                </option>
              </select>
              <div v-if="formErrors.sheet" class="invalid-feedback">
                {{ formErrors.sheet }}
              </div>
              <div v-if="!selectedDrawingId" class="form-text">
                Seleziona prima un disegno per abilitare la scelta del foglio
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balloon Data Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-geo-alt me-2"></i>
            Dati Balloon
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label for="balloonCreoId" class="form-label">Creo ID *</label>
              <input
                id="balloonCreoId"
                v-model="balloonFormData.balloon.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonCreoId }"
                required
                placeholder="B001"
              >
              <div v-if="formErrors.balloonCreoId" class="invalid-feedback">
                {{ formErrors.balloonCreoId }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="balloonValue" class="form-label">Valore *</label>
              <input
                id="balloonValue"
                v-model="balloonFormData.balloon.baloonValue"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonValue }"
                required
                placeholder="1"
              >
              <div v-if="formErrors.balloonValue" class="invalid-feedback">
                {{ formErrors.balloonValue }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="balloonType" class="form-label">Tipo</label>
              <select
                id="balloonType"
                v-model="balloonFormData.balloon.baloonType"
                class="form-select"
                :class="{ 'is-invalid': formErrors.balloonType }"
              >
                <option value="">Seleziona tipo...</option>
                <option value="CIRCLE">Cerchio</option>
                <option value="SQUARE">Quadrato</option>
                <option value="TRIANGLE">Triangolo</option>
                <option value="DIAMOND">Rombo</option>
              </select>
              <div v-if="formErrors.balloonType" class="invalid-feedback">
                {{ formErrors.balloonType }}
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-md-6">
              <label for="balloonName" class="form-label">Nome</label>
              <input
                id="balloonName"
                v-model="balloonFormData.balloon.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonName }"
                placeholder="Nome del balloon"
              >
              <div v-if="formErrors.balloonName" class="invalid-feedback">
                {{ formErrors.balloonName }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="balloonCode" class="form-label">Codice</label>
              <input
                id="balloonCode"
                v-model="balloonFormData.balloon.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonCode }"
                placeholder="BALL_001"
              >
              <div v-if="formErrors.balloonCode" class="invalid-feedback">
                {{ formErrors.balloonCode }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Note Data Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-sticky me-2"></i>
            Dati Nota
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label for="noteCreoId" class="form-label">Creo ID *</label>
              <input
                id="noteCreoId"
                v-model="balloonFormData.note.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteCreoId }"
                required
                placeholder="N001"
              >
              <div v-if="formErrors.noteCreoId" class="invalid-feedback">
                {{ formErrors.noteCreoId }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="noteValue" class="form-label">Valore</label>
              <input
                id="noteValue"
                v-model="balloonFormData.note.noteValue"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteValue }"
                placeholder="Valore della nota"
              >
              <div v-if="formErrors.noteValue" class="invalid-feedback">
                {{ formErrors.noteValue }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="noteType" class="form-label">Tipo</label>
              <select
                id="noteType"
                v-model="balloonFormData.note.noteType"
                class="form-select"
                :class="{ 'is-invalid': formErrors.noteType }"
              >
                <option value="">Seleziona tipo...</option>
                <option value="STANDARD">Standard</option>
                <option value="LEADER">Leader</option>
                <option value="ARROW">Freccia</option>
              </select>
              <div v-if="formErrors.noteType" class="invalid-feedback">
                {{ formErrors.noteType }}
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-md-6">
              <label for="noteName" class="form-label">Nome</label>
              <input
                id="noteName"
                v-model="balloonFormData.note.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteName }"
                placeholder="Nome della nota"
              >
              <div v-if="formErrors.noteName" class="invalid-feedback">
                {{ formErrors.noteName }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="noteCode" class="form-label">Codice</label>
              <input
                id="noteCode"
                v-model="balloonFormData.note.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteCode }"
                placeholder="NOTE_001"
              >
              <div v-if="formErrors.noteCode" class="invalid-feedback">
                {{ formErrors.noteCode }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attributes Management Card -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-tags me-2"></i>
              Attributi ({{ attributes.length }}/4)
            </h5>
            <button 
              v-if="attributes.length < 4" 
              type="button" 
              @click="addAttribute" 
              class="btn btn-sm btn-outline-primary"
            >
              <i class="bi bi-plus me-1"></i>
              Aggiungi Attributo
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="attributes.length === 0" class="text-center py-4 text-muted">
            <i class="bi bi-tags display-4"></i>
            <p class="mt-2">Nessun attributo definito</p>
            <button type="button" @click="addAttribute" class="btn btn-outline-primary">
              <i class="bi bi-plus me-2"></i>
              Aggiungi il primo attributo
            </button>
          </div>
          
          <div v-else>
            <!-- Attributes List -->
            <div class="row">
              <div 
                v-for="(attribute, index) in attributes" 
                :key="`attr-${index}`"
                class="col-12 mb-3"
              >
                <div class="card border-light">
                  <div class="card-header bg-light py-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">
                        Attributo {{ attribute.order || (index + 1) }}
                      </h6>
                      <div class="btn-group btn-group-sm">
                        <button 
                          v-if="index > 0" 
                          type="button" 
                          @click="moveAttributeUp(index)"
                          class="btn btn-outline-secondary"
                          title="Sposta su"
                        >
                          <i class="bi bi-arrow-up"></i>
                        </button>
                        <button 
                          v-if="index < attributes.length - 1" 
                          type="button" 
                          @click="moveAttributeDown(index)"
                          class="btn btn-outline-secondary"
                          title="Sposta giù"
                        >
                          <i class="bi bi-arrow-down"></i>
                        </button>
                        <button 
                          type="button" 
                          @click="removeAttribute(index)"
                          class="btn btn-outline-danger"
                          title="Rimuovi"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="card-body py-3">
                    <div class="row">
                      <div class="col-md-4">
                        <label :for="`attrValue-${index}`" class="form-label">Valore</label>
                        <input
                          :id="`attrValue-${index}`"
                          v-model="attribute.attributeValue"
                          type="text"
                          class="form-control"
                          placeholder="Valore dell'attributo"
                        >
                      </div>
                      <div class="col-md-4">
                        <label :for="`attrType-${index}`" class="form-label">Tipo Valore</label>
                        <select
                          :id="`attrType-${index}`"
                          v-model="attribute.typeValue"
                          class="form-select"
                        >
                          <option value="">Seleziona tipo...</option>
                          <option value="STRING">Stringa</option>
                          <option value="INTEGER">Intero</option>
                          <option value="DOUBLE">Decimale</option>
                          <option value="BOOLEAN">Booleano</option>
                          <option value="DATE">Data</option>
                          <option value="CONTENT">Contenuto</option>
                          <option value="URL">URL</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label :for="`attrOrder-${index}`" class="form-label">Ordine</label>
                        <input
                          :id="`attrOrder-${index}`"
                          v-model.number="attribute.order"
                          type="number"
                          class="form-control"
                          min="1"
                          max="4"
                          readonly
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <NuxtLink to="/dashboard/balloons" class="btn btn-outline-secondary">
                <i class="bi bi-x-lg me-2"></i>
                Annulla
              </NuxtLink>
            </div>
            <div>
              <button 
                v-if="isEditMode"
                type="button" 
                @click="handleDelete" 
                class="btn btn-outline-danger me-2"
                :disabled="saving"
              >
                <i class="bi bi-trash me-2"></i>
                Elimina
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi me-2" :class="isEditMode ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ saving ? 'Salvataggio...' : (isEditMode ? 'Aggiorna' : 'Crea') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- JSON View Modal -->
    <div v-if="showJsonModal" class="modal show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5>JSON Balloon - {{ currentBalloon?.baloonValue || 'N/A' }}</h5>
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
            <button class="btn btn-primary" @click="copyJsonToClipboard" :disabled="!currentBalloon">
              <i class="bi bi-clipboard me-2"></i>
              Copia JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IAttributeEntity } from '~/model/attribute-entity.model'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const { balloons: balloonsApi, notes: notesApi, attributeEntities: attributesApi, models: modelsApi, sheets: sheetsApi } = useApi()
const { isAuthenticated } = useAuth()

// Reactive state
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const loadingMessage = ref('Caricamento...')

// Data
const allModels = ref<IModel[]>([])
const allSheets = ref<ISheet[]>([])
const currentBalloon = ref<IBaloon | null>(null)
const currentNote = ref<INote | null>(null)

// Form state
const selectedDrawingId = ref('')
const selectedSheetId = ref('')
const attributes = ref<IAttributeEntity[]>([])

// Form data
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

// JSON Modal state
const showJsonModal = ref(false)
const loadingJson = ref(false)
const jsonError = ref<string | null>(null)

// Computed properties
const isEditMode = computed(() => {
  return route.params.id !== 'new'
})

const balloonId = computed(() => {
  return isEditMode.value ? parseInt(route.params.id as string) : null
})

const availableDrawings = computed(() => {
  return allModels.value.filter(model => model.modelType === 'DRAWING')
})

const filteredSheets = computed(() => {
  if (!selectedDrawingId.value) return []
  
  return allSheets.value.filter(sheet => 
    sheet.drawing?.id?.toString() === selectedDrawingId.value
  )
})

const formattedBalloonJson = computed(() => {
  if (!currentBalloon.value) return ''
  try {
    return JSON.stringify(currentBalloon.value, null, 2)
  } catch (err) {
    return 'Error formatting JSON: ' + err
  }
})

// Methods
const loadInitialData = async () => {
  loading.value = true
  loadingMessage.value = 'Caricamento dati base...'
  error.value = null
  
  try {
    // Load models and sheets
    const [modelsResponse, sheetsResponse] = await Promise.all([
      modelsApi.getAll(),
      sheetsApi.getAll()
    ])
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
    }
    
    if (sheetsResponse.success) {
      allSheets.value = sheetsResponse.data || []
    }
    
    console.log('[BalloonEditor] Base data loaded:', {
      models: allModels.value.length,
      sheets: allSheets.value.length,
      drawings: availableDrawings.value.length
    })
    
  } catch (err) {
    console.error('[BalloonEditor] Error loading initial data:', err)
    error.value = 'Errore nel caricamento dei dati base'
  } finally {
    loading.value = false
  }
}

const loadBalloonForEdit = async () => {
  if (!balloonId.value) return
  
  loading.value = true
  loadingMessage.value = 'Caricamento balloon...'
  error.value = null
  
  try {
    // Load balloon by ID
    const balloonResponse = await balloonsApi.getById(balloonId.value)
    
    if (!balloonResponse.success || !balloonResponse.data) {
      throw new Error(balloonResponse.error || 'Balloon non trovato')
    }
    
    const balloon = balloonResponse.data
    currentBalloon.value = balloon
    
    console.log('[BalloonEditor] Balloon loaded:', balloon)
    
    // Populate form data
    balloonFormData.value = {
      balloon: {
        creoId: balloon.creoId || '',
        code: balloon.code || '',
        name: balloon.name || '',
        baloonValue: balloon.baloonValue || '',
        baloonType: balloon.baloonType || ''
      },
      note: {
        creoId: '',
        code: '',
        name: '',
        noteValue: '',
        noteType: ''
      }
    }
    
    // Set drawing and sheet selections
    if (balloon.sheet?.id) {
      selectedSheetId.value = balloon.sheet.id.toString()
      
      // Find drawing from sheet
      const fullSheet = allSheets.value.find(sheet => sheet.id === balloon.sheet?.id)
      if (fullSheet?.drawing?.id) {
        selectedDrawingId.value = fullSheet.drawing.id.toString()
        console.log('[BalloonEditor] Set drawing from sheet:', selectedDrawingId.value)
      }
    }
    
    // Load associated note and attributes
    await loadNoteAndAttributes()
    
  } catch (err) {
    console.error('[BalloonEditor] Error loading balloon:', err)
    error.value = err instanceof Error ? err.message : 'Errore nel caricamento del balloon'
  } finally {
    loading.value = false
  }
}

const loadNoteAndAttributes = async () => {
  if (!currentBalloon.value?.id) return
  
  try {
    // Load notes for this balloon
    const notesResponse = await notesApi.getAll()
    if (notesResponse.success) {
      const balloonNotes = (notesResponse.data || []).filter(
        note => note.baloon?.id === currentBalloon.value?.id
      )
      
      if (balloonNotes.length > 0) {
        currentNote.value = balloonNotes[0]
        
        // Update note form data
        balloonFormData.value.note = {
          creoId: currentNote.value.creoId || '',
          code: currentNote.value.code || '',
          name: currentNote.value.name || '',
          noteValue: currentNote.value.noteValue || '',
          noteType: currentNote.value.noteType || ''
        }
        
        // Load attributes for this note
        const attributesResponse = await attributesApi.getAll()
        if (attributesResponse.success) {
          const noteAttributes = (attributesResponse.data || [])
            .filter(attr => attr.note?.id === currentNote.value?.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
          
          attributes.value = noteAttributes
          console.log('[BalloonEditor] Loaded attributes:', noteAttributes.length)
        }
      }
    }
  } catch (err) {
    console.error('[BalloonEditor] Error loading note and attributes:', err)
  }
}

const onDrawingChange = () => {
  // Reset sheet when drawing changes
  selectedSheetId.value = ''
  console.log('[BalloonEditor] Drawing changed, reset sheet')
}

const addAttribute = () => {
  if (attributes.value.length >= 4) return
  
  const newOrder = attributes.value.length + 1
  attributes.value.push({
    id: null,
    order: newOrder,
    attributeValue: '',
    typeValue: 'STRING',
    note: null
  })
}

const removeAttribute = (index: number) => {
  if (!confirm('Sei sicuro di voler rimuovere questo attributo?')) return
  
  attributes.value.splice(index, 1)
  // Reorder remaining attributes
  reorderAttributes()
}

const moveAttributeUp = (index: number) => {
  if (index <= 0) return
  
  const temp = attributes.value[index]
  attributes.value[index] = attributes.value[index - 1]
  attributes.value[index - 1] = temp
  
  reorderAttributes()
}

const moveAttributeDown = (index: number) => {
  if (index >= attributes.value.length - 1) return
  
  const temp = attributes.value[index]
  attributes.value[index] = attributes.value[index + 1]
  attributes.value[index + 1] = temp
  
  reorderAttributes()
}

const reorderAttributes = () => {
  attributes.value.forEach((attr, index) => {
    attr.order = index + 1
  })
}

const validateForm = (): boolean => {
  const errors: Record<string, string> = {}
  
  // Validate drawing and sheet
  if (!selectedDrawingId.value) {
    errors.drawing = 'È obbligatorio selezionare un disegno'
  }
  if (!selectedSheetId.value) {
    errors.sheet = 'È obbligatorio selezionare un foglio'
  }
  
  // Validate balloon
  if (!balloonFormData.value.balloon.creoId?.trim()) {
    errors.balloonCreoId = 'Questo campo è obbligatorio'
  }
  if (!balloonFormData.value.balloon.baloonValue?.trim()) {
    errors.balloonValue = 'Questo campo è obbligatorio'
  }
  
  // Validate note
  if (!balloonFormData.value.note.creoId?.trim()) {
    errors.noteCreoId = 'Questo campo è obbligatorio'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSave = async () => {
  console.log('[BalloonEditor] Save started')
  
  if (!validateForm()) {
    console.log('[BalloonEditor] Validation failed')
    return
  }
  
  saving.value = true
  error.value = null
  
  try {
    // Get selected sheet
    const selectedSheet = allSheets.value.find(sheet => 
      sheet.id?.toString() === selectedSheetId.value
    )
    
    if (!selectedSheet) {
      throw new Error('Foglio selezionato non trovato')
    }
    
    if (isEditMode.value && currentBalloon.value) {
      // Update existing balloon
      await updateBalloon(selectedSheet)
    } else {
      // Create new balloon
      await createBalloon(selectedSheet)
    }
    
    // Redirect to list
    await router.push('/dashboard/balloons')
    
  } catch (err) {
    console.error('[BalloonEditor] Save error:', err)
    error.value = err instanceof Error ? err.message : 'Errore nel salvataggio'
  } finally {
    saving.value = false
  }
}

const createBalloon = async (selectedSheet: ISheet) => {
  // Create balloon
  const balloonData = {
    creoId: balloonFormData.value.balloon.creoId,
    code: balloonFormData.value.balloon.code || null,
    name: balloonFormData.value.balloon.name || null,
    baloonValue: balloonFormData.value.balloon.baloonValue,
    baloonType: balloonFormData.value.balloon.baloonType || null,
    sheet: selectedSheet
  }
  
  const balloonResponse = await balloonsApi.create(balloonData)
  if (!balloonResponse.success || !balloonResponse.data) {
    throw new Error(balloonResponse.error || 'Errore nella creazione del balloon')
  }
  
  const createdBalloon = balloonResponse.data
  console.log('[BalloonEditor] Balloon created:', createdBalloon)
  
  // Create note
  const noteData = {
    creoId: balloonFormData.value.note.creoId,
    code: balloonFormData.value.note.code || null,
    name: balloonFormData.value.note.name || null,
    noteValue: balloonFormData.value.note.noteValue || null,
    noteType: balloonFormData.value.note.noteType || null,
    baloon: createdBalloon
  }
  
  const noteResponse = await notesApi.create(noteData)
  if (!noteResponse.success || !noteResponse.data) {
    throw new Error(noteResponse.error || 'Errore nella creazione della nota')
  }
  
  const createdNote = noteResponse.data
  console.log('[BalloonEditor] Note created:', createdNote)
  
  // Create attributes
  await createAttributes(createdNote)
}

const updateBalloon = async (selectedSheet: ISheet) => {
  if (!currentBalloon.value?.id) throw new Error('ID balloon mancante')
  
  // Update balloon
  const balloonData = {
    id: currentBalloon.value.id,
    creoId: balloonFormData.value.balloon.creoId,
    code: balloonFormData.value.balloon.code || null,
    name: balloonFormData.value.balloon.name || null,
    baloonValue: balloonFormData.value.balloon.baloonValue,
    baloonType: balloonFormData.value.balloon.baloonType || null,
    sheet: selectedSheet,
    position: currentBalloon.value.position,
    symbol: currentBalloon.value.symbol
  }
  
  const balloonResponse = await balloonsApi.update(currentBalloon.value.id, balloonData)
  if (!balloonResponse.success) {
    throw new Error(balloonResponse.error || 'Errore nell\'aggiornamento del balloon')
  }
  
  console.log('[BalloonEditor] Balloon updated')
  
  // Update or create note
  if (currentNote.value?.id) {
    // Update existing note
    const noteData = {
      id: currentNote.value.id,
      creoId: balloonFormData.value.note.creoId,
      code: balloonFormData.value.note.code || null,
      name: balloonFormData.value.note.name || null,
      noteValue: balloonFormData.value.note.noteValue || null,
      noteType: balloonFormData.value.note.noteType || null,
      baloon: currentBalloon.value
    }
    
    const noteResponse = await notesApi.update(currentNote.value.id, noteData)
    if (!noteResponse.success) {
      console.warn('[BalloonEditor] Note update failed:', noteResponse.error)
    }
    
    // Update attributes
    await updateAttributes()
  } else {
    // Create new note
    const noteData = {
      creoId: balloonFormData.value.note.creoId,
      code: balloonFormData.value.note.code || null,
      name: balloonFormData.value.note.name || null,
      noteValue: balloonFormData.value.note.noteValue || null,
      noteType: balloonFormData.value.note.noteType || null,
      baloon: currentBalloon.value
    }
    
    const noteResponse = await notesApi.create(noteData)
    if (noteResponse.success && noteResponse.data) {
      currentNote.value = noteResponse.data
      await createAttributes(noteResponse.data)
    }
  }
}

const createAttributes = async (note: INote) => {
  console.log('[BalloonEditor] Creating attributes for note:', note.id)
  
  for (const attr of attributes.value) {
    if (!attr.attributeValue?.trim()) continue
    
    const attributeData = {
      order: attr.order,
      attributeValue: attr.attributeValue,
      typeValue: attr.typeValue || 'STRING',
      note: note
    }
    
    const result = await attributesApi.create(attributeData)
    if (!result.success) {
      console.warn('[BalloonEditor] Attribute creation failed:', result.error)
    }
  }
}

const updateAttributes = async () => {
  if (!currentNote.value?.id) return
  
  console.log('[BalloonEditor] Updating attributes for note:', currentNote.value.id)
  
  for (const attr of attributes.value) {
    if (attr.id) {
      // Update existing attribute
      const attributeData = {
        id: attr.id,
        order: attr.order,
        attributeValue: attr.attributeValue || '',
        typeValue: attr.typeValue || 'STRING',
        note: currentNote.value
      }
      
      const result = await attributesApi.update(attr.id, attributeData)
      if (!result.success) {
        console.warn('[BalloonEditor] Attribute update failed:', result.error)
      }
    } else if (attr.attributeValue?.trim()) {
      // Create new attribute
      const attributeData = {
        order: attr.order,
        attributeValue: attr.attributeValue,
        typeValue: attr.typeValue || 'STRING',
        note: currentNote.value
      }
      
      const result = await attributesApi.create(attributeData)
      if (!result.success) {
        console.warn('[BalloonEditor] Attribute creation failed:', result.error)
      }
    }
  }
}

const handleDelete = async () => {
  if (!isEditMode.value || !currentBalloon.value?.id) return
  
  if (!confirm('Sei sicuro di voler eliminare questo balloon? Questa azione non può essere annullata.')) {
    return
  }
  
  saving.value = true
  error.value = null
  
  try {
    const result = await balloonsApi.delete(currentBalloon.value.id)
    if (!result.success) {
      throw new Error(result.error || 'Errore nell\'eliminazione')
    }
    
    console.log('[BalloonEditor] Balloon deleted')
    await router.push('/dashboard/balloons')
    
  } catch (err) {
    console.error('[BalloonEditor] Delete error:', err)
    error.value = err instanceof Error ? err.message : 'Errore nell\'eliminazione'
  } finally {
    saving.value = false
  }
}

const handleRefresh = async () => {
  if (isEditMode.value) {
    await loadBalloonForEdit()
  } else {
    await loadInitialData()
  }
}

const viewBalloonJson = async () => {
  if (!currentBalloon.value?.id) return
  
  loadingJson.value = true
  jsonError.value = null
  showJsonModal.value = true
  
  try {
    const response = await balloonsApi.getById(currentBalloon.value.id)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Errore nel caricamento')
    }
    
    currentBalloon.value = response.data
  } catch (err) {
    jsonError.value = err instanceof Error ? err.message : 'Errore nel caricamento'
  } finally {
    loadingJson.value = false
  }
}

const closeJsonModal = () => {
  showJsonModal.value = false
  jsonError.value = null
}

const copyJsonToClipboard = async () => {
  if (!currentBalloon.value) return
  
  try {
    const jsonText = JSON.stringify(currentBalloon.value, null, 2)
    await navigator.clipboard.writeText(jsonText)
    console.log('[BalloonEditor] JSON copied to clipboard')
  } catch (err) {
    console.error('[BalloonEditor] Failed to copy JSON:', err)
  }
}

// Initialize
onMounted(async () => {
  if (!isAuthenticated.value) {
    error.value = 'Autenticazione richiesta'
    return
  }
  
  await loadInitialData()
  
  if (isEditMode.value) {
    await loadBalloonForEdit()
  }
  
  console.log('[BalloonEditor] Component initialized:', {
    isEditMode: isEditMode.value,
    balloonId: balloonId.value
  })
})
</script>

<style scoped>
.balloon-editor {
  padding: 1rem;
  min-height: 100vh;
}

.balloon-form {
  max-width: 1200px;
  margin: 0 auto;
}

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

.card-header h5 {
  color: #495057;
  font-weight: 600;
}

.breadcrumb {
  background: none;
  padding: 0;
  margin-bottom: 0.5rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '›';
  color: #6c757d;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .balloon-editor {
    padding: 0.5rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-group {
    align-self: stretch;
  }
}
</style>