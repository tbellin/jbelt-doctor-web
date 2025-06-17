<template>
  <div class="admin-markers-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('markers:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('markers:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('markers:page.create') }}
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
            <label class="form-label">{{ t('markers:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('markers:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('markers:filters.type') }}</label>
            <select v-model="selectedTypeFilter" class="form-select">
              <option value="">{{ t('markers:filters.allTypes') }}</option>
              <option value="DIMENSION">{{ t('markers:types.DIMENSION') }}</option>
              <option value="GEOMETRIC">{{ t('markers:types.GEOMETRIC') }}</option>
              <option value="TOLERANCE">{{ t('markers:types.TOLERANCE') }}</option>
              <option value="ANNOTATION">{{ t('markers:types.ANNOTATION') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('markers:filters.shape') }}</label>
            <select v-model="selectedShapeFilter" class="form-select">
              <option value="">{{ t('markers:filters.allShapes') }}</option>
              <option value="CIRCLE">{{ t('markers:shapes.CIRCLE') }}</option>
              <option value="SQUARE">{{ t('markers:shapes.SQUARE') }}</option>
              <option value="TRIANGLE">{{ t('markers:shapes.TRIANGLE') }}</option>
              <option value="DIAMOND">{{ t('markers:shapes.DIAMOND') }}</option>
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

    <!-- Markers Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredMarkers.length === 0" class="text-center py-4">
          <i class="bi bi-bookmark fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('markers:table.noData') }}</h5>
          <p class="text-muted">{{ t('markers:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('markers:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('markers:table.code') }}</th>
                  <th>{{ t('markers:table.name') }}</th>
                  <th>{{ t('markers:table.type') }}</th>
                  <th>{{ t('markers:table.shape') }}</th>
                  <th>{{ t('markers:table.symbol') }}</th>
                  <th>{{ t('markers:table.usage') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="marker in filteredMarkers" :key="marker.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ marker.code || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ marker.name || '-' }}</div>
                    <small v-if="marker.description" class="text-muted">
                      {{ marker.description }}
                    </small>
                  </td>
                  <td>
                    <span v-if="marker.markerType" class="badge bg-primary">
                      {{ getTypeLabel(marker.markerType) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="marker.shape" class="badge bg-info">
                      {{ getShapeLabel(marker.shape) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div v-if="marker.symbol" class="fw-medium font-monospace">
                      {{ marker.symbol }}
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span v-if="marker.useInBalloons" class="badge bg-success">
                        {{ t('markers:usage.balloons') }}
                      </span>
                      <span v-if="marker.useInAnnotations" class="badge bg-warning">
                        {{ t('markers:usage.annotations') }}
                      </span>
                      <span v-if="!marker.useInBalloons && !marker.useInAnnotations" class="text-muted">
                        -
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(marker)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(marker)"
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
                    <label class="form-label">{{ t('markers:form.code') }} *</label>
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
                    <label class="form-label">{{ t('markers:form.name') }} *</label>
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
                    <label class="form-label">{{ t('markers:form.markerType') }}</label>
                    <select v-model="formData.markerType" class="form-select">
                      <option value="">{{ t('markers:form.selectType') }}</option>
                      <option value="DIMENSION">{{ t('markers:types.DIMENSION') }}</option>
                      <option value="GEOMETRIC">{{ t('markers:types.GEOMETRIC') }}</option>
                      <option value="TOLERANCE">{{ t('markers:types.TOLERANCE') }}</option>
                      <option value="ANNOTATION">{{ t('markers:types.ANNOTATION') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('markers:form.shape') }}</label>
                    <select v-model="formData.shape" class="form-select">
                      <option value="">{{ t('markers:form.selectShape') }}</option>
                      <option value="CIRCLE">{{ t('markers:shapes.CIRCLE') }}</option>
                      <option value="SQUARE">{{ t('markers:shapes.SQUARE') }}</option>
                      <option value="TRIANGLE">{{ t('markers:shapes.TRIANGLE') }}</option>
                      <option value="DIAMOND">{{ t('markers:shapes.DIAMOND') }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('markers:form.symbol') }}</label>
                    <input
                      v-model="formData.symbol"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('markers:form.size') }}</label>
                    <input
                      v-model.number="formData.size"
                      type="number"
                      step="0.1"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">{{ t('markers:form.description') }}</label>
                    <textarea
                      v-model="formData.description"
                      class="form-control"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-check mb-3">
                    <input
                      v-model="formData.useInBalloons"
                      class="form-check-input"
                      type="checkbox"
                      id="useInBalloons"
                    >
                    <label class="form-check-label" for="useInBalloons">
                      {{ t('markers:form.useInBalloons') }}
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check mb-3">
                    <input
                      v-model="formData.useInAnnotations"
                      class="form-check-input"
                      type="checkbox"
                      id="useInAnnotations"
                    >
                    <label class="form-check-label" for="useInAnnotations">
                      {{ t('markers:form.useInAnnotations') }}
                    </label>
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
const markers = ref([])
const searchTerm = ref('')
const selectedTypeFilter = ref('')
const selectedShapeFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  code: '',
  name: '',
  markerType: '',
  shape: '',
  symbol: '',
  size: null,
  description: '',
  useInBalloons: false,
  useInAnnotations: false
})

// Computed
const filteredMarkers = computed(() => {
  let filtered = markers.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(marker => 
      marker.code?.toLowerCase().includes(search) ||
      marker.name?.toLowerCase().includes(search) ||
      marker.description?.toLowerCase().includes(search) ||
      marker.symbol?.toLowerCase().includes(search)
    )
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(marker => marker.markerType === selectedTypeFilter.value)
  }

  if (selectedShapeFilter.value) {
    filtered = filtered.filter(marker => marker.shape === selectedShapeFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('markers:form.editTitle') : t('markers:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/markers')
    markers.value = response.data || []
  } catch (error) {
    console.error('Error loading markers:', error)
    markers.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedTypeFilter.value = ''
  selectedShapeFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    code: '',
    name: '',
    markerType: '',
    shape: '',
    symbol: '',
    size: null,
    description: '',
    useInBalloons: false,
    useInAnnotations: false
  }
  modalInstance.value?.show()
}

const handleEdit = (marker) => {
  isEditing.value = true
  formData.value = {
    id: marker.id,
    code: marker.code || '',
    name: marker.name || '',
    markerType: marker.markerType || '',
    shape: marker.shape || '',
    symbol: marker.symbol || '',
    size: marker.size || null,
    description: marker.description || '',
    useInBalloons: marker.useInBalloons || false,
    useInAnnotations: marker.useInAnnotations || false
  }
  modalInstance.value?.show()
}

const handleDelete = async (marker) => {
  if (!confirm(t('markers:confirmDelete', { name: marker.name || marker.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/markers/${marker.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting marker:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/markers/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/markers', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving marker:', error)
  }
}

const getTypeLabel = (type) => {
  return t(`markers:types.${type}`) || type
}

const getShapeLabel = (shape) => {
  return t(`markers:shapes.${shape}`) || shape
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
.admin-markers-page {
  padding: 1rem;
}
</style>