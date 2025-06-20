<template>
  <div class="admin-archives-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('archives:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('archives:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('archives:page.create') }}
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
            <label class="form-label">{{ t('archives:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('archives:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('archives:filters.type') }}</label>
            <select v-model="selectedTypeFilter" class="form-select">
              <option value="">{{ t('archives:filters.allTypes') }}</option>
              <option value="CAD">{{ t('archives:types.CAD') }}</option>
              <option value="IMAGE">{{ t('archives:types.IMAGE') }}</option>
              <option value="DOCUMENT">{{ t('archives:types.DOCUMENT') }}</option>
              <option value="OTHER">{{ t('archives:types.OTHER') }}</option>
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

    <!-- Archives Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredArchives.length === 0" class="text-center py-4">
          <i class="bi bi-archive fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('archives:table.noData') }}</h5>
          <p class="text-muted">{{ t('archives:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('archives:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('archives:table.code') }}</th>
                  <th>{{ t('archives:table.name') }}</th>
                  <th>{{ t('archives:table.type') }}</th>
                  <th>{{ t('archives:table.fileName') }}</th>
                  <th>{{ t('archives:table.size') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="archive in filteredArchives" :key="archive.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ archive.code || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ archive.name || '-' }}</div>
                    <small v-if="archive.category" class="text-muted">
                      <i class="bi bi-tag me-1"></i>{{ archive.category }}
                    </small>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="getTypeBadgeClass(archive.type)"
                    >
                      {{ getTypeLabel(archive.type) }}
                    </span>
                  </td>
                  <td>
                    <div v-if="archive.fileName">
                      <div class="fw-medium">{{ archive.fileName }}</div>
                      <small v-if="archive.extension" class="text-muted">
                        {{ archive.extension }}
                      </small>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="archive.fileSize" class="badge bg-secondary">
                      {{ formatFileSize(archive.fileSize) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(archive)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(archive)"
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
                    <label class="form-label">{{ t('archives:form.code') }} *</label>
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
                    <label class="form-label">{{ t('archives:form.name') }} *</label>
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
                    <label class="form-label">{{ t('archives:form.type') }}</label>
                    <select v-model="formData.type" class="form-select">
                      <option value="">{{ t('archives:form.selectType') }}</option>
                      <option value="CAD">{{ t('archives:types.CAD') }}</option>
                      <option value="IMAGE">{{ t('archives:types.IMAGE') }}</option>
                      <option value="DOCUMENT">{{ t('archives:types.DOCUMENT') }}</option>
                      <option value="OTHER">{{ t('archives:types.OTHER') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('archives:form.category') }}</label>
                    <input
                      v-model="formData.category"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('archives:form.fileName') }}</label>
                    <input
                      v-model="formData.fileName"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('archives:form.folder') }}</label>
                    <input
                      v-model="formData.folder"
                      type="text"
                      class="form-control"
                    >
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
const archives = ref([])
const searchTerm = ref('')
const selectedTypeFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  code: '',
  name: '',
  type: '',
  category: '',
  fileName: '',
  folder: ''
})

// Computed
const filteredArchives = computed(() => {
  let filtered = archives.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(archive => 
      archive.code?.toLowerCase().includes(search) ||
      archive.name?.toLowerCase().includes(search) ||
      archive.fileName?.toLowerCase().includes(search)
    )
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(archive => archive.type === selectedTypeFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('archives:form.editTitle') : t('archives:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/archives')
    archives.value = response.data || []
  } catch (error) {
    console.error('Error loading archives:', error)
    archives.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedTypeFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    code: '',
    name: '',
    type: '',
    category: '',
    fileName: '',
    folder: ''
  }
  modalInstance.value?.show()
}

const handleEdit = (archive) => {
  isEditing.value = true
  formData.value = {
    id: archive.id,
    code: archive.code || '',
    name: archive.name || '',
    type: archive.type || '',
    category: archive.category || '',
    fileName: archive.fileName || '',
    folder: archive.folder || ''
  }
  modalInstance.value?.show()
}

const handleDelete = async (archive) => {
  if (!confirm(t('archives:confirmDelete', { name: archive.name || archive.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/archives/${archive.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting archive:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/archives/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/archives', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving archive:', error)
  }
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'CAD': 'bg-primary',
    'IMAGE': 'bg-success',
    'DOCUMENT': 'bg-info',
    'OTHER': 'bg-secondary'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeLabel = (type) => {
  return t(`archives:types.${type}`) || type
}

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
.admin-archives-page {
  padding: 1rem;
}

.file-preview {
  max-height: 400px;
  overflow: auto;
}

.text-preview pre {
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group .btn:not(:first-child) {
  margin-left: 0.5rem;
}
</style>