<template>
  <div class="admin-model-versions-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('modelVersions:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('modelVersions:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('modelVersions:page.create') }}
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
          <div class="col-md-4">
            <label class="form-label">{{ t('modelVersions:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('modelVersions:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('modelVersions:filters.status') }}</label>
            <select v-model="selectedStatusFilter" class="form-select">
              <option value="">{{ t('modelVersions:filters.allStatuses') }}</option>
              <option value="DRAFT">{{ t('modelVersions:status.DRAFT') }}</option>
              <option value="RELEASED">{{ t('modelVersions:status.RELEASED') }}</option>
              <option value="SUPERSEDED">{{ t('modelVersions:status.SUPERSEDED') }}</option>
              <option value="OBSOLETE">{{ t('modelVersions:status.OBSOLETE') }}</option>
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-end">
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

    <!-- Model Versions Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredModelVersions.length === 0" class="text-center py-4">
          <i class="bi bi-clock-history fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('modelVersions:table.noData') }}</h5>
          <p class="text-muted">{{ t('modelVersions:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('modelVersions:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('modelVersions:table.versionNumber') }}</th>
                  <th>{{ t('modelVersions:table.name') }}</th>
                  <th>{{ t('modelVersions:table.status') }}</th>
                  <th>{{ t('modelVersions:table.model') }}</th>
                  <th>{{ t('modelVersions:table.createdDate') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="version in filteredModelVersions" :key="version.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ version.versionNumber || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ version.name || '-' }}</div>
                    <small v-if="version.comments" class="text-muted">
                      {{ version.comments }}
                    </small>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(version.status)"
                    >
                      {{ getStatusLabel(version.status) }}
                    </span>
                  </td>
                  <td>
                    <div v-if="version.model">
                      <div class="fw-medium">{{ version.model.name || version.model.code }}</div>
                      <small class="text-muted">{{ version.model.itemType }}</small>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="version.createdDate" class="text-muted">
                      {{ formatDate(version.createdDate) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(version)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(version)"
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
                    <label class="form-label">{{ t('modelVersions:form.versionNumber') }} *</label>
                    <input
                      v-model="formData.versionNumber"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('modelVersions:form.name') }}</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('modelVersions:form.status') }}</label>
                    <select v-model="formData.status" class="form-select">
                      <option value="DRAFT">{{ t('modelVersions:status.DRAFT') }}</option>
                      <option value="RELEASED">{{ t('modelVersions:status.RELEASED') }}</option>
                      <option value="SUPERSEDED">{{ t('modelVersions:status.SUPERSEDED') }}</option>
                      <option value="OBSOLETE">{{ t('modelVersions:status.OBSOLETE') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('modelVersions:form.model') }}</label>
                    <select v-model="formData.modelId" class="form-select">
                      <option value="">{{ t('modelVersions:form.selectModel') }}</option>
                      <option v-for="model in availableModels" :key="model.id" :value="model.id">
                        {{ model.name || model.code }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">{{ t('modelVersions:form.comments') }}</label>
                    <textarea
                      v-model="formData.comments"
                      class="form-control"
                      rows="3"
                    ></textarea>
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
const modelVersions = ref([])
const availableModels = ref([])
const searchTerm = ref('')
const selectedStatusFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  versionNumber: '',
  name: '',
  status: 'DRAFT',
  comments: '',
  modelId: null
})

// Computed
const filteredModelVersions = computed(() => {
  let filtered = modelVersions.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(version => 
      version.versionNumber?.toLowerCase().includes(search) ||
      version.name?.toLowerCase().includes(search) ||
      version.comments?.toLowerCase().includes(search)
    )
  }

  if (selectedStatusFilter.value) {
    filtered = filtered.filter(version => version.status === selectedStatusFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('modelVersions:form.editTitle') : t('modelVersions:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const [versionsResponse, modelsResponse] = await Promise.all([
      $axios.get('/api/model-versions'),
      $axios.get('/api/models')
    ])
    modelVersions.value = versionsResponse.data || []
    availableModels.value = modelsResponse.data || []
  } catch (error) {
    console.error('Error loading data:', error)
    modelVersions.value = []
    availableModels.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatusFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    versionNumber: '',
    name: '',
    status: 'DRAFT',
    comments: '',
    modelId: null
  }
  modalInstance.value?.show()
}

const handleEdit = (version) => {
  isEditing.value = true
  formData.value = {
    id: version.id,
    versionNumber: version.versionNumber || '',
    name: version.name || '',
    status: version.status || 'DRAFT',
    comments: version.comments || '',
    modelId: version.model?.id || null
  }
  modalInstance.value?.show()
}

const handleDelete = async (version) => {
  if (!confirm(t('modelVersions:confirmDelete', { name: version.name || version.versionNumber }))) {
    return
  }

  try {
    await $axios.delete(`/api/model-versions/${version.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting model version:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    const submitData = { ...formData.value }
    if (submitData.modelId) {
      submitData.model = { id: submitData.modelId }
      delete submitData.modelId
    }

    if (isEditing.value) {
      await $axios.put(`/api/model-versions/${formData.value.id}`, submitData)
    } else {
      await $axios.post('/api/model-versions', submitData)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving model version:', error)
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'DRAFT': 'bg-secondary',
    'RELEASED': 'bg-success',
    'SUPERSEDED': 'bg-warning',
    'OBSOLETE': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  return t(`modelVersions:status.${status}`) || status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
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
.admin-model-versions-page {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>