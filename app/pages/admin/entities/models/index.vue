<template>
  <div class="admin-models-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('models:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('models:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('models:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>
          {{ t('common:refresh') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">{{ t('models:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('models:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('models:filters.type') }}</label>
            <select v-model="selectedTypeFilter" class="form-select">
              <option value="">{{ t('models:filters.allTypes') }}</option>
              <option value="PART">{{ t('models:types.PART') }}</option>
              <option value="ASSEMBLY">{{ t('models:types.ASSEMBLY') }}</option>
              <option value="DRAWING">{{ t('models:types.DRAWING') }}</option>
              <option value="FORMAT">{{ t('models:types.FORMAT') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('models:filters.instance') }}</label>
            <select v-model="selectedInstanceFilter" class="form-select">
              <option value="">{{ t('models:filters.allInstances') }}</option>
              <option value="GENERIC">{{ t('models:instances.GENERIC') }}</option>
              <option value="INSTANCE">{{ t('models:instances.INSTANCE') }}</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button
              class="btn btn-outline-secondary w-100"
              @click="clearFilters"
            >
              <i class="bi bi-funnel me-2"></i>
              {{ t('common:clearFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Models Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredModels.length === 0" class="text-center py-4">
          <i class="bi bi-box-seam fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('models:table.noData') }}</h5>
          <p class="text-muted">{{ t('models:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('models:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('models:table.code') }}</th>
                  <th>{{ t('models:table.name') }}</th>
                  <th>{{ t('models:table.type') }}</th>
                  <th>{{ t('models:table.instance') }}</th>
                  <th>{{ t('models:table.version') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="model in filteredModels" :key="model.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ model.code || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ model.name || '-' }}</div>
                    <small v-if="model.file" class="text-muted">
                      <i class="bi bi-file-earmark me-1"></i>{{ model.file.fileName }}
                    </small>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="getTypeBadgeClass(model.modelType)"
                    >
                      {{ getTypeLabel(model.modelType) }}
                    </span>
                  </td>
                  <td>
                    <span 
                      v-if="model.instanceType"
                      class="badge bg-info"
                    >
                      {{ getInstanceLabel(model.instanceType) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="model.version" class="badge bg-secondary">
                      v{{ model.version.versionNumber }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(model)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(model)"
                        :title="t('common:delete')"
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
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" ref="modalRef" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalTitle }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('models:form.code') }} *</label>
                    <input
                      v-model="formData.code"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('models:form.name') }} *</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('models:form.type') }} *</label>
                    <select v-model="formData.modelType" class="form-select" required>
                      <option value="">{{ t('models:form.selectType') }}</option>
                      <option value="PART">{{ t('models:types.PART') }}</option>
                      <option value="ASSEMBLY">{{ t('models:types.ASSEMBLY') }}</option>
                      <option value="DRAWING">{{ t('models:types.DRAWING') }}</option>
                      <option value="FORMAT">{{ t('models:types.FORMAT') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('models:form.instance') }}</label>
                    <select v-model="formData.instanceType" class="form-select">
                      <option value="">{{ t('models:form.selectInstance') }}</option>
                      <option value="GENERIC">{{ t('models:instances.GENERIC') }}</option>
                      <option value="INSTANCE">{{ t('models:instances.INSTANCE') }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  {{ t('common:cancel') }}
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ t('common:save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'bootstrap'

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'i18n']
})

const { t } = useI18n()
const { $axios } = useNuxtApp()

// Reactive data
const loading = ref(false)
const models = ref([])
const searchTerm = ref('')
const selectedTypeFilter = ref('')
const selectedInstanceFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  code: '',
  name: '',
  modelType: '',
  instanceType: ''
})

// Computed
const filteredModels = computed(() => {
  let filtered = models.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(model => 
      model.code?.toLowerCase().includes(search) ||
      model.name?.toLowerCase().includes(search)
    )
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(model => model.modelType === selectedTypeFilter.value)
  }

  if (selectedInstanceFilter.value) {
    filtered = filtered.filter(model => model.instanceType === selectedInstanceFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('models:form.editTitle') : t('models:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/models')
    models.value = response.data || []
  } catch (error) {
    console.error('Error loading models:', error)
    models.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedTypeFilter.value = ''
  selectedInstanceFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    code: '',
    name: '',
    modelType: '',
    instanceType: ''
  }
  modalInstance.value?.show()
}

const handleEdit = (model) => {
  isEditing.value = true
  formData.value = {
    id: model.id,
    code: model.code || '',
    name: model.name || '',
    modelType: model.modelType || '',
    instanceType: model.instanceType || ''
  }
  modalInstance.value?.show()
}

const handleDelete = async (model) => {
  if (!confirm(t('models:confirmDelete', { name: model.name || model.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/models/${model.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting model:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/models/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/models', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving model:', error)
  }
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'PART': 'bg-primary',
    'ASSEMBLY': 'bg-success',
    'DRAWING': 'bg-info',
    'FORMAT': 'bg-warning'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeLabel = (type) => {
  return t(`models:types.${type}`) || type
}

const getInstanceLabel = (instance) => {
  return t(`models:instances.${instance}`) || instance
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  
  if (modalRef.value) {
    modalInstance.value = new Modal(modalRef.value)
  }
})
</script>

<style scoped>
.admin-models-page {
  padding: 1rem;
}
</style>