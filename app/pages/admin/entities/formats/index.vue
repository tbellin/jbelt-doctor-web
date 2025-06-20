<template>
  <div class="admin-formats-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('formats:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('formats:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('formats:page.create') }}
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
            <label class="form-label">{{ t('formats:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('formats:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('formats:filters.type') }}</label>
            <select v-model="selectedTypeFilter" class="form-select">
              <option value="">{{ t('formats:filters.allTypes') }}</option>
              <option value="A0">A0</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A3">A3</option>
              <option value="A4">A4</option>
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

    <!-- Formats Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredFormats.length === 0" class="text-center py-4">
          <i class="bi bi-grid-3x3 fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('formats:table.noData') }}</h5>
          <p class="text-muted">{{ t('formats:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('formats:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('formats:table.code') }}</th>
                  <th>{{ t('formats:table.name') }}</th>
                  <th>{{ t('formats:table.type') }}</th>
                  <th>{{ t('formats:table.dimensions') }}</th>
                  <th>{{ t('formats:table.grid') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="format in filteredFormats" :key="format.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ format.code || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ format.name || '-' }}</div>
                    <small v-if="format.creoId" class="text-muted">
                      <i class="bi bi-tag me-1"></i>{{ format.creoId }}
                    </small>
                  </td>
                  <td>
                    <span class="badge bg-primary">
                      {{ format.formatType || '-' }}
                    </span>
                  </td>
                  <td>
                    <div v-if="format.dimX && format.dimY">
                      <span class="fw-medium">{{ format.dimX }}×{{ format.dimY }}</span>
                      <small class="text-muted">mm</small>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div v-if="format.nColumns || format.nRows">
                      <span class="badge bg-info">
                        {{ format.nColumns || 1 }}×{{ format.nRows || 1 }}
                      </span>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(format)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(format)"
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
                    <label class="form-label">{{ t('formats:form.code') }} *</label>
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
                    <label class="form-label">{{ t('formats:form.name') }} *</label>
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
                    <label class="form-label">{{ t('formats:form.formatType') }}</label>
                    <input
                      v-model="formData.formatType"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('formats:form.creoId') }}</label>
                    <input
                      v-model="formData.creoId"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('formats:form.dimX') }}</label>
                    <input
                      v-model.number="formData.dimX"
                      type="number"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('formats:form.dimY') }}</label>
                    <input
                      v-model.number="formData.dimY"
                      type="number"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('formats:form.nColumns') }}</label>
                    <input
                      v-model.number="formData.nColumns"
                      type="number"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('formats:form.nRows') }}</label>
                    <input
                      v-model.number="formData.nRows"
                      type="number"
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
const formats = ref([])
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
  formatType: '',
  creoId: '',
  dimX: null,
  dimY: null,
  nColumns: null,
  nRows: null
})

// Computed
const filteredFormats = computed(() => {
  let filtered = formats.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(format => 
      format.code?.toLowerCase().includes(search) ||
      format.name?.toLowerCase().includes(search) ||
      format.formatType?.toLowerCase().includes(search)
    )
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(format => format.formatType?.startsWith(selectedTypeFilter.value))
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('formats:form.editTitle') : t('formats:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/formats')
    formats.value = response.data || []
  } catch (error) {
    console.error('Error loading formats:', error)
    formats.value = []
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
    formatType: '',
    creoId: '',
    dimX: null,
    dimY: null,
    nColumns: null,
    nRows: null
  }
  modalInstance.value?.show()
}

const handleEdit = (format) => {
  isEditing.value = true
  formData.value = {
    id: format.id,
    code: format.code || '',
    name: format.name || '',
    formatType: format.formatType || '',
    creoId: format.creoId || '',
    dimX: format.dimX || null,
    dimY: format.dimY || null,
    nColumns: format.nColumns || null,
    nRows: format.nRows || null
  }
  modalInstance.value?.show()
}

const handleDelete = async (format) => {
  if (!confirm(t('formats:confirmDelete', { name: format.name || format.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/formats/${format.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting format:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/formats/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/formats', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving format:', error)
  }
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
.admin-formats-page {
  padding: 1rem;
}

.format-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.format-preview-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.format-preview-card:hover {
  transform: translateY(-2px);
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  margin-bottom: 0.5rem;
}

.format-preview {
  background: white;
  border-radius: 0.375rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.format-label {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 0.7rem;
  background: #0d6efd;
  color: white;
  padding: 2px 6px;
  border-radius: 0.25rem;
}

.format-dimensions {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 0.6rem;
  color: #6c757d;
}

.format-large-preview {
  border-radius: 0.5rem;
  min-height: 200px;
}

.format-visual-preview {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>