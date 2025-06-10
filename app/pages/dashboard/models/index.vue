<!--
  Pagina Dashboard per la gestione dei modelli
  Versione corretta con i18n funzionante
  
  @version 1.1.0
-->
<template>
  <div class="models-dashboard">
    <!-- Header della pagina con statistiche -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">
            <i class="bi bi-box-seam me-2"></i>
            {{ t('models:title') }}
          </h1>
          <div class="btn-group" role="group">
            <button 
              class="btn btn-outline-secondary"
              @click="refreshData"
              :disabled="loading"
              :title="t('actions.refresh')"
            >
              <i class="bi bi-arrow-clockwise me-2" :class="{ 'spin-animation': loading }"></i>
              {{ t('models:actions.refresh') }}
            </button>
            <button 
              class="btn btn-primary"
              @click="showCreateModal = true"
              :disabled="loading"
            >
              <i class="bi bi-plus-lg me-2"></i>
              {{ t('models:actions.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards statistiche -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.total') }}</h6>
                <h3 class="card-title mb-0">
                  {{ modelCount !== null ? modelCount : '-' }}
                </h3>
              </div>
              <div class="text-primary">
                <i class="bi bi-box-seam fs-1"></i>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.parts') }}</h6>
                <h3 class="card-title mb-0">
                  {{ getModelTypeCount('PART') }}
                </h3>
              </div>
              <div class="text-success">
                <i class="bi bi-gear fs-1"></i>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.assemblies') }}</h6>
                <h3 class="card-title mb-0">
                  {{ getModelTypeCount('ASSEMBLY') }}
                </h3>
              </div>
              <div class="text-info">
                <i class="bi bi-diagram-3 fs-1"></i>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('models:stats.drawings') }}</h6>
                <h3 class="card-title mb-0">
                  {{ getModelTypeCount('DRAWING') }}
                </h3>
              </div>
              <div class="text-warning">
                <i class="bi bi-file-earmark-text fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri e ricerca -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <label for="searchCode" class="form-label">{{ t('models:search.code') }}</label>
            <div class="input-group">
              <input
                id="searchCode"
                v-model="searchCode"
                type="text"
                class="form-control"
                :placeholder="t('search.codePlaceholder')"
                @keyup.enter="performSearch"
              >
              <button class="btn btn-outline-secondary" @click="performSearch" :disabled="loading">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          
          <div class="col-md-3">
            <label for="filterType" class="form-label">{{ t('models:filter.type') }}</label>
            <select id="filterType" v-model="selectedType" class="form-select" @change="applyFilters">
              <option value="">{{ t('models:common:all') }}</option>
              <option value="PART">{{ t('models:types.part') }}</option>
              <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
              <option value="DRAWING">{{ t('models:types.drawing') }}</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label for="filterInstance" class="form-label">{{ t('models:filter.instance') }}</label>
            <select id="filterInstance" v-model="selectedInstance" class="form-select" @change="applyFilters">
              <option value="">{{ t('models:common:all') }}</option>
              <option value="NORMAL">{{ t('models:instances.normal') }}</option>
              <option value="GENERIC">{{ t('models:instances.generic') }}</option>
              <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
            </select>
          </div>
          
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="clearFilters" :disabled="loading">
              <i class="bi bi-x-circle me-2"></i>
              {{ t('models:common:clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabella modelli -->
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          {{ t('models:list.title') }}
          <span v-if="filteredModels.length" class="badge bg-secondary ms-2">
            {{ filteredModels.length }}
          </span>
        </h5>
      </div>
      
      <div class="card-body">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t('models:common:loading') }}</span>
          </div>
          <p class="mt-2 text-muted">{{ t('models:loading') }}</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="loadModels">
            {{ t('models:common:retry') }}
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!filteredModels.length" class="text-center py-5">
          <i class="bi bi-box-seam display-1 text-muted"></i>
          <h4 class="mt-3">{{ t('models:empty.title') }}</h4>
          <p class="text-muted">{{ t('models:empty.message') }}</p>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="bi bi-plus-lg me-2"></i>
            {{ t('models:actions.createFirst') }}
          </button>
        </div>

        <!-- Tabella con dati -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width: 50px;"></th>
                <th>{{ t('models:table.id') }}</th>
                <th>{{ t('models:table.code') }}</th>
                <th>{{ t('models:table.name') }}</th>
                <th>{{ t('models:table.type') }}</th>
                <th>{{ t('models:table.instance') }}</th>
                <th>{{ t('models:common:actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="model in paginatedModels" :key="model.id">
                <!-- Riga principale del modello -->
                <tr>
                  <td>
                    <button 
                      class="btn btn-sm btn-link p-0"
                      @click="toggleRowExpansion(model)"
                      :title="isRowExpanded(model.id || 0) ? t('table.collapse') : t('table.expand')"
                    >
                      <i 
                        class="bi" 
                        :class="isRowExpanded(model.id || 0) ? 'bi-chevron-down' : 'bi-chevron-right'"
                      ></i>
                    </button>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ model.id }}</span>
                  </td>
                  <td>
                    <strong>{{ model.code }}</strong>
                  </td>
                  <td>{{ model.name }}</td>
                  <td>
                    <span class="badge" :class="getTypeClass(model.modelType)">
                      <i :class="getTypeIcon(model.modelType)" class="me-1"></i>
                      {{ t(`types.${model.modelType.toLowerCase()}`) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary">
                      {{ t(`instances.${model.instanceType.toLowerCase()}`) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-primary"
                        @click="viewModel(model)"
                        :title="t('common:view')"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-outline-warning"
                        @click="editModel(model)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(model)"
                        :title="t('common:delete')"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                
                <!-- Riga espandibile per i sheet associati -->
                <tr v-if="isRowExpanded(model.id || 0)" class="expanded-row">
                  <td></td>
                  <td colspan="6" class="p-0">
                    <div class="sheets-container">
                      <div class="sheets-header">
                        <h6 class="mb-2">
                          <i class="bi bi-file-earmark-text me-2"></i>
                          {{ t('models:table.associatedSheets') }}
                          <span class="badge bg-secondary ms-2">
                            {{ getSheetsForModel(model.id || 0).length }}
                          </span>
                        </h6>
                      </div>
                      
                      <div v-if="getSheetsForModel(model.id || 0).length === 0" class="text-muted p-3">
                        {{ t('models:table.noSheets') }}
                      </div>
                      
                      <div v-else class="table-responsive">
                        <table class="table table-sm mb-0">
                          <thead class="table-light">
                            <tr>
                              <th>{{ t('models:sheets.table.id') }}</th>
                              <th>{{ t('models:sheets.table.code') }}</th>
                              <th>{{ t('models:sheets.table.name') }}</th>
                              <th>{{ t('models:sheets.table.format') }}</th>
                              <th>{{ t('models:sheets.table.relation') }}</th>
                              <th>{{ t('models:sheets.table.creoId') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="sheet in getSheetsForModel(model.id || 0)" :key="sheet.id">
                              <td>
                                <span class="badge bg-light text-dark">{{ sheet.id }}</span>
                              </td>
                              <td>
                                <code class="text-primary">{{ sheet.code }}</code>
                              </td>
                              <td>{{ sheet.name }}</td>
                              <td>
                                <span class="badge bg-info">{{ sheet.formatType }}</span>
                              </td>
                              <td>
                                <span v-if="model.modelType === 'DRAWING'" class="badge bg-success">
                                  <i class="bi bi-file-earmark-text me-1"></i>
                                  {{ t('models:sheets.relation.hasDrawing') }}
                                </span>
                                <span v-else class="badge bg-warning">
                                  <i class="bi bi-link me-1"></i>
                                  {{ t('models:sheets.relation.references') }}
                                </span>
                              </td>
                              <td>
                                <code v-if="sheet.creoId" class="text-muted">{{ sheet.creoId }}</code>
                                <span v-else class="text-muted">-</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Paginazione -->
        <nav v-if="totalPages > 1" aria-label="Paginazione modelli">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            
            <li 
              v-for="page in visiblePages" 
              :key="page" 
              class="page-item" 
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Modal per creazione/modifica modello -->
    <div 
      class="modal fade" 
      :class="{ show: showCreateModal }" 
      :style="{ display: showCreateModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingModel ? t('modal.edit') : t('modal.create') }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          
          <form @submit.prevent="saveModel">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <label for="modelCode" class="form-label">{{ t('models:form.code') }} *</label>
                  <input
                    id="modelCode"
                    v-model="formData.code"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.code }"
                    required
                  >
                  <div v-if="formErrors.code" class="invalid-feedback">
                    {{ formErrors.code }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label for="modelName" class="form-label">{{ t('models:form.name') }} *</label>
                  <input
                    id="modelName"
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.name }"
                    required
                  >
                  <div v-if="formErrors.name" class="invalid-feedback">
                    {{ formErrors.name }}
                  </div>
                </div>
              </div>
              
              <div class="row mt-3">
                <div class="col-md-6">
                  <label for="modelType" class="form-label">{{ t('models:form.type') }} *</label>
                  <select
                    id="modelType"
                    v-model="formData.modelType"
                    class="form-select"
                    :class="{ 'is-invalid': formErrors.modelType }"
                    required
                  >
                    <option value="">{{ t('models:common:select') }}</option>
                    <option value="PART">{{ t('models:types.part') }}</option>
                    <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
                    <option value="DRAWING">{{ t('models:types.drawing') }}</option>
                  </select>
                  <div v-if="formErrors.modelType" class="invalid-feedback">
                    {{ formErrors.modelType }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label for="instanceType" class="form-label">{{ t('models:form.instance') }} *</label>
                  <select
                    id="instanceType"
                    v-model="formData.instanceType"
                    class="form-select"
                    :class="{ 'is-invalid': formErrors.instanceType }"
                    required
                  >
                    <option value="">{{ t('models:common:select') }}</option>
                    <option value="NORMAL">{{ t('models:instances.normal') }}</option>
                    <option value="GENERIC">{{ t('models:instances.generic') }}</option>
                    <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
                  </select>
                  <div v-if="formErrors.instanceType" class="invalid-feedback">
                    {{ formErrors.instanceType }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                {{ t('models:common:cancel') }}
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? t('common:saving') : (editingModel ? t('common:update') : t('common:create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Backdrop del modal -->
    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>

    <!-- Modal per visualizzazione JSON -->
    <div 
      class="modal fade" 
      :class="{ show: showViewModal }" 
      :style="{ display: showViewModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-eye me-2"></i>
              {{ t('models:modal.view') }} - {{ viewingModel?.code }}
            </h5>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>
          
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">{{ t('models:view.jsonData') }}</h6>
                  <div class="btn-group" role="group">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary btn-sm"
                      @click="copyModelJson"
                      :title="t('view.copyToClipboard')"
                    >
                      <i class="bi bi-clipboard me-1"></i>
                      {{ t('models:view.copy') }}
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-outline-primary btn-sm"
                      @click="downloadModelJson"
                      :title="t('view.downloadJson')"
                    >
                      <i class="bi bi-download me-1"></i>
                      {{ t('models:view.download') }}
                    </button>
                  </div>
                </div>
                
                <textarea 
                  id="jsonContent"
                  class="form-control font-monospace"
                  rows="20"
                  readonly
                  :value="viewingModel ? JSON.stringify(viewingModel, null, 2) : ''"
                ></textarea>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <h6>{{ t('models:view.modelInfo') }}</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>ID:</strong></td>
                      <td><span class="badge bg-light text-dark">{{ viewingModel?.id }}</span></td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('models:table.code') }}:</strong></td>
                      <td><code>{{ viewingModel?.code }}</code></td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('models:table.name') }}:</strong></td>
                      <td>{{ viewingModel?.name }}</td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('models:table.type') }}:</strong></td>
                      <td>
                        <span class="badge" :class="getTypeClass(viewingModel?.modelType || '')">
                          <i :class="getTypeIcon(viewingModel?.modelType || '')" class="me-1"></i>
                          {{ viewingModel?.modelType }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>{{ t('models:table.instance') }}:</strong></td>
                      <td>
                        <span class="badge bg-secondary">
                          {{ viewingModel?.instanceType }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>{{ t('models:view.fileInfo') }}</h6>
                <div class="alert alert-info">
                  <p class="mb-2">
                    <strong>{{ t('models:view.fileName') }}:</strong><br>
                    <code>model-{{ viewingModel?.code }}-{{ viewingModel?.id }}.json</code>
                  </p>
                  <p class="mb-0">
                    <strong>{{ t('models:view.fileSize') }}:</strong>
                    {{ viewingModel ? JSON.stringify(viewingModel).length : 0 }} bytes
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">
              {{ t('models:common:cancel') }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="copyModelJson">
              <i class="bi bi-clipboard me-2"></i>
              {{ t('models:view.copy') }}
            </button>
            <button type="button" class="btn btn-primary" @click="downloadModelJson">
              <i class="bi bi-download me-2"></i>
              {{ t('models:view.download') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop del modal view -->
    <div v-if="showViewModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
// Import dei composables e tipi
import { useApi, type Model, type ApiResponse } from '~/composables/useApi'

// CORREZIONE PRINCIPALE: Utilizzo corretto di useI18n
import { useI18n } from '~/composables/useI18n';
import { useAuth } from '~/composables/useAuth';
// const { t, loadNamespace } = useI18n();
const { t, loadNamespace, isLoaded } = useI18n();

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n', 'translation-loader']
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

// Debug configurazione API
const config = useRuntimeConfig()
console.log('[Models] Configurazione API:', {
  apiBase: config.public.apiBase,
  apiHost: config.public.apiHost,
  apiPort: config.public.apiPort
})

// Filtri e ricerca
const searchCode = ref('')
const selectedType = ref('')
const selectedInstance = ref('')

// Paginazione
const currentPage = ref(1)
const itemsPerPage = 20

// Modal e form
const showCreateModal = ref(false)
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

// Metodi per le statistiche
const getModelTypeCount = (type: string): number => {
  return allModels.value.filter((model: Model) => model.modelType === type).length
}

const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    'PART': 'bg-success',
    'ASSEMBLY': 'bg-info',
    'DRAWING': 'bg-warning'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'PART': 'bi-gear',
    'ASSEMBLY': 'bi-diagram-3',
    'DRAWING': 'bi-file-earmark-text'
  }
  return icons[type] || 'bi-box-seam'
}

// Metodi per gestire i collapse e sheet
const toggleRowExpansion = async (model: Model): Promise<void> => {
  if (!model.id) return
  
  const modelId = model.id
  
  if (expandedRows.value.has(modelId)) {
    // Chiudi la riga
    expandedRows.value.delete(modelId)
    console.log('[Models] Row collapsed for model:', model.code)
  } else {
    // Apri la riga e carica i sheet se non già caricati
    expandedRows.value.add(modelId)
    console.log('[Models] Row expanded for model:', model.code)
    
    if (!modelSheets.value[modelId]) {
      await loadSheetsForModel(model)
    }
  }
}

const loadSheetsForModel = async (model: Model): Promise<void> => {
  if (!model.id) return
  
  const modelId = model.id
  console.log('[Models] Loading sheets for model:', model.code, 'type:', model.modelType)
  
  try {
    let response: any
    
    if (model.modelType === 'DRAWING') {
      // Per modelli DRAWING: usa l'endpoint specifico per cercare sheet che hanno questo drawing
      console.log('[Models] Calling API: GET /api/sheets?drawingId.equals=' + model.id)
      response = await sheets.getByDrawing(model.id)
      
      if (response.success) {
        modelSheets.value[modelId] = response.data || []
        console.log('[Models] Found', response.data?.length || 0, 'sheets with drawing:', model.code)
      } else {
        console.error('[Models] Failed to load sheets by drawing:', response.error)
        modelSheets.value[modelId] = []
      }
    } else if (model.modelType === 'PART' || model.modelType === 'ASSEMBLY') {
      // Per modelli PART/ASSEMBLY: usa l'endpoint specifico per sheet associati
      console.log('[Models] Calling API: GET /api/models/' + model.id + '/sheets')
      response = await sheets.getByModel(model.id)
      
      if (response.success) {
        modelSheets.value[modelId] = response.data || []
        console.log('[Models] Found', response.data?.length || 0, 'sheets referencing part/assembly:', model.code)
      } else {
        console.error('[Models] Failed to load sheets by model:', response.error)
        // Fallback: se l'endpoint specifico non esiste, usa logica generica
        console.log('[Models] Fallback: using generic sheet search')
        const allSheetsResponse = await sheets.getAll()
        if (allSheetsResponse.success) {
          const associatedSheets = allSheetsResponse.data?.filter(sheet => 
            sheet.code.includes(model.code) || 
            sheet.name.toLowerCase().includes(model.code.toLowerCase())
          ) || []
          modelSheets.value[modelId] = associatedSheets
          console.log('[Models] Fallback found', associatedSheets.length, 'sheets for:', model.code)
        } else {
          modelSheets.value[modelId] = []
        }
      }
    } else {
      // Altri tipi di modello non hanno sheet associati
      console.log('[Models] Model type', model.modelType, 'does not have associated sheets')
      modelSheets.value[modelId] = []
    }
  } catch (err) {
    console.error('[Models] Error loading sheets for model:', err)
    modelSheets.value[modelId] = []
  }
}

const isRowExpanded = (modelId: number): boolean => {
  return expandedRows.value.has(modelId)
}

const getSheetsForModel = (modelId: number): any[] => {
  return modelSheets.value[modelId] || []
}

// Metodi per il caricamento dati
const refreshData = async (): Promise<void> => {
  console.log('[Models] Refresh data requested')
  // Reset filtri e ricerca
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
    // Carica tutti i modelli
    console.log('[Models] Chiamata API: GET /api/models')
    const modelsResponse = await models.getAll()
    console.log('[Models] Risposta getAll():', modelsResponse)
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
      console.log('[Models] Modelli caricati:', allModels.value.length)
      applyFilters()
    } else {
      console.error('[Models] Errore getAll():', modelsResponse.error)
      error.value = modelsResponse.error || 'Errore nel caricamento dei modelli'
    }
    
    // Carica il conteggio
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
  
  // Filtro per tipo di modello
  if (selectedType.value) {
    filtered = filtered.filter(model => model.modelType === selectedType.value)
  }
  
  // Filtro per tipo di istanza
  if (selectedInstance.value) {
    filtered = filtered.filter(model => model.instanceType === selectedInstance.value)
  }
  
  filteredModels.value = filtered
  currentPage.value = 1 // Reset alla prima pagina
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
  loadModels() // Ricarica tutti i modelli
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
    formErrors.value.code = t('validation.codeRequired')
  }
  
  if (!formData.value.name.trim()) {
    formErrors.value.name = t('validation.nameRequired')
  }
  
  if (!formData.value.modelType) {
    formErrors.value.modelType = t('validation.typeRequired')
  }
  
  if (!formData.value.instanceType) {
    formErrors.value.instanceType = t('validation.instanceRequired')
  }
  
  return Object.keys(formErrors.value).length === 0
}

const saveModel = async (): Promise<void> => {
  console.log('[Models] Save model started')
  console.log('[Models] editingModel.value:', editingModel.value)
  console.log('[Models] formData.value:', formData.value)
  
  if (!validateForm()) {
    console.log('[Models] Validation failed')
    return
  }
  
  saving.value = true
  
  try {
    let response: ApiResponse<Model>
    
    if (editingModel.value) {
      // Aggiornamento - Include l'ID nel body per JHipster
      const updateData = {
        ...formData.value,
        id: editingModel.value.id
      }
      console.log('[Models] Updating model with ID:', editingModel.value.id)
      console.log('[Models] Update data (with ID):', updateData)
      response = await models.update(editingModel.value.id!, updateData)
      console.log('[Models] Update response:', response)
    } else {
      // Creazione
      console.log('[Models] Creating new model:', formData.value)
      response = await models.create(formData.value)
      console.log('[Models] Create response:', response)
    }
    
    if (response.success) {
      closeModal()
      console.log('[Models] Operazione completata, aggiornamento dati...')
      await loadModels() // Ricarica la lista
      
      // Mostra messaggio di successo
      const message = editingModel.value 
        ? t('messages.updateSuccess')
        : t('messages.createSuccess')
      
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
    console.log('[Models] Save model finished')
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
    // Qui potresti aggiungere un toast/notifica di successo
  } catch (err) {
    console.error('[Models] Failed to copy JSON to clipboard:', err)
    // Fallback: seleziona il testo nel textarea
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
  console.log('[Models] Form data popolato:', formData.value)
  console.log('[Models] Editing model:', editingModel.value)
  showCreateModal.value = true
}

const confirmDelete = async (model: Model): Promise<void> => {
  const confirmed = confirm(t('confirmDelete', { name: model.name }))
  if (!confirmed) return
  
  loading.value = true
  try {
    const response = await models.delete(model.id || 0)
    if (response.success) {
      console.log('[Models] Modello eliminato, aggiornamento dati...')
      await loadModels() // Ricarica la lista
      console.log(t('messages.deleteSuccess'))
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
watch([selectedType, selectedInstance], () => {
  applyFilters()
})

// Lifecycle hooks
onMounted(async () => {
  console.log('[Models] Componente montato, caricamento traduzioni...')
  
  // Ensure required namespaces are loaded
  console.log('[Models] Loading namespaces: common, models...')
  await loadNamespace('common')
  await loadNamespace('models')
  
  // Verifica stato di autenticazione
  const { isAuthenticated, user } = useAuth()
  console.log('[Models] Stato autenticazione:', {
    isAuthenticated: isAuthenticated.value,
    user: user.value
  })
  
  await loadModels()
})

// SEO e Meta
useHead({
  title: computed(() => t('title') + ' - Dashboard'),
  meta: [
    { name: 'description', content: 'Gestione completa dei modelli CAD nel sistema JBelt' }
  ]
})
</script>

<style scoped>
.models-dashboard {
  padding: 1rem;
}

.modal.show {
  background: rgba(0, 0, 0, 0.5);
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

.table th {
  background-color: var(--bs-light);
  font-weight: 600;
  border-bottom: 2px solid var(--bs-border-color);
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

.pagination .page-link {
  border-color: var(--bs-border-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Animazione per l'icona di refresh */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}

/* Stili per le righe espandibili */
.expanded-row {
  background-color: var(--bs-light);
}

.sheets-container {
  padding: 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid var(--bs-primary);
  margin: 0.5rem 0;
}

.sheets-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.sheets-container .table {
  background-color: white;
  border-radius: 0.375rem;
  overflow: hidden;
}

.sheets-container .table th {
  background-color: #e9ecef;
  font-weight: 600;
  font-size: 0.875rem;
}

.sheets-container .table td {
  font-size: 0.875rem;
  vertical-align: middle;
}

/* Animazione smooth per l'espansione */
.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .models-dashboard {
    padding: 0.5rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
  }
}
</style>