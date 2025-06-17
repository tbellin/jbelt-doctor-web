<template>
  <div class="admin-authors-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('authors:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('authors:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-person-plus me-2"></i>
          {{ t('authors:page.create') }}
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
            <label class="form-label">{{ t('authors:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('authors:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('authors:filters.team') }}</label>
            <select v-model="selectedTeamFilter" class="form-select">
              <option value="">{{ t('authors:filters.allTeams') }}</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('authors:filters.status') }}</label>
            <select v-model="selectedStatusFilter" class="form-select">
              <option value="">{{ t('authors:filters.allStatuses') }}</option>
              <option value="active">{{ t('authors:filters.active') }}</option>
              <option value="inactive">{{ t('authors:filters.inactive') }}</option>
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

    <!-- Authors Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredAuthors.length === 0" class="text-center py-4">
          <i class="bi bi-people fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('authors:table.noData') }}</h5>
          <p class="text-muted">{{ t('authors:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-person-plus me-2"></i>
            {{ t('authors:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('authors:table.name') }}</th>
                  <th>{{ t('authors:table.email') }}</th>
                  <th>{{ t('authors:table.team') }}</th>
                  <th>{{ t('authors:table.role') }}</th>
                  <th>{{ t('authors:table.status') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="author in filteredAuthors" :key="author.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-3">
                        <i class="bi bi-person"></i>
                      </div>
                      <div>
                        <div class="fw-medium">{{ getFullName(author) }}</div>
                        <small class="text-muted">{{ author.phoneNumber || '-' }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ author.email || '-' }}</td>
                  <td>
                    <span v-if="author.team" class="badge bg-info">
                      {{ author.team.name }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ author.role || '-' }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="author.isActive ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ author.isActive ? t('authors:status.active') : t('authors:status.inactive') }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(author)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(author)"
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
                    <label class="form-label">{{ t('authors:form.firstName') }}</label>
                    <input
                      v-model="formData.firstName"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('authors:form.lastName') }}</label>
                    <input
                      v-model="formData.lastName"
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
                    <label class="form-label">{{ t('authors:form.email') }}</label>
                    <input
                      v-model="formData.email"
                      type="email"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('authors:form.phoneNumber') }}</label>
                    <input
                      v-model="formData.phoneNumber"
                      type="tel"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('authors:form.team') }}</label>
                    <select v-model="formData.teamId" class="form-select">
                      <option value="">{{ t('authors:form.selectTeam') }}</option>
                      <option v-for="team in teams" :key="team.id" :value="team.id">
                        {{ team.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('authors:form.role') }}</label>
                    <input
                      v-model="formData.role"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    v-model="formData.isActive"
                    class="form-check-input"
                    type="checkbox"
                    id="isActive"
                  >
                  <label class="form-check-label" for="isActive">
                    {{ t('authors:form.isActive') }}
                  </label>
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
const authors = ref([])
const teams = ref([])
const searchTerm = ref('')
const selectedTeamFilter = ref('')
const selectedStatusFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  teamId: '',
  role: '',
  isActive: true
})

// Computed
const filteredAuthors = computed(() => {
  let filtered = authors.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(author => 
      getFullName(author).toLowerCase().includes(term) ||
      (author.email && author.email.toLowerCase().includes(term))
    )
  }

  if (selectedTeamFilter.value) {
    filtered = filtered.filter(author => 
      author.team?.id?.toString() === selectedTeamFilter.value
    )
  }

  if (selectedStatusFilter.value) {
    const isActive = selectedStatusFilter.value === 'active'
    filtered = filtered.filter(author => author.isActive === isActive)
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('authors:form.editTitle') : t('authors:form.createTitle')
})

// Methods
const getFullName = (author: IAuthor) => {
  if (!author.firstName && !author.lastName) return '-'
  return [author.firstName, author.lastName].filter(Boolean).join(' ')
}

const refreshData = async () => {
  loading.value = true
  try {
    const [teamsResponse, authorsResponse] = await Promise.all([
      $axios.get('/api/teams'),
      $axios.get('/api/authors')
    ])
    teams.value = teamsResponse.data || []
    authors.value = authorsResponse.data || []
  } catch (error) {
    console.error('Error loading data:', error)
    teams.value = []
    authors.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedTeamFilter.value = ''
  selectedStatusFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    teamId: '',
    role: '',
    isActive: true
  }
  modalInstance.value?.show()
}

const handleEdit = (author) => {
  isEditing.value = true
  formData.value = {
    id: author.id,
    firstName: author.firstName || '',
    lastName: author.lastName || '',
    email: author.email || '',
    phoneNumber: author.phoneNumber || '',
    teamId: author.team?.id?.toString() || '',
    role: author.role || '',
    isActive: author.isActive ?? true
  }
  modalInstance.value?.show()
}

const handleDelete = async (author) => {
  if (!confirm(t('authors:confirmDelete', { name: getFullName(author) }))) {
    return
  }

  try {
    await $axios.delete(`/api/authors/${author.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting author:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    const submitData = { ...formData.value }
    if (submitData.teamId) {
      const selectedTeam = teams.value.find(t => t.id?.toString() === submitData.teamId)
      submitData.team = selectedTeam || null
      delete submitData.teamId
    }

    if (isEditing.value) {
      await $axios.put(`/api/authors/${formData.value.id}`, submitData)
    } else {
      await $axios.post('/api/authors', submitData)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving author:', error)
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
.admin-authors-page {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 1.2rem;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>