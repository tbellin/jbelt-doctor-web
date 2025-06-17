<template>
  <div class="admin-teams-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('teams:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('teams:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-diagram-3-fill me-2"></i>
          {{ t('teams:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>
          {{ t('common:refresh') }}
        </button>
        <button
          class="btn btn-outline-info"
          @click="toggleExpandAll"
        >
          <i class="bi" :class="allExpanded ? 'bi-dash-square' : 'bi-plus-square'"></i>
          {{ allExpanded ? t('teams:table.collapseAll') : t('teams:table.expandAll') }}
        </button>
      </div>
    </div>

    <!-- Teams Tree Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover teams-tree-table">
              <thead>
                <tr>
                  <th style="width: 40%">{{ t('teams:table.name') }}</th>
                  <th>{{ t('teams:table.members') }}</th>
                  <th>{{ t('teams:table.location') }}</th>
                  <th>{{ t('teams:table.contact') }}</th>
                  <th>{{ t('teams:table.status') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="rootTeams.length === 0">
                  <td colspan="6" class="text-center text-muted">
                    {{ t('teams:table.noData') }}
                  </td>
                </tr>
                <template v-for="team in getAllTeamsFlattened()" :key="team.id">
                  <tr v-if="shouldShowTeam(team)">
                    <td>
                      <div class="d-flex align-items-center" :style="{ paddingLeft: getTeamPadding(team) }">
                        <button 
                          v-if="hasChildren(team)"
                          class="btn btn-sm btn-link p-0 me-2 text-muted"
                          @click="toggleTeam(team.id!)"
                        >
                          <i class="bi" :class="isExpanded(team.id!) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                        </button>
                        <div v-else class="me-4"></div>
                        <div>
                          <div class="fw-medium">{{ team.name }}</div>
                          <small v-if="team.description" class="text-muted">{{ team.description }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark">{{ getMemberCount(team) }}</span>
                    </td>
                    <td>{{ getLocation(team) }}</td>
                    <td>
                      <div v-if="team.contactEmail || team.contactPhone">
                        <div v-if="team.contactEmail" class="small">{{ team.contactEmail }}</div>
                        <div v-if="team.contactPhone" class="small text-muted">{{ team.contactPhone }}</div>
                      </div>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span 
                        class="badge"
                        :class="team.isActive ? 'bg-success' : 'bg-secondary'"
                      >
                        {{ team.isActive ? t('teams:status.active') : t('teams:status.inactive') }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-success"
                          @click="handleAddChild(team)"
                          :title="t('teams:actions.addChild')"
                        >
                          <i class="bi bi-plus"></i>
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          @click="handleEdit(team)"
                          :title="t('common:edit')"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="handleDelete(team)"
                          :title="t('common:delete')"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
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
                    <label class="form-label">{{ t('teams:form.name') }} *</label>
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
                    <label class="form-label">{{ t('teams:form.department') }}</label>
                    <input
                      v-model="formData.department"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('teams:form.description') }}</label>
                <textarea
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('teams:form.parentTeam') }}</label>
                <select v-model="formData.headQuarterId" class="form-select">
                  <option value="">{{ t('teams:form.noParent') }}</option>
                  <option v-for="team in availableParentTeams" :key="team.id" :value="team.id">
                    {{ getTeamHierarchyName(team) }}
                  </option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('teams:form.contactEmail') }}</label>
                    <input
                      v-model="formData.contactEmail"
                      type="email"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('teams:form.contactPhone') }}</label>
                    <input
                      v-model="formData.contactPhone"
                      type="tel"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">{{ t('teams:form.address') }}</label>
                    <input
                      v-model="formData.address"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">{{ t('teams:form.city') }}</label>
                    <input
                      v-model="formData.city"
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
                    {{ t('teams:form.isActive') }}
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
const teams = ref([])
const expandedTeams = ref<Set<number>>(new Set())
const allExpanded = ref(false)
const parentTeamId = ref<number | null>(null)

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  name: '',
  description: '',
  department: '',
  headQuarterId: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  city: '',
  isActive: true
})

// Computed
const modalTitle = computed(() => {
  if (isEditing.value) {
    return t('teams:form.editTitle')
  }
  return parentTeamId.value 
    ? t('teams:form.createChildTitle')
    : t('teams:form.createTitle')
})

const rootTeams = computed(() => {
  return teams.value.filter(team => !team.headQuarter)
})

const availableParentTeams = computed(() => {
  if (isEditing.value && formData.value.id) {
    // Exclude the team being edited and its descendants to prevent circular references
    return teams.value.filter(team => 
      team.id !== formData.value.id && 
      !isDescendantOf(team, { id: formData.value.id } as any)
    )
  }
  return teams.value
})

