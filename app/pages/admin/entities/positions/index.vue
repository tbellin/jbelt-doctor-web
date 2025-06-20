<template>
  <div class="admin-positions-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('positions:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('positions:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('positions:page.create') }}
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
          <div class="col-md-6">
            <label class="form-label">{{ t('positions:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('positions:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-6 d-flex align-items-end">
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

    <!-- Positions Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredPositions.length === 0" class="text-center py-4">
          <i class="bi bi-geo-alt fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('positions:table.noData') }}</h5>
          <p class="text-muted">{{ t('positions:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('positions:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('positions:table.name') }}</th>
                  <th>{{ t('positions:table.coordinates') }}</th>
                  <th>{{ t('positions:table.unit') }}</th>
                  <th>{{ t('positions:table.marker') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="position in filteredPositions" :key="position.id">
                  <td>
                    <div class="fw-medium">{{ position.name || '-' }}</div>
                  </td>
                  <td>
                    <div v-if="position.posX !== null || position.posY !== null || position.posZ !== null">
                      <span class="badge bg-info me-1">X: {{ position.posX || 0 }}</span>
                      <span class="badge bg-info me-1">Y: {{ position.posY || 0 }}</span>
                      <span class="badge bg-info">Z: {{ position.posZ || 0 }}</span>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="position.unit" class="badge bg-secondary">
                      {{ position.unit }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div v-if="position.marker">
                      <div class="fw-medium">{{ position.marker.name || position.marker.code }}</div>
                      <small class="text-muted">{{ position.marker.markerType }}</small>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(position)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(position)"
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
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">{{ t('positions:form.name') }} *</label>
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
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('positions:form.posX') }}</label>
                    <input
                      v-model.number="formData.posX"
                      type="number"
                      step="0.01"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('positions:form.posY') }}</label>
                    <input
                      v-model.number="formData.posY"
                      type="number"
                      step="0.01"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('positions:form.posZ') }}</label>
                    <input
                      v-model.number="formData.posZ"
                      type="number"
                      step="0.01"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('positions:form.unit') }}</label>
                    <select v-model="formData.unit" class="form-select">
                      <option value="">{{ t('positions:form.selectUnit') }}</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('positions:form.marker') }}</label>
                    <select v-model="formData.markerId" class="form-select">
                      <option value="">{{ t('positions:form.selectMarker') }}</option>
                      <option v-for="marker in availableMarkers" :key="marker.id" :value="marker.id">
                        {{ marker.name || marker.code }}
                      </option>
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
const positions = ref([])
const availableMarkers = ref([])
const searchTerm = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  name: '',
  posX: null,
  posY: null,
  posZ: null,
  unit: '',
  markerId: null
})

// Computed
const filteredPositions = computed(() => {
  let filtered = positions.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(position => 
      position.name?.toLowerCase().includes(search)
    )
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('positions:form.editTitle') : t('positions:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const [positionsResponse, markersResponse] = await Promise.all([
      $axios.get('/api/positions'),
      $axios.get('/api/markers')
    ])
    positions.value = positionsResponse.data || []
    availableMarkers.value = markersResponse.data || []
  } catch (error) {
    console.error('Error loading data:', error)
    positions.value = []
    availableMarkers.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    name: '',
    posX: null,
    posY: null,
    posZ: null,
    unit: '',
    markerId: null
  }
  modalInstance.value?.show()
}

const handleEdit = (position) => {
  isEditing.value = true
  formData.value = {
    id: position.id,
    name: position.name || '',
    posX: position.posX,
    posY: position.posY,
    posZ: position.posZ,
    unit: position.unit || '',
    markerId: position.marker?.id || null
  }
  modalInstance.value?.show()
}

const handleDelete = async (position) => {
  if (!confirm(t('positions:confirmDelete', { name: position.name }))) {
    return
  }

  try {
    await $axios.delete(`/api/positions/${position.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting position:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    const submitData = { ...formData.value }
    if (submitData.markerId) {
      submitData.marker = { id: submitData.markerId }
      delete submitData.markerId
    }

    if (isEditing.value) {
      await $axios.put(`/api/positions/${formData.value.id}`, submitData)
    } else {
      await $axios.post('/api/positions', submitData)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving position:', error)
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
.admin-positions-page {
  padding: 1rem;
}
</style>