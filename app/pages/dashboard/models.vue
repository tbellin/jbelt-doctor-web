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
            {{ t('title') }}
          </h1>
          <button 
            class="btn btn-primary"
            @click="showCreateModal = true"
            :disabled="loading"
          >
            <i class="bi bi-plus-lg me-2"></i>
            {{ t('actions.create') }}
          </button>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('stats.total') }}</h6>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('stats.parts') }}</h6>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('stats.assemblies') }}</h6>
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
                <h6 class="card-subtitle mb-2 text-muted">{{ t('stats.drawings') }}</h6>
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
            <label for="searchCode" class="form-label">{{ t('search.code') }}</label>
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
            <label for="filterType" class="form-label">{{ t('filter.type') }}</label>
            <select id="filterType" v-model="selectedType" class="form-select" @change="applyFilters">
              <option value="">{{ t('common.all') }}</option>
              <option value="PART">{{ t('types.part') }}</option>
              <option value="ASSEMBLY">{{ t('types.assembly') }}</option>
              <option value="DRAWING">{{ t('types.drawing') }}</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label for="filterInstance" class="form-label">{{ t('filter.instance') }}</label>
            <select id="filterInstance" v-model="selectedInstance" class="form-select" @change="applyFilters">
              <option value="">{{ t('common.all') }}</option>
              <option value="NORMAL">{{ t('instances.normal') }}</option>
              <option value="GENERIC">{{ t('instances.generic') }}</option>
              <option value="PARAMETRIC">{{ t('instances.parametric') }}</option>
            </select>
          </div>
          
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="clearFilters" :disabled="loading">
              <i class="bi bi-x-circle me-2"></i>
              {{ t('common.clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabella modelli -->
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          {{ t('list.title') }}
          <span v-if="filteredModels.length" class="badge bg-secondary ms-2">
            {{ filteredModels.length }}
          </span>
        </h5>
      </div>
      
      <div class="card-body">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t('common.loading') }}</span>
          </div>
          <p class="mt-2 text-muted">{{ t('loading') }}</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="loadModels">
            {{ t('common.retry') }}
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!filteredModels.length" class="text-center py-5">
          <i class="bi bi-box-seam display-1 text-muted"></i>
          <h4 class="mt-3">{{ t('empty.title') }}</h4>
          <p class="text-muted">{{ t('empty.message') }}</p>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="bi bi-plus-lg me-2"></i>
            {{ t('actions.createFirst') }}
          </button>
        </div>

        <!-- Tabella con dati -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ t('table.id') }}</th>
                <th>{{ t('table.code') }}</th>
                <th>{{ t('table.name') }}</th>
                <th>{{ t('table.type') }}</th>
                <th>{{ t('table.instance') }}</th>
                <th>{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="model in paginatedModels" :key="model.id">
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
                      :title="t('common.view')"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-outline-warning"
                      @click="editModel(model)"
                      :title="t('common.edit')"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger"
                      @click="confirmDelete(model)"
                      :title="t('common.delete')"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
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
                  <label for="modelCode" class="form-label">{{ t('form.code') }} *</label>
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
                  <label for="modelName" class="form-label">{{ t('form.name') }} *</label>
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
                  <label for="modelType" class="form-label">{{ t('form.type') }} *</label>
                  <select
                    id="modelType"
                    v-model="formData.modelType"
                    class="form-select"
                    :class="{ 'is-invalid': formErrors.modelType }"
                    required
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option value="PART">{{ t('types.part') }}</option>
                    <option value="ASSEMBLY">{{ t('types.assembly') }}</option>
                    <option value="DRAWING">{{ t('types.drawing') }}</option>
                  </select>
                  <div v-if="formErrors.modelType" class="invalid-feedback">
                    {{ formErrors.modelType }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label for="instanceType" class="form-label">{{ t('form.instance') }} *</label>
                  <select
                    id="instanceType"
                    v-model="formData.instanceType"
                    class="form-select"
                    :class="{ 'is-invalid': formErrors.instanceType }"
                    required
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option value="NORMAL">{{ t('instances.normal') }}</option>
                    <option value="GENERIC">{{ t('instances.generic') }}</option>
                    <option value="PARAMETRIC">{{ t('instances.parametric') }}</option>
                  </select>
                  <div v-if="formErrors.instanceType" class="invalid-feedback">
                    {{ formErrors.instanceType }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? t('common.saving') : (editingModel ? t('common.update') : t('common.create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Backdrop del modal -->
    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
// Import dei composables e tipi
import { useApi, type Model, type ApiResponse } from '~/composables/useApi'

// CORREZIONE PRINCIPALE: Utilizzo corretto di useI18n
import { useI18n } from '~/composables/useI18n';
import { useAuth } from '~/composables/useAuth';
const { t, currentLanguage } = useI18n('models');

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})


// Dati reattivi
const { models } = useApi()
const allModels = ref<Model[]>([])
const filteredModels = ref<Model[]>([])
const modelCount = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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

// Metodi per il caricamento dati
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
  // Naviga alla pagina di dettaglio del modello
  navigateTo(`/dashboard/models/${model.id}`)
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
    const response = await models.delete(model.id!)
    if (response.success) {
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
  console.log('[Models] Componente montato, controllo autenticazione...')
  
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