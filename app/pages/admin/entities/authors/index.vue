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
          <div class="col-md-4">
            <label class="form-label">{{ t('authors:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('authors:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('authors:filters.team') }}</label>
            <select v-model="selectedTeamFilter" class="form-select">
              <option value="">{{ t('authors:filters.allTeams') }}</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ t('authors:filters.status') }}</label>
            <select v-model="selectedStatusFilter" class="form-select">
              <option value="">{{ t('authors:filters.allStatuses') }}</option>
              <option value="active">{{ t('authors:filters.active') }}</option>
              <option value="inactive">{{ t('authors:filters.inactive') }}</option>
            </select>
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
                <tr v-if="filteredAuthors.length === 0">
                  <td colspan="6" class="text-center text-muted">
                    {{ t('authors:table.noData') }}
                  </td>
                </tr>
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
import { ref, computed, onMounted } from 'vue'
import { type IAuthor } from '~/model/author.model'
import { type ITeam } from '~/model/team.model'

// Page meta
definePageMeta({
  middleware: 'admin',
  layout: 'dashboard'
})

// Composables
const { t } = useI18n()

// Reactive data
const authors = ref<IAuthor[]>([])
const teams = ref<ITeam[]>([])
const selectedAuthor = ref<IAuthor | null>(null)
const modalMode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const modalRef = ref()

// Filters
const searchTerm = ref('')
const selectedTeamFilter = ref('')
const selectedStatusFilter = ref('')

// Form data
const formData = ref({
  id: undefined,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  teamId: '',
  role: '',
  isActive: true
})

// Computed
const modalTitle = computed(() => {
  return modalMode.value === 'create' 
    ? t('authors:modal.create.title')
    : t('authors:modal.edit.title')
})

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

// Methods
const getFullName = (author: IAuthor) => {
  if (!author.firstName && !author.lastName) return '-'
  return [author.firstName, author.lastName].filter(Boolean).join(' ')
}

const refreshData = async () => {
  loading.value = true
  try {
    const { $axios } = useNuxtApp()
    
    // Load teams first
    const teamsResponse = await $axios.get('/api/teams')
    teams.value = teamsResponse.data || []
    
    // Load authors
    const authorsResponse = await $axios.get('/api/authors')
    authors.value = authorsResponse.data || []
    
  } catch (error) {
    console.error('Error loading data:', error)
    // Reset to empty arrays on error
    teams.value = []
    authors.value = []
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedAuthor.value = null
  formData.value = {
    id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    teamId: '',
    role: '',
    isActive: true
  }
  
  if (modalRef.value) {
    const modal = new (window as any).bootstrap.Modal(modalRef.value)
    modal.show()
  }
}

const handleEdit = (author: IAuthor) => {
  modalMode.value = 'edit'
  selectedAuthor.value = author
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
  
  if (modalRef.value) {
    const modal = new (window as any).bootstrap.Modal(modalRef.value)
    modal.show()
  }
}

const handleDelete = async (author: IAuthor) => {
  if (confirm(t('common:confirm'))) {
    try {
      const { $axios } = useNuxtApp()
      await $axios.delete(`/api/authors/${author.id}`)
      
      // Remove from local array on success
      const index = authors.value.findIndex(a => a.id === author.id)
      if (index > -1) {
        authors.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting author:', error)
    }
  }
}

const handleSubmit = async () => {
  try {
    const { $axios } = useNuxtApp()
    const selectedTeam = teams.value.find(t => t.id?.toString() === formData.value.teamId)
    
    // Prepare author data for API
    const authorData = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      phoneNumber: formData.value.phoneNumber || null,
      role: formData.value.role || null,
      isActive: formData.value.isActive,
      team: selectedTeam || null
    }
    
    if (modalMode.value === 'create') {
      const response = await $axios.post('/api/authors', authorData)
      const newAuthor = response.data
      authors.value.push(newAuthor)
    } else {
      const response = await $axios.put(`/api/authors/${formData.value.id}`, {
        id: formData.value.id,
        ...authorData
      })
      const updatedAuthor = response.data
      
      const index = authors.value.findIndex(a => a.id === formData.value.id)
      if (index > -1) {
        authors.value[index] = updatedAuthor
      }
    }
    closeModal()
  } catch (error) {
    console.error('Error submitting author:', error)
  }
}

const closeModal = () => {
  if (modalRef.value) {
    const modal = (window as any).bootstrap.Modal.getInstance(modalRef.value)
    if (modal) {
      modal.hide()
    }
  }
  selectedAuthor.value = null
}

// Lifecycle
onMounted(() => {
  refreshData()
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