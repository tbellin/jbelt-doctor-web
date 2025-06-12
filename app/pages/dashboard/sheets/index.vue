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
              Refresh
            </button>
            <button class="btn btn-primary" @click="showCreateModal = true" :disabled="loading">
              <i class="bi bi-plus-lg me-2"></i>
              New Sheet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Stats -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row text-center">
              <div class="col-md-3">
                <h5 class="text-primary">{{ sheets.length }}</h5>
                <p class="mb-0">Total Sheets</p>
              </div>
              <div class="col-md-3">
                <h5 class="text-success">{{ sheetsWithDrawing }}</h5>
                <p class="mb-0">With Drawing</p>
              </div>
              <div class="col-md-3">
                <h5 class="text-warning">{{ sheetsWithoutDrawing }}</h5>
                <p class="mb-0">Without Drawing</p>
              </div>
              <div class="col-md-3">
                <h5 class="text-info">{{ formatCount }}</h5>
                <p class="mb-0">Formats</p>
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
          <h4 class="mt-3">No sheets found</h4>
          <p class="text-muted">Start by creating your first sheet.</p>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="bi bi-plus-lg me-2"></i>
            Create First Sheet
          </button>
        </div>

        <!-- Table with Data -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Format</th>
                <th>Drawing</th>
                <th>Models</th>
                <th>Actions</th>
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
                    {{ sheet.drawing.name }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="sheet.models && sheet.models.length" class="badge bg-primary">
                    {{ sheet.models.length }} models
                  </span>
                  <span v-else class="text-muted">-</span>
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
            <h5>{{ editingSheet ? 'Edit Sheet' : 'Create Sheet' }}</h5>
            <button class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSheet">
              <div class="mb-3">
                <label class="form-label">Code</label>
                <input v-model="formData.code" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model="formData.name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Format Type</label>
                <select v-model="formData.formatType" class="form-select" required>
                  <option value="">Select Format</option>
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
                <label class="form-label">Creo ID</label>
                <input v-model="formData.creoId" class="form-control">
              </div>
              <div class="mb-3">
                <label class="form-label">Drawing (Optional)</label>
                <select v-model="formData.drawingId" class="form-select">
                  <option value="">No Drawing</option>
                  <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                    [DRAWING] {{ drawing.code }} - {{ drawing.name }}{{ drawing.creoId ? ` (${drawing.creoId})` : '' }}
                  </option>
                </select>
                <div class="form-text">
                  Select a DRAWING model to associate with this sheet
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn btn-primary" @click="saveSheet" :disabled="saving">
              {{ saving ? 'Saving...' : (editingSheet ? 'Update' : 'Create') }}
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
              <button class="btn btn-outline-success" @click="forceLogin" :disabled="loading">
                <i class="bi bi-key"></i> Force Login
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
              <strong>Sheets Count:</strong> {{ sheets.length }}<br>
              <strong>Drawings Count:</strong> {{ availableDrawings.length }}<br>
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

// Modal state
const showCreateModal = ref(false)
const editingSheet = ref<SheetWithRelations | null>(null)
const saving = ref(false)

// Debug state
const debugInfo = ref<string>('')
const showDebugPanel = ref(false)

// Form data
const formData = ref({
  code: '',
  name: '',
  formatType: '',
  creoId: '',
  drawingId: ''
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

// Load functions
const loadDrawings = async (): Promise<void> => {
  try {
    console.log('[SimpleSheets] Loading drawings...')
    const response = await modelsApi.getAll()
    
    if (response.success) {
      const allModels = response.data || []
      availableDrawings.value = allModels.filter(model => model.modelType === 'DRAWING')
      console.log('[SimpleSheets] ✅ Loaded', availableDrawings.value.length, 'drawings')
    } else {
      console.error('[SimpleSheets] ❌ Failed to load drawings:', response.error)
    }
  } catch (err) {
    console.error('[SimpleSheets] ❌ Exception loading drawings:', err)
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
  console.log('[SimpleSheets] View sheet:', sheet.id)
  alert(`View Sheet: ${sheet.name}\nID: ${sheet.id}\nCode: ${sheet.code}`)
}

const editSheet = (sheet: SheetWithRelations) => {
  console.log('[SimpleSheets] Edit sheet:', sheet.id)
  editingSheet.value = sheet
  formData.value = {
    code: sheet.code || '',
    name: sheet.name || '',
    formatType: sheet.formatType || '',
    creoId: sheet.creoId || '',
    drawingId: sheet.drawing?.id?.toString() || ''
  }
  showCreateModal.value = true
}

const deleteSheet = async (sheet: SheetWithRelations) => {
  if (!confirm(`Delete sheet "${sheet.name}"?`)) return
  
  console.log('[SimpleSheets] Delete sheet:', sheet.id)
  try {
    const response = await sheetsApi.delete(sheet.id!)
    if (response.success) {
      sheets.value = sheets.value.filter(s => s.id !== sheet.id)
      console.log('[SimpleSheets] ✅ Sheet deleted')
    } else {
      alert('Failed to delete sheet: ' + response.error)
    }
  } catch (err) {
    alert('Error deleting sheet')
    console.error(err)
  }
}

const saveSheet = async () => {
  if (!formData.value.code || !formData.value.name || !formData.value.formatType) {
    alert('Please fill required fields')
    return
  }
  
  console.log('[SimpleSheets] Save sheet:', formData.value)
  saving.value = true
  
  try {
    const sheetData: any = {
      code: formData.value.code,
      name: formData.value.name,
      formatType: formData.value.formatType,
      creoId: formData.value.creoId || null
    }
    
    // Add drawing if selected
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
          instanceType: selectedDrawing.instanceType
        }
      }
    }
    
    let response
    if (editingSheet.value) {
      response = await sheetsApi.update(editingSheet.value.id!, sheetData)
    } else {
      response = await sheetsApi.create(sheetData)
    }
    
    if (response.success) {
      console.log('[SimpleSheets] ✅ Sheet saved')
      closeModal()
      await loadSheets() // Reload to get updated data
    } else {
      alert('Failed to save sheet: ' + response.error)
    }
  } catch (err) {
    alert('Error saving sheet')
    console.error(err)
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
    drawingId: ''
  }
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