<!--
  Pagina Sheet Semplificata - SENZA LOOP INFINITI
  Versione minimalista per risolvere il problema del loop
-->
<template>
  <div class="sheets-dashboard">
    <!-- Simple Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">
            <i class="bi bi-file-earmark-text me-2"></i>
            {{ t('sheets:title') }}
          </h1>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" @click="handleRefresh" :disabled="loading">
              <i class="bi bi-arrow-clockwise me-2"></i>
              {{ t('sheets:actions.refresh') }}
            </button>
            <button class="btn btn-primary" @click="showCreateModal = true" :disabled="loading">
              <i class="bi bi-plus-lg me-2"></i>
              {{ t('sheets:actions.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="card-title mb-1">{{ sheets.length }}</h4>
                <p class="card-text mb-0">{{ t('sheets:stats.total') }}</p>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-file-earmark-text"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="card-title mb-1">{{ sheetsWithDrawing }}</h4>
                <p class="card-text mb-0">{{ t('sheets:stats.withDrawing') }}</p>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-image"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="card-title mb-1">{{ totalModelsAssociated }}</h4>
                <p class="card-text mb-0">{{ t('sheets:stats.modelsAssociated') }}</p>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-gear-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="card-title mb-1">{{ formatCount }}</h4>
                <p class="card-text mb-0">{{ t('sheets:stats.formats') }}</p>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-rulers"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Table -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Sheets List ({{ sheets.length }})</h5>
      </div>
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading sheets...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger">
          <strong>Error:</strong> {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="handleRefresh">
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!sheets.length" class="text-center py-5">
          <i class="bi bi-file-earmark-text display-1 text-muted"></i>
          <h4 class="mt-3">{{ t('sheets:empty.title') }}</h4>
          <p class="text-muted">{{ t('sheets:empty.message') }}</p>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="bi bi-plus-lg me-2"></i>
            {{ t('sheets:actions.createFirst') }}
          </button>
        </div>

        <!-- Table with Data -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ t('sheets:table.id') }}</th>
                <th>{{ t('sheets:table.code') }}</th>
                <th>{{ t('sheets:table.name') }}</th>
                <th>{{ t('sheets:table.format') }}</th>
                <th>{{ t('sheets:table.drawing') }}</th>
                <th>{{ t('sheets:table.models') }}</th>
                <th>{{ t('common:actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sheet in sheets" :key="sheet.id">
                <td>{{ sheet.id }}</td>
                <td>{{ sheet.code || '-' }}</td>
                <td>{{ sheet.name || '-' }}</td>
                <td>
                  <span class="badge bg-info">{{ sheet.formatType || '-' }}</span>
                </td>
                <td>
                  <span v-if="sheet.drawing" class="badge bg-success">
                    {{ sheet.drawing.name || sheet.drawing.code || 'Drawing' }}
                  </span>
                  <span v-else class="text-muted">{{ t('sheets:table.noDrawing') }}</span>
                </td>
                <td>
                  <span v-if="sheet.models && sheet.models.length" class="badge bg-primary">
                    {{ sheet.models.length }} {{ sheet.models.length === 1 ? 'model' : 'models' }}
                  </span>
                  <span v-else class="text-muted">{{ t('sheets:table.noModels') }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="viewSheet(sheet)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="editSheet(sheet)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteSheet(sheet)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showCreateModal" class="modal show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>{{ editingSheet ? t('sheets:modal.edit') : t('sheets:modal.create') }}</h5>
            <button class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSheet">
              <div class="mb-3">
                <label class="form-label">{{ t('sheets:form.code') }}</label>
                <input v-model="formData.code" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('sheets:form.name') }}</label>
                <input v-model="formData.name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('sheets:form.format') }}</label>
                <select v-model="formData.formatType" class="form-select" required>
                  <option value="">{{ t('common:select') }}</option>
                  <option value="A0">A0</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="A3V">A3V</option>
                  <option value="A3O">A3O</option>
                  <option value="A4V">A4V</option>
                  <option value="A4O">A4O</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('sheets:form.creoId') }}</label>
                <input v-model="formData.creoId" class="form-control">
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('sheets:form.drawing') }}</label>
                <select v-model="formData.drawingId" class="form-select">
                  <option value="">{{ t('sheets:form.noDrawing') }}</option>
                  <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                    [DRAWING] {{ drawing.code }} - {{ drawing.name }}{{ drawing.creoId ? ` (${drawing.creoId})` : '' }}
                  </option>
                </select>
                <div class="form-text">
                  {{ t('sheets:form.drawingHelp') }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">{{ t('sheets:form.models') }}</label>
                <div class="models-selection border rounded p-3" style="max-height: 200px; overflow-y: auto;">
                  <div class="form-text mb-2">
                    {{ t('sheets:form.modelsHelp') }}
                  </div>
                  
                  <div v-if="availableModels.length === 0" class="text-muted text-center py-3">
                    {{ t('sheets:form.noModels') }}
                  </div>
                  
                  <div v-else>
                    <div v-for="model in availableModels" :key="model.id" class="form-check mb-2">
                      <input
                        :id="`modal-model-${model.id}`"
                        type="checkbox"
                        class="form-check-input"
                        :value="model.id?.toString()"
                        :checked="formData.modelIds.includes(model.id?.toString() || '')"
                        @change="toggleModelSelection"
                      >
                      <label :for="`modal-model-${model.id}`" class="form-check-label">
                        <span class="badge me-2" :class="getModelBadgeClass(model.modelType)">
                          {{ model.modelType }}
                        </span>
                        <strong>{{ model.code }}</strong> - {{ model.name }}
                        <span v-if="model.creoId" class="text-muted ms-1">({{ model.creoId }})</span>
                        <span v-if="model.instanceType" class="badge bg-secondary ms-1">{{ model.instanceType }}</span>
                      </label>
                    </div>
                  </div>
                  
                  <!-- Selected models summary -->
                  <div v-if="formData.modelIds.length > 0" class="mt-3 pt-2 border-top">
                    <small class="text-muted">{{ t('sheets:form.selectedModels') }}:</small>
                    <div class="mt-1">
                      <span 
                        v-for="modelId in formData.modelIds" 
                        :key="modelId"
                        class="badge bg-secondary me-1 mb-1"
                      >
                        {{ getModelDisplayName(modelId) }}
                        <i 
                          class="bi bi-x-circle ms-1" 
                          style="cursor: pointer;"
                          @click="removeModelFromSelection(modelId)"
                          :title="t('sheets:form.removeModel')"
                        ></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">{{ t('common:cancel') }}</button>
            <button class="btn btn-primary" @click="saveSheet" :disabled="saving">
              {{ saving ? t('common:saving') : (editingSheet ? t('common:update') : t('common:create')) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal && viewingSheet" class="modal show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5>{{ t('sheets:modal.view') }} - {{ viewingSheet.name }}</h5>
            <button class="btn-close" @click="closeViewModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Basic Information -->
              <div class="col-md-6">
                <h6 class="text-primary mb-3">
                  <i class="bi bi-info-circle me-2"></i>
                  {{ t('sheets:view.sheetInfo') }}
                </h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>{{ t('sheets:table.id') }}:</strong></td>
                      <td>{{ viewingSheet.id }}</td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('sheets:table.code') }}:</strong></td>
                      <td>{{ viewingSheet.code || '-' }}</td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('sheets:table.name') }}:</strong></td>
                      <td>{{ viewingSheet.name || '-' }}</td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('sheets:table.format') }}:</strong></td>
                      <td>
                        <span class="badge bg-info">{{ viewingSheet.formatType || '-' }}</span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('sheets:table.creoId') }}:</strong></td>
                      <td>{{ viewingSheet.creoId || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Drawing and Models Information -->
              <div class="col-md-6">
                <h6 class="text-success mb-3">
                  <i class="bi bi-image me-2"></i>
                  {{ t('sheets:view.drawingInfo') }}
                </h6>
                <div v-if="viewingSheet.drawing" class="mb-3">
                  <div class="card border-success">
                    <div class="card-body py-2">
                      <div class="d-flex align-items-center">
                        <span class="badge bg-success me-2">{{ viewingSheet.drawing.modelType }}</span>
                        <div>
                          <strong>{{ viewingSheet.drawing.name || viewingSheet.drawing.code }}</strong>
                          <div class="small text-muted">
                            ID: {{ viewingSheet.drawing.id }}
                            {{ viewingSheet.drawing.creoId ? ` | Creo: ${viewingSheet.drawing.creoId}` : '' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted mb-3">
                  <i class="bi bi-dash-circle me-2"></i>
                  {{ t('sheets:table.noDrawing') }}
                </div>

                <h6 class="text-warning mb-3">
                  <i class="bi bi-gear me-2"></i>
                  {{ t('sheets:view.modelsInfo') }}
                </h6>
                <div v-if="viewingSheet.models && viewingSheet.models.length" class="mb-3">
                  <div v-for="model in viewingSheet.models" :key="model.id" class="card border-warning mb-2">
                    <div class="card-body py-2">
                      <div class="d-flex align-items-center">
                        <span class="badge me-2" :class="getModelBadgeClass(model.modelType)">
                          {{ model.modelType }}
                        </span>
                        <div>
                          <strong>{{ model.name || model.code }}</strong>
                          <div class="small text-muted">
                            ID: {{ model.id }}
                            {{ model.creoId ? ` | Creo: ${model.creoId}` : '' }}
                            {{ model.instanceType ? ` | ${model.instanceType}` : '' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  <i class="bi bi-dash-circle me-2"></i>
                  {{ t('sheets:table.noModels') }}
                </div>
              </div>
            </div>

            <!-- JSON Data (Debug) -->
            <div v-if="isDebugMode" class="mt-4">
              <h6 class="text-info mb-3">
                <i class="bi bi-code-square me-2"></i>
                {{ t('sheets:view.jsonData') }}
              </h6>
              <div class="card bg-light">
                <div class="card-body">
                  <pre class="mb-0 small">{{ JSON.stringify(viewingSheet, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeViewModal">{{ t('common:cancel') }}</button>
            <button class="btn btn-primary" @click="editFromView">
              <i class="bi bi-pencil me-2"></i>
              {{ t('common:edit') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Panel (only in debug mode) -->
    <div v-if="isDebugMode" class="mt-4">
      <div class="card border-warning">
        <div class="card-header bg-warning bg-opacity-10">
          <div class="d-flex justify-content-between align-items-center">
            <span>
              <i class="bi bi-bug me-2"></i>
              Debug Panel - Sheets
            </span>
            <div class="btn-group btn-group-sm">
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
              <button class="btn btn-outline-success" @click="testDrawingAssociation" :disabled="loading">
                <i class="bi bi-image"></i> Test Drawing
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
              <button class="btn btn-outline-info" @click="showDebugPanel = !showDebugPanel">
                <i :class="['bi', showDebugPanel ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row small">
            <div class="col-md-6">
              <strong>Auth Status:</strong> 
              <span :class="isAuthenticated ? 'text-success' : 'text-danger'">
                {{ isAuthenticated ? 'Authenticated' : 'Not authenticated' }}
              </span><br>
              <strong>User:</strong> {{ user?.login || 'None' }}<br>
              <strong>Backend:</strong> <code>{{ useRuntimeConfig().public.apiBase }}</code><br>
              <strong>API Host:</strong> <code>{{ useRuntimeConfig().public.apiHost }}</code><br>
              <strong>Sheets Count:</strong> {{ sheets.length }}<br>
              <strong>Drawings Count:</strong> {{ availableDrawings.length }}<br>
              <strong>Models Count:</strong> {{ availableModels.length }}<br>
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
        </div>
        <div v-show="showDebugPanel" class="card-body border-top">
          <h6>Loaded Data:</h6>
          <div class="row">
            <div class="col-6">
              <strong>Sheets ({{ sheets.length }}):</strong>
              <ul class="list-unstyled">
                <li v-for="sheet in sheets.slice(0, 3)" :key="sheet.id" class="small">
                  {{ sheet.id }}: {{ sheet.name }} ({{ sheet.formatType }})
                </li>
              </ul>
            </div>
            <div class="col-6">
              <strong>Drawings ({{ availableDrawings.length }}):</strong>
              <ul class="list-unstyled">
                <li v-for="drawing in availableDrawings.slice(0, 3)" :key="drawing.id" class="small">
                  {{ drawing.id }}: {{ drawing.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi, type SheetWithRelations } from '~/composables/useApi'
import type { IModel } from '~/model/model.model'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import { useDebug } from '~/composables/useDebug'
import { testBackendConnection } from '~/utils/testBackend'
import { 
  enrichPartialModels, 
  createCleanModelForUpdate, 
  createCleanSheetForUpdate,
  validateObjectForUpdate,
  debugLogObject 
} from '~/utils/objectEnrichment'

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { t } = useI18n()
const { sheets: sheetsApi, models: modelsApi } = useApi()
const { isAuthenticated, user, login } = useAuth()
const { isDebugMode } = useDebug()

// Simple reactive state
const sheets = ref<SheetWithRelations[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Models for dropdown
const availableDrawings = ref<IModel[]>([])
const availableModels = ref<IModel[]>([])  // PART and ASSEMBLY models for association

// Modal state
const showCreateModal = ref(false)
const showViewModal = ref(false)
const editingSheet = ref<SheetWithRelations | null>(null)
const viewingSheet = ref<SheetWithRelations | null>(null)
const saving = ref(false)

// Debug state
const debugInfo = ref<string>('')
const showDebugPanel = ref(false)

// Form data - extended with models support
const formData = ref({
  code: '',
  name: '',
  formatType: '',
  creoId: '',
  drawingId: '',
  modelIds: [] as string[]  // Array of model IDs for association
})

// Simple computed stats
const sheetsWithDrawing = computed(() => 
  sheets.value.filter(sheet => sheet.drawing).length
)

const sheetsWithoutDrawing = computed(() => 
  sheets.value.filter(sheet => !sheet.drawing).length
)

const formatCount = computed(() => {
  const formats = new Set(sheets.value.map(sheet => sheet.formatType).filter(f => f))
  return formats.size
})

const totalModelsAssociated = computed(() => {
  return sheets.value.reduce((total, sheet) => {
    return total + (sheet.models?.length || 0)
  }, 0)
})

// Load functions
const loadDrawings = async (): Promise<void> => {
  try {
    console.log('[SimpleSheets] Loading models (drawings and parts/assemblies)...')
    const response = await modelsApi.getAll()
    
    if (response.success) {
      const allModels = response.data || []
      
      // Separate drawings from other models
      availableDrawings.value = allModels.filter(model => model.modelType === 'DRAWING')
      availableModels.value = allModels.filter(model => 
        model.modelType === 'PART' || model.modelType === 'ASSEMBLY'
      )
      
      console.log('[SimpleSheets] ✅ Loaded', availableDrawings.value.length, 'drawings')
      console.log('[SimpleSheets] ✅ Loaded', availableModels.value.length, 'models (PART/ASSEMBLY)')
    } else {
      console.error('[SimpleSheets] ❌ Failed to load models:', response.error)
    }
  } catch (err) {
    console.error('[SimpleSheets] ❌ Exception loading models:', err)
  }
}

const loadSheets = async (): Promise<void> => {
  if (loading.value) return // Prevent multiple calls
  
  console.log('[SimpleSheets] Loading sheets...')
  loading.value = true
  error.value = null
  
  try {
    const response = await sheetsApi.getAll()
    
    if (response.success) {
      sheets.value = response.data || []
      console.log('[SimpleSheets] ✅ Loaded', sheets.value.length, 'sheets')
    } else {
      error.value = response.error || 'Failed to load sheets'
      console.error('[SimpleSheets] ❌ Error:', error.value)
    }
  } catch (err) {
    error.value = 'Connection error'
    console.error('[SimpleSheets] ❌ Exception:', err)
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleRefresh = async () => {
  console.log('[SimpleSheets] Manual refresh requested')
  await loadDrawings()
  await loadSheets()
}

const viewSheet = (sheet: SheetWithRelations) => {
  console.log('[SimpleSheets] View sheet:', sheet)
  viewingSheet.value = sheet
  showViewModal.value = true
}

const editSheet = async (sheet: SheetWithRelations) => {
  console.log('[SimpleSheets] Edit sheet:', sheet)
  console.log('[SimpleSheets] Sheet drawing:', sheet.drawing)
  console.log('[SimpleSheets] Sheet models:', sheet.models)
  
  // Ensure drawings are loaded before proceeding
  if (availableDrawings.value.length === 0) {
    console.log('[SimpleSheets] ⚠️ No drawings loaded, loading now...')
    await loadDrawings()
    console.log('[SimpleSheets] ✅ Drawings loaded:', availableDrawings.value.length)
  }
  
  editingSheet.value = sheet
  
  // Fix ID extraction - ensure consistent number comparison
  const drawingId = sheet.drawing?.id ? sheet.drawing.id.toString() : ''
  console.log('[SimpleSheets] Extracted drawing ID:', drawingId)
  console.log('[SimpleSheets] Available drawing IDs:', availableDrawings.value.map(d => ({ id: d.id, name: d.name })))
  
  // Ensure model IDs are properly extracted
  const modelIds = sheet.models?.map(model => model.id?.toString()).filter(id => id) as string[] || []
  console.log('[SimpleSheets] Extracted model IDs:', modelIds)
  
  formData.value = {
    code: sheet.code || '',
    name: sheet.name || '',
    formatType: sheet.formatType || '',
    creoId: sheet.creoId || '',
    drawingId: drawingId,
    modelIds: modelIds
  }
  
  console.log('[SimpleSheets] Edit form data populated:', formData.value)
  showCreateModal.value = true
}

const deleteSheet = async (sheet: SheetWithRelations) => {
  const confirmMsg = t('sheets:confirmDelete', { name: sheet.name || sheet.code || 'Unknown' })
  if (!confirm(confirmMsg)) return
  
  console.log('[SimpleSheets] Delete sheet:', sheet)
  console.log('[SimpleSheets] Sheet ID:', sheet.id)
  
  if (!sheet.id) {
    alert('Cannot delete sheet: ID is missing')
    return
  }
  
  try {
    console.log('[SimpleSheets] Calling delete API for ID:', sheet.id)
    const response = await sheetsApi.delete(sheet.id)
    console.log('[SimpleSheets] Delete API response:', response)
    
    if (response.success) {
      sheets.value = sheets.value.filter(s => s.id !== sheet.id)
      console.log('[SimpleSheets] ✅ Sheet deleted successfully')
    } else {
      const errorMsg = response.error || 'Unknown error'
      console.error('[SimpleSheets] ❌ Delete failed:', errorMsg)
      alert('Failed to delete sheet: ' + errorMsg)
    }
  } catch (err: any) {
    console.error('[SimpleSheets] ❌ Delete exception:', err)
    let errorMessage = 'Network or server error'
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    
    alert('Error deleting sheet: ' + errorMessage)
  }
}

const saveSheet = async () => {
  if (!formData.value.code || !formData.value.name || !formData.value.formatType) {
    alert('Please fill required fields')
    return
  }
  
  console.log('[SimpleSheets] Save sheet - Form data:', formData.value)
  console.log('[SimpleSheets] Editing sheet:', editingSheet.value)
  
  // Ensure data is loaded before proceeding
  if (availableDrawings.value.length === 0) {
    console.log('[SimpleSheets] ⚠️ No drawings loaded, loading now...')
    await loadDrawings()
    console.log('[SimpleSheets] ✅ Drawings loaded for save:', availableDrawings.value.length)
  }
  
  if (availableModels.value.length === 0) {
    console.log('[SimpleSheets] ⚠️ No models loaded, loading now...')
    await loadDrawings() // This loads both drawings and models
    console.log('[SimpleSheets] ✅ Models loaded for save:', availableModels.value.length)
  }
  
  saving.value = true
  
  try {
    // Build the base sheet payload according to backend expectations
    const sheetData: any = {
      creoId: formData.value.creoId || null,
      code: formData.value.code,
      name: formData.value.name,
      formatType: formData.value.formatType,
      // Initialize relationship fields as null
      format: null,
      drawing: null,
      models: null
    }
    
    // For updates, include the ID
    if (editingSheet.value && editingSheet.value.id) {
      sheetData.id = editingSheet.value.id
    }
    
    console.log('[SimpleSheets] Base sheet data:', sheetData)
    
    // Add drawing association - complete object approach as user specified
    console.log('[SimpleSheets] 🎯 Processing drawing ID:', formData.value.drawingId)
    console.log('[SimpleSheets] 🎯 Available drawings count:', availableDrawings.value.length)
    console.log('[SimpleSheets] 🎯 Available drawings list:', availableDrawings.value.map(d => ({ id: d.id, name: d.name, modelType: d.modelType })))
    
    if (formData.value.drawingId && formData.value.drawingId !== '') {
      // Convert both IDs to numbers for consistent comparison
      const selectedDrawingId = parseInt(formData.value.drawingId)
      console.log('[SimpleSheets] 🔍 Looking for drawing with ID (as number):', selectedDrawingId)
      
      const selectedDrawing = availableDrawings.value.find(
        drawing => drawing.id === selectedDrawingId
      )
      console.log('[SimpleSheets] 🔍 Found drawing for ID', selectedDrawingId, ':', selectedDrawing)
      
      if (selectedDrawing) {
        // Validate the drawing object has required fields
        if (!selectedDrawing.id || !selectedDrawing.modelType || selectedDrawing.modelType !== 'DRAWING') {
          console.error('[SimpleSheets] ❌ Invalid drawing object:', selectedDrawing)
          alert('Selected drawing is invalid. Please refresh and try again.')
          sheetData.drawing = null
        } else {
          // Use complete drawing object as user specified - "il file Json da passare deve essere completo"
          console.log('[SimpleSheets] ✅ Selected drawing object (COMPLETE):', selectedDrawing)
          
          const completeDrawing = createCleanModelForUpdate(selectedDrawing)
          sheetData.drawing = completeDrawing
          debugLogObject(completeDrawing, 'Complete drawing for association')
          console.log('[SimpleSheets] ✅ Setting COMPLETE drawing association with ID:', completeDrawing.id)
          console.log('[SimpleSheets] ✅ Drawing payload:', JSON.stringify(completeDrawing, null, 2))
        }
      } else {
        console.error('[SimpleSheets] ❌ Drawing NOT FOUND for ID:', selectedDrawingId)
        console.error('[SimpleSheets] ❌ Available drawing IDs:', availableDrawings.value.map(d => d.id))
        alert(`Drawing with ID ${selectedDrawingId} not found. Please refresh and try again.`)
        sheetData.drawing = null
      }
    } else {
      console.log('[SimpleSheets] ℹ️ No drawing selected, explicitly setting to null')
      sheetData.drawing = null
    }
    
    // Add models association - complete objects as user specified  
    console.log('[SimpleSheets] Processing models IDs:', formData.value.modelIds)
    if (formData.value.modelIds && formData.value.modelIds.length > 0) {
      const selectedModels = availableModels.value.filter(model => 
        formData.value.modelIds.includes(model.id?.toString() || '')
      )
      console.log('[SimpleSheets] Found models for association:', selectedModels.length)
      
      if (selectedModels.length > 0) {
        // Send complete model objects - "ricerca e inserimento di tutto l'oggetto da associare"
        console.log('[SimpleSheets] Selected models objects (COMPLETE):', selectedModels)
        
        // Validate and create complete model objects
        const validModels = selectedModels.filter(model => {
          const isValid = validateObjectForUpdate(model, 'Selected Model')
          if (!isValid) {
            console.error('[SimpleSheets] Invalid model in selection:', model)
          }
          return isValid
        })
        
        if (validModels.length !== selectedModels.length) {
          console.warn(`[SimpleSheets] Filtered out ${selectedModels.length - validModels.length} invalid models`)
        }
        
        const completeModels = validModels.map(model => {
          const cleanModel = createCleanModelForUpdate(model)
          debugLogObject(cleanModel, `Model ${model.id} for association`)
          return cleanModel
        })
        
        sheetData.models = completeModels
        console.log('[SimpleSheets] ✅ Setting COMPLETE models association with IDs:', completeModels.map(m => `${m.id}(${m.code})`))
      } else {
        console.log('[SimpleSheets] ❌ No models found for selected IDs')
        sheetData.models = []
      }
    } else {
      console.log('[SimpleSheets] No models selected')
      sheetData.models = []
    }
    
    console.log('[SimpleSheets] Final payload to send:', sheetData)
    
    let response
    if (editingSheet.value && editingSheet.value.id) {
      console.log('[SimpleSheets] Updating sheet with ID:', editingSheet.value.id)
      // For updates, KEEP the ID in the payload (backend expects it)
      sheetData.id = editingSheet.value.id
      console.log('[SimpleSheets] Update payload (with ID):', sheetData)
      response = await sheetsApi.update(editingSheet.value.id, sheetData)
    } else {
      console.log('[SimpleSheets] Creating new sheet')
      // For creation, remove ID field if present
      const createPayload = { ...sheetData }
      delete createPayload.id
      console.log('[SimpleSheets] Create payload (without ID):', createPayload)
      response = await sheetsApi.create(createPayload)
    }
    
    console.log('[SimpleSheets] API Response:', response)
    
    if (response.success) {
      console.log('[SimpleSheets] ✅ Sheet saved successfully')
      console.log('[SimpleSheets] Saved sheet data:', response.data)
      
      // Specifically check if drawing association was saved
      if (formData.value.drawingId && formData.value.drawingId !== '') {
        if (response.data?.drawing) {
          console.log('[SimpleSheets] ✅ Drawing association saved correctly:', response.data.drawing)
        } else {
          console.warn('[SimpleSheets] ⚠️ Drawing association NOT saved in response!')
          console.warn('[SimpleSheets] ⚠️ Expected drawing ID:', formData.value.drawingId)
          console.warn('[SimpleSheets] ⚠️ Response data:', response.data)
        }
      }
      
      // Check if models associations were saved
      if (formData.value.modelIds && formData.value.modelIds.length > 0) {
        if (response.data?.models && response.data.models.length > 0) {
          console.log('[SimpleSheets] ✅ Models associations saved correctly:', response.data.models.length, 'models')
        } else {
          console.warn('[SimpleSheets] ⚠️ Models associations NOT saved in response!')
          console.warn('[SimpleSheets] ⚠️ Expected model IDs:', formData.value.modelIds)
        }
      }
      
      closeModal()
      await loadSheets() // Reload to get updated data
    } else {
      const errorMsg = response.error || 'Unknown error'
      console.error('[SimpleSheets] ❌ Failed to save sheet:', errorMsg)
      console.error('[SimpleSheets] Full response:', response)
      
      // Handle specific error cases
      if (errorMsg.includes('idnull') || errorMsg === 'error.idnull') {
        alert('Validation error: Required ID is missing. Please check the form data.')
      } else if (errorMsg.includes('validation')) {
        alert('Validation error: ' + errorMsg)
      } else {
        alert('Failed to save sheet: ' + errorMsg)
      }
    }
  } catch (err: any) {
    console.error('[SimpleSheets] ❌ Exception saving sheet:', err)
    let errorMessage = 'Network or server error'
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    
    alert('Error saving sheet: ' + errorMessage)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSheet.value = null
  formData.value = {
    code: '',
    name: '',
    formatType: '',
    creoId: '',
    drawingId: '',
    modelIds: []
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingSheet.value = null
}

const editFromView = () => {
  if (viewingSheet.value) {
    // Copy data to edit modal
    editSheet(viewingSheet.value)
    closeViewModal()
  }
}

// Helper function for model badge classes (shared between view and form)
const getModelBadgeClass = (modelType: string | undefined): string => {
  switch (modelType) {
    case 'PART':
      return 'bg-primary'
    case 'ASSEMBLY':
      return 'bg-warning text-dark'
    case 'DRAWING':
      return 'bg-success'
    default:
      return 'bg-secondary'
  }
}

// Model selection functions
const toggleModelSelection = (event: Event) => {
  const target = event.target as HTMLInputElement
  const modelId = target.value
  
  console.log('[SimpleSheets] Toggle model selection:', modelId, 'checked:', target.checked)
  
  if (target.checked) {
    if (!formData.value.modelIds.includes(modelId)) {
      formData.value.modelIds.push(modelId)
      console.log('[SimpleSheets] Added model ID:', modelId)
    }
  } else {
    formData.value.modelIds = formData.value.modelIds.filter(id => id !== modelId)
    console.log('[SimpleSheets] Removed model ID:', modelId)
  }
  
  console.log('[SimpleSheets] Current model IDs:', formData.value.modelIds)
}

const removeModelFromSelection = (modelId: string) => {
  formData.value.modelIds = formData.value.modelIds.filter(id => id !== modelId)
  console.log('[SimpleSheets] Removed model from selection:', modelId)
}

const getModelDisplayName = (modelId: string): string => {
  const model = availableModels.value.find(m => m.id?.toString() === modelId)
  return model ? `${model.code} (${model.modelType})` : `ID: ${modelId}`
}

// Debug functions (only if debug mode)
const testBackend = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] Testing backend connection...')
  debugInfo.value = 'Testing backend...'
  
  try {
    const result = await testBackendConnection()
    if (result.success) {
      debugInfo.value = `✅ Backend OK - ${result.sheetsCount} sheets found`
      console.log('[SimpleSheets] Backend test successful:', result)
      await handleRefresh()
    } else {
      debugInfo.value = `❌ Backend Error: ${result.error}`
      console.error('[SimpleSheets] Backend test failed:', result.error)
    }
  } catch (err) {
    debugInfo.value = `❌ Test failed: ${err}`
    console.error('[SimpleSheets] Backend test error:', err)
  }
}

const testConnection = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] Testing direct API connection...')
  debugInfo.value = 'Testing API connection...'
  
  try {
    const config = useRuntimeConfig()
    console.log('[SimpleSheets] API Config:', {
      apiBase: config.public.apiBase,
      apiHost: config.public.apiHost,
      apiPort: config.public.apiPort
    })
    
    // Test simple authenticated API call
    const response = await $fetch(`${config.public.apiBase}/api/account`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken') || localStorage.getItem('authToken') || ''}`
      }
    })
    
    console.log('[SimpleSheets] API test response:', response)
    debugInfo.value = '✅ API connection successful'
    
  } catch (err: any) {
    console.error('[SimpleSheets] API test failed:', err)
    if (err.statusCode === 401) {
      debugInfo.value = '⚠️ API reachable but authentication required'
    } else {
      debugInfo.value = `❌ API test failed: ${err.message}`
    }
  }
}

const testCreatePayload = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] Testing create payload...')
  debugInfo.value = 'Testing create payload...'
  
  try {
    // Test with minimal payload
    const testPayload = {
      code: 'TEST-001',
      name: 'Test Sheet',
      formatType: 'A4V',
      creoId: null,
      format: null,
      drawing: null,
      models: null
    }
    
    console.log('[SimpleSheets] Test payload:', testPayload)
    const response = await sheetsApi.create(testPayload)
    
    if (response.success) {
      debugInfo.value = `✅ Test sheet created: ${response.data?.id}`
      console.log('[SimpleSheets] Test creation successful:', response.data)
      
      // Optionally delete the test sheet after a moment
      if (response.data?.id) {
        setTimeout(async () => {
          try {
            await sheetsApi.delete(response.data.id)
            console.log('[SimpleSheets] Test sheet deleted')
            await loadSheets()
          } catch (err) {
            console.log('[SimpleSheets] Could not delete test sheet:', err)
          }
        }, 2000)
      }
      
      await loadSheets()
    } else {
      debugInfo.value = `❌ Test failed: ${response.error}`
      console.error('[SimpleSheets] Test creation failed:', response.error)
    }
  } catch (err) {
    debugInfo.value = `❌ Test exception: ${err}`
    console.error('[SimpleSheets] Test creation error:', err)
  }
}

const testDeleteEndpoint = async (): Promise<void> => {
  if (!isDebugMode) return
  
  if (sheets.value.length === 0) {
    debugInfo.value = 'No sheets available to test delete'
    return
  }
  
  // Find a sheet to test delete (preferably one without associations)
  const testSheet = sheets.value.find(sheet => 
    !sheet.drawing && (!sheet.models || sheet.models.length === 0)
  ) || sheets.value[0]
  
  console.log('[SimpleSheets] Testing delete with sheet:', testSheet)
  debugInfo.value = `Testing delete of sheet ID: ${testSheet.id}...`
  
  try {
    console.log('[SimpleSheets] Calling delete API for test sheet ID:', testSheet.id)
    const response = await sheetsApi.delete(testSheet.id!)
    console.log('[SimpleSheets] Delete test response:', response)
    
    if (response.success) {
      debugInfo.value = `✅ Delete test successful for sheet ${testSheet.id}`
      await loadSheets() // Reload to reflect changes
    } else {
      debugInfo.value = `❌ Delete test failed: ${response.error}`
      console.error('[SimpleSheets] Delete test failed:', response.error)
    }
  } catch (err) {
    debugInfo.value = `❌ Delete test exception: ${err}`
    console.error('[SimpleSheets] Delete test error:', err)
  }
}

const testDrawingAssociation = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] Testing drawing association...')
  debugInfo.value = 'Testing drawing association...'
  
  try {
    // Load data first
    await loadDrawings()
    
    if (availableDrawings.value.length === 0) {
      debugInfo.value = '❌ No drawings available for testing'
      return
    }
    
    const testDrawing = availableDrawings.value[0]
    console.log('[SimpleSheets] Using test drawing:', testDrawing)
    
    // Test 1: Create sheet with drawing
    debugInfo.value = '1/3 Testing create with drawing...'
    
    const createPayload = {
      code: 'TEST-DRAW-001',
      name: 'Test Drawing Association',
      formatType: 'A4V',
      creoId: 'TEST-DRAW',
      drawing: testDrawing  // Complete object as user specified
    }
    
    console.log('[SimpleSheets] Create payload:', createPayload)
    const createResponse = await sheetsApi.create(createPayload)
    
    if (!createResponse.success) {
      debugInfo.value = `❌ Create with drawing failed: ${createResponse.error}`
      return
    }
    
    const createdSheet = createResponse.data
    console.log('[SimpleSheets] Created sheet with drawing:', createdSheet)
    
    // Test 2: Update to remove drawing
    debugInfo.value = '2/3 Testing update to remove drawing...'
    
    const updatePayload = {
      ...createPayload,
      id: createdSheet?.id,
      name: 'Test Drawing Removed',
      drawing: null  // Remove drawing
    }
    
    console.log('[SimpleSheets] Update payload (remove drawing):', updatePayload)
    const updateResponse = await sheetsApi.update(createdSheet?.id!, updatePayload)
    
    if (!updateResponse.success) {
      debugInfo.value = `❌ Update to remove drawing failed: ${updateResponse.error}`
      return
    }
    
    console.log('[SimpleSheets] Updated sheet (drawing removed):', updateResponse.data)
    
    // Test 3: Update to add drawing back
    debugInfo.value = '3/3 Testing update to add drawing back...'
    
    const addBackPayload = {
      ...updatePayload,
      name: 'Test Drawing Added Back',
      drawing: testDrawing  // Add complete drawing back
    }
    
    console.log('[SimpleSheets] Update payload (add drawing back):', addBackPayload)
    const addBackResponse = await sheetsApi.update(createdSheet?.id!, addBackPayload)
    
    if (!addBackResponse.success) {
      debugInfo.value = `❌ Update to add drawing back failed: ${addBackResponse.error}`
      return
    }
    
    console.log('[SimpleSheets] Updated sheet (drawing added back):', addBackResponse.data)
    
    // Clean up: delete test sheet
    await sheetsApi.delete(createdSheet?.id!)
    console.log('[SimpleSheets] Cleaned up test sheet')
    
    // Reload data
    await loadSheets()
    
    debugInfo.value = '✅ Drawing association test successful!'
    
  } catch (err) {
    debugInfo.value = `❌ Drawing test failed: ${err}`
    console.error('[SimpleSheets] Drawing test error:', err)
  }
}

const forceLogin = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] Forcing login with admin/admin...')
  debugInfo.value = 'Logging in...'
  
  try {
    const success = await login('admin', 'admin', false)
    if (success) {
      debugInfo.value = '✅ Login successful'
      console.log('[SimpleSheets] Force login successful')
      setTimeout(async () => {
        await handleRefresh()
      }, 1000)
    } else {
      debugInfo.value = '❌ Login failed'
      console.error('[SimpleSheets] Force login failed')
    }
  } catch (err) {
    debugInfo.value = `❌ Login error: ${err}`
    console.error('[SimpleSheets] Force login error:', err)
  }
}

const debugCurrentData = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] 🐛 === DEBUG CURRENT DATA ===')
  
  // Force reload all data
  console.log('[SimpleSheets] 🔄 Reloading all data...')
  await loadDrawings()
  await loadSheets()
  
  console.log('[SimpleSheets] 📊 CURRENT DATA STATUS:')
  console.log('🎯 Available Drawings:', availableDrawings.value.length)
  console.log('🎯 Available Models:', availableModels.value.length)
  console.log('🎯 Current Sheets:', sheets.value.length)
  
  // Log detailed drawing info
  console.log('[SimpleSheets] 🎨 DRAWINGS DETAIL:')
  availableDrawings.value.forEach((drawing, index) => {
    console.log(`   ${index + 1}. ID: ${drawing.id}, Code: ${drawing.code}, Name: ${drawing.name}, Type: ${drawing.modelType}`)
  })
  
  // Log detailed model info  
  console.log('[SimpleSheets] 🔧 MODELS DETAIL:')
  availableModels.value.slice(0, 5).forEach((model, index) => {
    console.log(`   ${index + 1}. ID: ${model.id}, Code: ${model.code}, Name: ${model.name}, Type: ${model.modelType}`)
  })
  
  // Log sheet associations
  console.log('[SimpleSheets] 📄 SHEETS WITH ASSOCIATIONS:')
  sheets.value.forEach((sheet, index) => {
    const hasDrawing = sheet.drawing ? `Drawing: ${sheet.drawing.id}(${sheet.drawing.code})` : 'No Drawing'
    const hasModels = sheet.models ? `Models: ${sheet.models.length}` : 'No Models'
    console.log(`   ${index + 1}. Sheet ${sheet.id}: ${sheet.code} - ${hasDrawing}, ${hasModels}`)
  })
  
  // Test form data if in edit mode
  if (editingSheet.value) {
    console.log('[SimpleSheets] 📝 CURRENT FORM DATA:')
    console.log('   FormData:', formData.value)
    console.log('   Editing Sheet:', editingSheet.value)
    
    // Check if current drawing ID exists in available drawings
    if (formData.value.drawingId) {
      const foundDrawing = availableDrawings.value.find(d => d.id?.toString() === formData.value.drawingId)
      console.log(`   Drawing ID ${formData.value.drawingId} found:`, !!foundDrawing)
      if (foundDrawing) {
        console.log('   Found drawing:', foundDrawing)
      } else {
        console.error('   ❌ Drawing NOT found in available drawings!')
      }
    }
  }
  
  debugInfo.value = `✅ Debug complete - ${availableDrawings.value.length} drawings, ${availableModels.value.length} models, ${sheets.value.length} sheets`
}

const runCompleteTest = async (): Promise<void> => {
  if (!isDebugMode) return
  
  console.log('[SimpleSheets] Starting complete test suite...')
  debugInfo.value = 'Running complete test...'
  
  try {
    // 1. Test backend connection
    debugInfo.value = '1/5 Testing backend connection...'
    const backendTest = await testBackendConnection()
    if (!backendTest.success) {
      debugInfo.value = `❌ Backend test failed: ${backendTest.error}`
      return
    }
    
    // 2. Load data
    debugInfo.value = '2/5 Loading data...'
    await loadDrawings()
    await loadSheets()
    
    console.log('[SimpleSheets] Test data loaded:')
    console.log('- Drawings:', availableDrawings.value.length)
    console.log('- Models:', availableModels.value.length)
    console.log('- Sheets:', sheets.value.length)
    
    // 3. Test create with associations if data available
    if (availableDrawings.value.length > 0 && availableModels.value.length > 0) {
      debugInfo.value = '3/5 Testing create with associations...'
      
      const testPayload = {
        code: 'TEST-FULL-001',
        name: 'Test Sheet with Associations',
        formatType: 'A4V',
        creoId: 'TEST-CREO-001',
        drawing: availableDrawings.value[0],
        models: [availableModels.value[0]]
      }
      
      console.log('[SimpleSheets] Creating test sheet with payload:', testPayload)
      const createResponse = await sheetsApi.create(testPayload)
      
      if (!createResponse.success) {
        debugInfo.value = `❌ Create test failed: ${createResponse.error}`
        return
      }
      
      const createdSheet = createResponse.data
      console.log('[SimpleSheets] Created test sheet:', createdSheet)
      
      // 4. Test update
      debugInfo.value = '4/5 Testing update...'
      
      const updatePayload = {
        ...testPayload,
        id: createdSheet?.id,
        name: 'Updated Test Sheet',
        drawing: availableDrawings.value[0], // Keep same drawing
        models: availableModels.value.slice(0, Math.min(2, availableModels.value.length)) // Add more models if available
      }
      
      console.log('[SimpleSheets] Updating sheet with payload:', updatePayload)
      const updateResponse = await sheetsApi.update(createdSheet?.id!, updatePayload)
      
      if (!updateResponse.success) {
        debugInfo.value = `❌ Update test failed: ${updateResponse.error}`
        return
      }
      
      console.log('[SimpleSheets] Updated sheet:', updateResponse.data)
      
      // 5. Test delete
      debugInfo.value = '5/5 Testing delete...'
      
      const deleteResponse = await sheetsApi.delete(createdSheet?.id!)
      if (!deleteResponse.success) {
        debugInfo.value = `❌ Delete test failed: ${deleteResponse.error}`
        return
      }
      
      console.log('[SimpleSheets] Deleted test sheet successfully')
      
      // Reload data to reflect changes
      await loadSheets()
      
      debugInfo.value = '✅ Complete test successful! Create/Update/Delete all working'
    } else {
      debugInfo.value = '⚠️ Skipped associations test - no drawings or models available'
    }
    
  } catch (err) {
    debugInfo.value = `❌ Complete test failed: ${err}`
    console.error('[SimpleSheets] Complete test error:', err)
  }
}

// Initialize on mount
onMounted(async () => {
  console.log('[SimpleSheets] Component mounted')
  
  if (isAuthenticated.value) {
    await loadDrawings()
    await loadSheets()
  } else {
    console.log('[SimpleSheets] Not authenticated')
    error.value = 'Authentication required'
  }
})
</script>

<style scoped>
.modal.show {
  display: block !important;
}
</style>