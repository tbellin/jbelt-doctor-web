<template>
  <div class="admin-balloons-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('balloons:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('balloons:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('balloons:page.create') }}
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
            <label class="form-label">{{ t('balloons:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('balloons:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('balloons:filters.type') }}</label>
            <select v-model="selectedTypeFilter" class="form-select">
              <option value="">{{ t('balloons:filters.allTypes') }}</option>
              <option value="CIRCLE">{{ t('balloons:types.circle') }}</option>
              <option value="SQUARE">{{ t('balloons:types.square') }}</option>
              <option value="TRIANGLE">{{ t('balloons:types.triangle') }}</option>
              <option value="DIAMOND">{{ t('balloons:types.diamond') }}</option>
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

    <!-- Balloons Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredBalloons.length === 0" class="text-center py-4">
          <i class="bi bi-geo-alt fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('balloons:table.noData') }}</h5>
          <p class="text-muted">{{ t('balloons:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('balloons:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('balloons:table.code') }}</th>
                  <th>{{ t('balloons:table.name') }}</th>
                  <th>{{ t('balloons:table.value') }}</th>
                  <th>{{ t('balloons:table.type') }}</th>
                  <th>{{ t('balloons:table.sheet') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="balloon in filteredBalloons" :key="balloon.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ balloon.code || '-' }}</div>
                    <small v-if="balloon.creoId" class="text-muted">
                      <i class="bi bi-tag me-1"></i>{{ balloon.creoId }}
                    </small>
                  </td>
                  <td>
                    <div class="fw-medium">{{ balloon.name || balloon.baloonName || '-' }}</div>
                  </td>
                  <td>
                    <span v-if="balloon.baloonValue" class="badge bg-primary">
                      {{ balloon.baloonValue }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span 
                      v-if="balloon.baloonType"
                      class="badge"
                      :class="getTypeBadgeClass(balloon.baloonType)"
                    >
                      {{ getTypeLabel(balloon.baloonType) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div v-if="balloon.sheet">
                      <div class="fw-medium">{{ balloon.sheet.code || balloon.sheet.name }}</div>
                      <small class="text-muted">{{ balloon.sheet.formatType }}</small>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(balloon)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(balloon)"
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
                    <label class="form-label">{{ t('balloons:form.code') }} *</label>
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
                    <label class="form-label">{{ t('balloons:form.creoId') }}</label>
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
                    <label class="form-label">{{ t('balloons:form.name') }} *</label>
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
                    <label class="form-label">{{ t('balloons:form.baloonName') }}</label>
                    <input
                      v-model="formData.baloonName"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('balloons:form.baloonValue') }}</label>
                    <input
                      v-model="formData.baloonValue"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('balloons:form.baloonType') }}</label>
                    <select v-model="formData.baloonType" class="form-select">
                      <option value="">{{ t('balloons:form.selectType') }}</option>
                      <option value="CIRCLE">{{ t('balloons:types.circle') }}</option>
                      <option value="SQUARE">{{ t('balloons:types.square') }}</option>
                      <option value="TRIANGLE">{{ t('balloons:types.triangle') }}</option>
                      <option value="DIAMOND">{{ t('balloons:types.diamond') }}</option>
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
const balloons = ref([])
const searchTerm = ref('')
const selectedTypeFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  code: '',
  creoId: '',
  name: '',
  baloonName: '',
  baloonValue: '',
  baloonType: ''
})

// Computed
const filteredBalloons = computed(() => {
  let filtered = balloons.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(balloon => 
      balloon.code?.toLowerCase().includes(search) ||
      balloon.name?.toLowerCase().includes(search) ||
      balloon.baloonName?.toLowerCase().includes(search) ||
      balloon.baloonValue?.toLowerCase().includes(search)
    )
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(balloon => balloon.baloonType === selectedTypeFilter.value)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('balloons:form.editTitle') : t('balloons:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/balloons')
    balloons.value = response.data || []
  } catch (error) {
    console.error('Error loading balloons:', error)
    balloons.value = []
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
    creoId: '',
    name: '',
    baloonName: '',
    baloonValue: '',
    baloonType: ''
  }
  modalInstance.value?.show()
}

const handleEdit = (balloon) => {
  isEditing.value = true
  formData.value = {
    id: balloon.id,
    code: balloon.code || '',
    creoId: balloon.creoId || '',
    name: balloon.name || '',
    baloonName: balloon.baloonName || '',
    baloonValue: balloon.baloonValue || '',
    baloonType: balloon.baloonType || ''
  }
  modalInstance.value?.show()
}

const handleDelete = async (balloon) => {
  if (!confirm(t('balloons:confirmDelete', { name: balloon.name || balloon.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/balloons/${balloon.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting balloon:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/balloons/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/balloons', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving balloon:', error)
  }
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'CIRCLE': 'bg-primary',
    'SQUARE': 'bg-success',
    'TRIANGLE': 'bg-warning',
    'DIAMOND': 'bg-info'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeLabel = (type) => {
  return t(`balloons:types.${type?.toLowerCase()}`) || type
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
.admin-balloons-page {
  padding: 1rem;
}
</style>