// Helper functions for template
const getLocation = (team: ITeam) => {
  const parts = [team.city, team.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '-'
}

const getMemberCount = (team: ITeam) => {
  return team.members?.length || 0
}

const getChildren = (team: ITeam) => {
  return teams.value.filter(t => t.headQuarter?.id === team.id)
}

const hasChildren = (team: ITeam) => {
  return getChildren(team).length > 0
}

const isExpanded = (teamId: number) => {
  return expandedTeams.value.has(teamId)
}

const getTeamLevel = (team: ITeam): number => {
  let level = 0
  let current = team.headQuarter
  while (current) {
    level++
    current = current.headQuarter
  }
  return level
}

const getTeamPadding = (team: ITeam): string => {
  return `${getTeamLevel(team) * 2}rem`
}

const shouldShowTeam = (team: ITeam): boolean => {
  // Always show root teams
  if (!team.headQuarter) return true
  
  // Show child teams only if parent is expanded
  let current = team.headQuarter
  while (current) {
    if (!isExpanded(current.id!)) return false
    current = current.headQuarter
  }
  return true
}

const getAllTeamsFlattened = () => {
  // Sort teams by hierarchy: root teams first, then children in order
  const sortedTeams = [...teams.value].sort((a, b) => {
    // Get hierarchy paths
    const getPath = (team: ITeam): string => {
      const parts = []
      let current: ITeam | null = team
      while (current) {
        parts.unshift(current.name || '')
        current = current.headQuarter
      }
      return parts.join('/')
    }
    
    return getPath(a).localeCompare(getPath(b))
  })
  
  return sortedTeams
}

// Methods
const isDescendantOf = (team: ITeam, ancestor: ITeam): boolean => {
  let current = team.headQuarter
  while (current) {
    if (current.id === ancestor.id) return true
    current = current.headQuarter
  }
  return false
}

const getTeamHierarchyName = (team: ITeam): string => {
  const parts = []
  let current: ITeam | null = team
  while (current) {
    parts.unshift(current.name)
    current = current.headQuarter
  }
  return parts.join(' > ')
}

const toggleTeam = (teamId: number) => {
  if (expandedTeams.value.has(teamId)) {
    expandedTeams.value.delete(teamId)
  } else {
    expandedTeams.value.add(teamId)
  }
}

const toggleExpandAll = () => {
  if (allExpanded.value) {
    expandedTeams.value.clear()
  } else {
    teams.value.forEach(team => {
      if (team.id) expandedTeams.value.add(team.id)
    })
  }
  allExpanded.value = !allExpanded.value
}

const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/teams')
    teams.value = response.data || []
  } catch (error) {
    console.error('Error loading teams:', error)
    teams.value = []
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  parentTeamId.value = null
  formData.value = {
    id: null,
    name: '',
    description: '',
    department: '',
    headQuarterId: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    isActive: true
  }
  modalInstance.value?.show()
}

const handleAddChild = (parentTeam) => {
  isEditing.value = false
  parentTeamId.value = parentTeam.id
  formData.value = {
    id: null,
    name: '',
    description: '',
    department: parentTeam.department || '',
    headQuarterId: parentTeam.id.toString(),
    contactEmail: '',
    contactPhone: '',
    address: parentTeam.address || '',
    city: parentTeam.city || '',
    isActive: true
  }
  modalInstance.value?.show()
}

const handleEdit = (team) => {
  isEditing.value = true
  parentTeamId.value = null
  formData.value = {
    id: team.id,
    name: team.name || '',
    description: team.description || '',
    department: team.department || '',
    headQuarterId: team.headQuarter?.id?.toString() || '',
    contactEmail: team.contactEmail || '',
    contactPhone: team.contactPhone || '',
    address: team.address || '',
    city: team.city || '',
    isActive: team.isActive ?? true
  }
  modalInstance.value?.show()
}

const handleDelete = async (team) => {
  const children = teams.value.filter(t => t.headQuarter?.id === team.id)
  if (children.length > 0) {
    alert(t('teams:messages.cannotDeleteWithChildren'))
    return
  }
  
  if (!confirm(t('teams:confirmDelete', { name: team.name }))) {
    return
  }

  try {
    await $axios.delete(`/api/teams/${team.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting team:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    const submitData = { ...formData.value }
    if (submitData.headQuarterId) {
      const parentTeam = teams.value.find(t => t.id?.toString() === submitData.headQuarterId)
      submitData.headQuarter = parentTeam || null
      delete submitData.headQuarterId
    }

    if (isEditing.value) {
      await $axios.put(`/api/teams/${formData.value.id}`, submitData)
    } else {
      await $axios.post('/api/teams', submitData)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving team:', error)
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
.admin-teams-page {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.teams-tree-table {
  font-size: 0.9rem;
}

.teams-tree-table td {
  vertical-align: middle;
  border-color: #f1f3f4;
}

.teams-tree-table tbody tr:hover {
  background-color: #f8f9fa;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.btn-link {
  text-decoration: none;
  border: none;
}

.btn-link:hover {
  background-color: transparent;
}
</style>