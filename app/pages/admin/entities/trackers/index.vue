<template>
  <div class="admin-trackers-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('trackers:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('trackers:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('trackers:page.create') }}
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
            <label class="form-label">{{ t('trackers:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('trackers:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('trackers:filters.status') }}</label>
            <select v-model="selectedStatusFilter" class="form-select">
              <option value="">{{ t('trackers:filters.allStatuses') }}</option>
              <option value="NEW">{{ t('trackers:statuses.NEW') }}</option>
              <option value="IN_PROGRESS">{{ t('trackers:statuses.IN_PROGRESS') }}</option>
              <option value="COMPLETED">{{ t('trackers:statuses.COMPLETED') }}</option>
              <option value="CANCELLED">{{ t('trackers:statuses.CANCELLED') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('trackers:filters.priority') }}</label>
            <select v-model="selectedPriorityFilter" class="form-select">
              <option value="">{{ t('trackers:filters.allPriorities') }}</option>
              <option value="LOW">{{ t('trackers:priorities.LOW') }}</option>
              <option value="MEDIUM">{{ t('trackers:priorities.MEDIUM') }}</option>
              <option value="HIGH">{{ t('trackers:priorities.HIGH') }}</option>
              <option value="URGENT">{{ t('trackers:priorities.URGENT') }}</option>
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

    <!-- Trackers Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredTrackers.length === 0" class="text-center py-4">
          <i class="bi bi-activity fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('trackers:table.noData') }}</h5>
          <p class="text-muted">{{ t('trackers:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('trackers:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('trackers:table.name') }}</th>
                  <th>{{ t('trackers:table.status') }}</th>
                  <th>{{ t('trackers:table.priority') }}</th>
                  <th>{{ t('trackers:table.assignedTo') }}</th>
                  <th>{{ t('trackers:table.progress') }}</th>
                  <th>{{ t('trackers:table.dates') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tracker in filteredTrackers" :key="tracker.id">
                  <td>
                    <div class="fw-medium">{{ tracker.name || '-' }}</div>
                    <small v-if="tracker.description" class="text-muted">
                      {{ tracker.description }}
                    </small>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(tracker.status)"
                    >
                      {{ getStatusLabel(tracker.status) }}
                    </span>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="getPriorityBadgeClass(tracker.priority)"
                    >
                      {{ getPriorityLabel(tracker.priority) }}
                    </span>
                  </td>
                  <td>
                    <div v-if="tracker.assignedTo">
                      <i class="bi bi-person me-1"></i>
                      {{ tracker.assignedTo }}
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="progress flex-grow-1 me-2" style="height: 6px;">
                        <div 
                          class="progress-bar"
                          :style="{ width: (tracker.completionPercentage || 0) + '%' }"
                          :class="getProgressBarClass(tracker.completionPercentage)"
                        ></div>
                      </div>
                      <small class="text-muted">{{ tracker.completionPercentage || 0 }}%</small>
                    </div>
                  </td>
                  <td>
                    <div v-if="tracker.startDate || tracker.endDate" class="small">
                      <div v-if="tracker.startDate">
                        <i class="bi bi-calendar-event me-1"></i>
                        {{ formatDate(tracker.startDate) }}
                      </div>
                      <div v-if="tracker.endDate" class="text-muted">
                        <i class="bi bi-calendar-check me-1"></i>
                        {{ formatDate(tracker.endDate) }}
                      </div>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(tracker)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(tracker)"
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
                    <label class="form-label">{{ t('trackers:form.name') }} *</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.assignedTo') }}</label>
                    <input
                      v-model="formData.assignedTo"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.description') }}</label>
                    <textarea
                      v-model="formData.description"
                      class="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.status') }}</label>
                    <select v-model="formData.status" class="form-select">
                      <option value="NEW">{{ t('trackers:statuses.NEW') }}</option>
                      <option value="IN_PROGRESS">{{ t('trackers:statuses.IN_PROGRESS') }}</option>
                      <option value="COMPLETED">{{ t('trackers:statuses.COMPLETED') }}</option>
                      <option value="CANCELLED">{{ t('trackers:statuses.CANCELLED') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.priority') }}</label>
                    <select v-model="formData.priority" class="form-select">
                      <option value="LOW">{{ t('trackers:priorities.LOW') }}</option>
                      <option value="MEDIUM">{{ t('trackers:priorities.MEDIUM') }}</option>
                      <option value="HIGH">{{ t('trackers:priorities.HIGH') }}</option>
                      <option value="URGENT">{{ t('trackers:priorities.URGENT') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.completionPercentage') }}</label>
                    <input
                      v-model.number="formData.completionPercentage"
                      type="number"
                      class="form-control"
                      min="0"
                      max="100"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.startDate') }}</label>
                    <input
                      v-model="formData.startDate"
                      type="date"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('trackers:form.endDate') }}</label>
                    <input
                      v-model="formData.endDate"
                      type="date"
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
const trackers = ref([])
const searchTerm = ref('')
const selectedStatusFilter = ref('')
const selectedPriorityFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  name: '',
  description: '',
  status: 'NEW',
  priority: 'MEDIUM',
  assignedTo: '',
  completionPercentage: 0,
  startDate: '',
  endDate: ''
})

// Computed
const filteredTrackers = computed(() => {
  let filtered = trackers.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(tracker => 
      tracker.name?.toLowerCase().includes(search) ||
      tracker.description?.toLowerCase().includes(search) ||
      tracker.assignedTo?.toLowerCase().includes(search)
    )
  }

  if (selectedStatusFilter.value) {
    filtered = filtered.filter(tracker => tracker.status === selectedStatusFilter.value)
  }

  if (selectedPriorityFilter.value) {
    filtered = filtered.filter(tracker => tracker.priority === selectedPriorityFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('trackers:form.editTitle') : t('trackers:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/trackers')
    trackers.value = response.data || []
  } catch (error) {
    console.error('Error loading trackers:', error)
    trackers.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatusFilter.value = ''
  selectedPriorityFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    name: '',
    description: '',
    status: 'NEW',
    priority: 'MEDIUM',
    assignedTo: '',
    completionPercentage: 0,
    startDate: '',
    endDate: ''
  }
  modalInstance.value?.show()
}

const handleEdit = (tracker) => {
  isEditing.value = true
  formData.value = {
    id: tracker.id,
    name: tracker.name || '',
    description: tracker.description || '',
    status: tracker.status || 'NEW',
    priority: tracker.priority || 'MEDIUM',
    assignedTo: tracker.assignedTo || '',
    completionPercentage: tracker.completionPercentage || 0,
    startDate: tracker.startDate || '',
    endDate: tracker.endDate || ''
  }
  modalInstance.value?.show()
}

const handleDelete = async (tracker) => {
  if (!confirm(t('trackers:confirmDelete', { name: tracker.name }))) {
    return
  }

  try {
    await $axios.delete(`/api/trackers/${tracker.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting tracker:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/trackers/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/trackers', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving tracker:', error)
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'NEW': 'bg-secondary',
    'IN_PROGRESS': 'bg-primary',
    'COMPLETED': 'bg-success',
    'CANCELLED': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    'LOW': 'bg-info',
    'MEDIUM': 'bg-warning',
    'HIGH': 'bg-orange',
    'URGENT': 'bg-danger'
  }
  return classes[priority] || 'bg-secondary'
}

const getProgressBarClass = (percentage) => {
  if (percentage >= 100) return 'bg-success'
  if (percentage >= 75) return 'bg-info'
  if (percentage >= 50) return 'bg-warning'
  return 'bg-danger'
}

const getStatusLabel = (status) => {
  return t(`trackers:statuses.${status}`) || status
}

const getPriorityLabel = (priority) => {
  return t(`trackers:priorities.${priority}`) || priority
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
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
.admin-trackers-page {
  padding: 1rem;
}

.progress {
  background-color: #e9ecef;
}
</style>