<template>
  <div class="admin-sheets-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('sheets:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('sheets:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('sheets:page.create') }}
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
            <label class="form-label">{{ t('sheets:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('sheets:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('sheets:filters.format') }}</label>
            <select v-model="selectedFormatFilter" class="form-select">
              <option value="">{{ t('sheets:filters.allFormats') }}</option>
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

    <!-- Sheets Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredSheets.length === 0" class="text-center py-4">
          <i class="bi bi-file-earmark-text fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('sheets:table.noData') }}</h5>
          <p class="text-muted">{{ t('sheets:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('sheets:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('sheets:table.code') }}</th>
                  <th>{{ t('sheets:table.name') }}</th>
                  <th>{{ t('sheets:table.format') }}</th>
                  <th>{{ t('sheets:table.revision') }}</th>
                  <th>{{ t('sheets:table.drawing') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sheet in filteredSheets" :key="sheet.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ sheet.code || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ sheet.name || '-' }}</div>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ sheet.formatType || '-' }}</span>
                  </td>
                  <td>
                    <span v-if="sheet.revision" class="badge bg-secondary">
                      {{ sheet.revision }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div v-if="sheet.drawing">
                      <div class="fw-medium">{{ sheet.drawing.code || sheet.drawing.name }}</div>
                      <small class="text-muted">{{ sheet.drawing.modelType }}</small>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(sheet)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(sheet)"
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
                    <label class="form-label">{{ t('sheets:form.code') }} *</label>
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
                    <label class="form-label">{{ t('sheets:form.name') }} *</label>
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
                    <label class="form-label">{{ t('sheets:form.format') }}</label>
                    <select v-model="formData.formatType" class="form-select">
                      <option value="">{{ t('sheets:form.selectFormat') }}</option>
                      <option value="A0">A0</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('sheets:form.revision') }}</label>
                    <input
                      v-model="formData.revision"
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
const sheets = ref([])
const searchTerm = ref('')
const selectedFormatFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  code: '',
  name: '',
  formatType: '',
  revision: ''
})

// Computed
const filteredSheets = computed(() => {
  let filtered = sheets.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(sheet => 
      sheet.code?.toLowerCase().includes(search) ||
      sheet.name?.toLowerCase().includes(search)
    )
  }

  if (selectedFormatFilter.value) {
    filtered = filtered.filter(sheet => sheet.formatType === selectedFormatFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('sheets:form.editTitle') : t('sheets:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/sheets')
    sheets.value = response.data || []
  } catch (error) {
    console.error('Error loading sheets:', error)
    sheets.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedFormatFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    code: '',
    name: '',
    formatType: '',
    revision: ''
  }
  modalInstance.value?.show()
}

const handleEdit = (sheet) => {
  isEditing.value = true
  formData.value = {
    id: sheet.id,
    code: sheet.code || '',
    name: sheet.name || '',
    formatType: sheet.formatType || '',
    revision: sheet.revision || ''
  }
  modalInstance.value?.show()
}

const handleDelete = async (sheet) => {
  if (!confirm(t('sheets:confirmDelete', { name: sheet.name || sheet.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/sheets/${sheet.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting sheet:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/sheets/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/sheets', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving sheet:', error)
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
.admin-sheets-page {
  padding: 1rem;
}
</style>