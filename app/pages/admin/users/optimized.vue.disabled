<!--
  Admin Users Page - Optimized Version
  
  Enhanced features:
  - useApiOptimized integration
  - Improved error handling with global system
  - Enhanced loading states
  - Better mobile responsiveness
  - Bulk operations support
  - Real-time validation
  
  @version 2.0.0 - Optimized Architecture
-->
<template>
  <div class="admin-users-optimized">
    <!-- Enhanced Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div class="header-info">
          <h1 class="h3 mb-1">
            <i class="bi bi-people me-2 text-primary"></i>
            {{ t('admin:users.title') }}
          </h1>
          <p class="text-muted mb-0">
            {{ t('admin:users.subtitle') }}
            <span v-if="userStats.total" class="badge bg-secondary ms-2">
              {{ userStats.total }} users
            </span>
          </p>
        </div>
        
        <div class="header-actions">
          <div class="btn-group">
            <button 
              class="btn btn-outline-secondary"
              @click="handleRefresh"
              :disabled="isLoading"
              :title="t('common:refresh')"
            >
              <i class="bi" :class="isLoading ? 'bi-arrow-clockwise rotating' : 'bi-arrow-clockwise'"></i>
              <span class="d-none d-md-inline ms-1">{{ t('common:refresh') }}</span>
            </button>
            
            <button 
              class="btn btn-outline-info"
              @click="handleExport"
              :disabled="isLoading"
              :title="t('admin:users.actions.export')"
            >
              <i class="bi bi-download"></i>
              <span class="d-none d-md-inline ms-1">{{ t('admin:users.actions.export') }}</span>
            </button>
            
            <button 
              class="btn btn-success"
              @click="showCreateUserModal = true"
              :disabled="isLoading"
            >
              <i class="bi bi-person-plus me-1"></i>
              {{ t('admin:users.actions.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Statistics -->
    <div class="stats-section mb-4">
      <div class="row g-3">
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.total }}</div>
              <div class="stat-label">{{ t('admin:users.stats.total') }}</div>
            </div>
            <div class="stat-icon bg-primary">
              <i class="bi bi-people"></i>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.active }}</div>
              <div class="stat-label">{{ t('admin:users.stats.active') }}</div>
            </div>
            <div class="stat-icon bg-success">
              <i class="bi bi-person-check"></i>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.admins }}</div>
              <div class="stat-label">{{ t('admin:users.stats.admins') }}</div>
            </div>
            <div class="stat-icon bg-warning">
              <i class="bi bi-shield-check"></i>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ selectedUsers.length }}</div>
              <div class="stat-label">{{ t('admin:users.stats.selected') }}</div>
            </div>
            <div class="stat-icon bg-info">
              <i class="bi bi-check-square"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  :placeholder="t('admin:users.search.placeholder')"
                  @input="performSearch"
                />
                <button 
                  v-if="searchQuery"
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="clearSearch"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            
            <div class="col-md-3">
              <select 
                v-model="statusFilter"
                class="form-select"
                @change="applyFilters"
              >
                <option value="">{{ t('admin:users.filters.allStatuses') }}</option>
                <option value="active">{{ t('admin:users.filters.activeOnly') }}</option>
                <option value="inactive">{{ t('admin:users.filters.inactiveOnly') }}</option>
              </select>
            </div>
            
            <div class="col-md-3">
              <select 
                v-model="roleFilter"
                class="form-select"
                @change="applyFilters"
              >
                <option value="">{{ t('admin:users.filters.allRoles') }}</option>
                <option value="admin">{{ t('admin:users.filters.adminsOnly') }}</option>
                <option value="user">{{ t('admin:users.filters.usersOnly') }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="bulk-actions-section mb-3" v-if="selectedUsers.length">
      <div class="alert alert-info d-flex justify-content-between align-items-center">
        <span>
          <i class="bi bi-check-square me-2"></i>
          {{ t('admin:users.bulk.selected', { count: selectedUsers.length }) }}
        </span>
        <div class="btn-group btn-group-sm">
          <button 
            class="btn btn-outline-primary"
            @click="handleBulkActivate"
            :disabled="isBulkOperating"
          >
            <i class="bi bi-person-check me-1"></i>
            {{ t('admin:users.bulk.activate') }}
          </button>
          <button 
            class="btn btn-outline-warning"
            @click="handleBulkDeactivate"
            :disabled="isBulkOperating"
          >
            <i class="bi bi-person-dash me-1"></i>
            {{ t('admin:users.bulk.deactivate') }}
          </button>
          <button 
            class="btn btn-outline-danger"
            @click="handleBulkDelete"
            :disabled="isBulkOperating"
          >
            <i class="bi bi-trash me-1"></i>
            {{ t('admin:users.bulk.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Users Table -->
    <div class="users-table-section">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            {{ t('admin:users.table.title') }}
            <span class="badge bg-secondary ms-2">{{ filteredUsers.length }}</span>
          </h5>
          <div class="table-controls">
            <div class="btn-group btn-group-sm">
              <button 
                class="btn btn-outline-secondary"
                @click="selectAllVisible"
                :disabled="isLoading"
              >
                {{ t('admin:users.table.selectAll') }}
              </button>
              <button 
                class="btn btn-outline-secondary"
                @click="clearSelection"
                :disabled="!selectedUsers.length"
              >
                {{ t('admin:users.table.clearSelection') }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0">
          <!-- Loading State -->
          <div v-if="isLoading && !users.length" class="text-center py-5">
            <div class="spinner-border text-primary mb-3"></div>
            <p class="text-muted">{{ t('admin:users.loading') }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!filteredUsers.length && !isLoading" class="text-center py-5">
            <i class="bi bi-people display-1 text-muted mb-3"></i>
            <h4>{{ t('admin:users.empty.title') }}</h4>
            <p class="text-muted">{{ t('admin:users.empty.message') }}</p>
            <button class="btn btn-primary" @click="showCreateUserModal = true">
              <i class="bi bi-person-plus me-2"></i>
              {{ t('admin:users.actions.createFirst') }}
            </button>
          </div>

          <!-- Users Table -->
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 40px;">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                      />
                    </div>
                  </th>
                  <th>{{ t('admin:users.table.username') }}</th>
                  <th>{{ t('admin:users.table.name') }}</th>
                  <th>{{ t('admin:users.table.email') }}</th>
                  <th>{{ t('admin:users.table.status') }}</th>
                  <th>{{ t('admin:users.table.roles') }}</th>
                  <th style="width: 140px;">{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in paginatedUsers"
                  :key="user.id"
                  :class="{ 'table-warning': user.login === 'admin' }"
                >
                  <td>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :value="user"
                        :checked="isUserSelected(user)"
                        @change="toggleUserSelection(user)"
                        :disabled="user.login === 'admin'"
                      />
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-2">
                        <i class="bi bi-person-circle text-muted"></i>
                      </div>
                      <div>
                        <div class="fw-semibold">{{ user.login }}</div>
                        <small class="text-muted">ID: {{ user.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>
                    <a :href="`mailto:${user.email}`" class="text-decoration-none">
                      {{ user.email }}
                    </a>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="user.activated ? 'bg-success' : 'bg-danger'"
                    >
                      {{ user.activated ? t('common:active') : t('common:inactive') }}
                    </span>
                  </td>
                  <td>
                    <div class="role-badges">
                      <span
                        v-for="role in user.authorities"
                        :key="role"
                        class="badge bg-info me-1"
                      >
                        {{ role.replace('ROLE_', '') }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="editUser(user)"
                        :disabled="user.login === 'admin'"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="confirmDeleteUser(user)"
                        :disabled="user.login === 'admin'"
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

          <!-- Pagination -->
          <div class="card-footer" v-if="totalPages > 1">
            <nav aria-label="Users pagination">
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="changePage(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced User Form Modal -->
    <UserFormModalOptimized
      :show="showCreateUserModal"
      :editing-user="editingUser"
      :form-data="userFormData"
      :validation-errors="userValidationErrors"
      :saving="isSaving"
      @close="closeUserModal"
      @save="saveUser"
      @validate="validateUserForm"
    />

    <!-- Debug Panel -->
    <div v-if="isDebugMode" class="debug-panel mt-4">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">
            <i class="bi bi-bug me-2"></i>
            Debug Information
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>API Metrics</h6>
              <pre class="small">{{ JSON.stringify(apiMetrics, null, 2) }}</pre>
            </div>
            <div class="col-md-6">
              <h6>Cache Stats</h6>
              <pre class="small">{{ JSON.stringify(cacheStatus, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useApiOptimized } from '~/composables/useApiOptimized'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoadingState } from '~/composables/useLoadingState'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useDebug } from '~/composables/useDebug'

// Component imports
import UserFormModalOptimized from '~/components/Admin/UserFormModalOptimized.vue'

interface User {
  id?: number
  login: string
  firstName: string
  lastName: string
  email: string
  activated: boolean
  langKey: string
  authorities: string[]
}

// Page configuration
definePageMeta({
  layout: 'dashboard',
  middleware: ['admin', 'i18n']
})

// Composables
const api = useApiOptimized()
const { handleError, showSuccessToast } = useErrorHandler()
const { isLoadingContext } = useLoadingState()
const { t, loadNamespace } = useI18n()
const { isAuthenticated, user: currentUser } = useAuth()
const { isDebugMode } = useDebug()

// State
const users = ref<User[]>([])
const filteredUsers = ref<User[]>([])
const selectedUsers = ref<User[]>([])

// Search and filtering
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Modal state
const showCreateUserModal = ref(false)
const editingUser = ref<User | null>(null)
const userFormData = ref({
  login: '',
  firstName: '',
  lastName: '',
  email: '',
  activated: true,
  langKey: 'en',
  authorities: ['ROLE_USER'] as string[]
})
const userValidationErrors = ref<Record<string, string>>({})

// Computed
const isLoading = computed(() => isLoadingContext('admin-users').value)
const isSaving = computed(() => isLoadingContext('user-save').value)
const isBulkOperating = computed(() => isLoadingContext('bulk-operation').value)

const userStats = computed(() => ({
  total: users.value.length,
  active: users.value.filter(u => u.activated).length,
  admins: users.value.filter(u => u.authorities.includes('ROLE_ADMIN')).length
}))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredUsers.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const isAllSelected = computed(() => {
  return paginatedUsers.value.length > 0 && 
         paginatedUsers.value.every(user => isUserSelected(user))
})

const apiMetrics = computed(() => api.metrics.value)
const cacheStatus = computed(() => api.cacheManager.stats.value)

// Methods
const loadUsers = async (force = false): Promise<void> => {
  try {
    if (force) {
      api.clearCache('/api/users')
    }
    
    const response = await api.users.getAll()
    if (response.success) {
      users.value = response.data || []
      applyFilters()
    }
  } catch (error: any) {
    handleError(error, 'users-loading', {
      onRetry: () => loadUsers(true)
    })
  }
}

const applyFilters = (): void => {
  let filtered = [...users.value]
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.login.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }
  
  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(user =>
      statusFilter.value === 'active' ? user.activated : !user.activated
    )
  }
  
  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user =>
      roleFilter.value === 'admin' 
        ? user.authorities.includes('ROLE_ADMIN')
        : !user.authorities.includes('ROLE_ADMIN')
    )
  }
  
  filteredUsers.value = filtered
  currentPage.value = 1
}

const performSearch = (): void => {
  // Debounced search
  setTimeout(() => {
    applyFilters()
  }, 300)
}

const clearSearch = (): void => {
  searchQuery.value = ''
  applyFilters()
}

// Selection methods
const isUserSelected = (user: User): boolean => {
  return selectedUsers.value.some(u => u.id === user.id)
}

const toggleUserSelection = (user: User): void => {
  const index = selectedUsers.value.findIndex(u => u.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(user)
  }
}

const selectAllVisible = (): void => {
  paginatedUsers.value.forEach(user => {
    if (!isUserSelected(user) && user.login !== 'admin') {
      selectedUsers.value.push(user)
    }
  })
}

const clearSelection = (): void => {
  selectedUsers.value = []
}

const toggleSelectAll = (): void => {
  if (isAllSelected.value) {
    // Deselect all visible
    paginatedUsers.value.forEach(user => {
      const index = selectedUsers.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        selectedUsers.value.splice(index, 1)
      }
    })
  } else {
    selectAllVisible()
  }
}

// CRUD operations
const saveUser = async (): Promise<void> => {
  if (!validateUserForm()) return
  
  try {
    let response
    if (editingUser.value?.id) {
      response = await api.users.update(editingUser.value.id, userFormData.value)
    } else {
      response = await api.users.create(userFormData.value)
    }
    
    if (response.success) {
      closeUserModal()
      await loadUsers(true)
    }
  } catch (error: any) {
    handleError(error, 'user-save')
  }
}

const validateUserForm = (): boolean => {
  userValidationErrors.value = {}
  
  if (!userFormData.value.login.trim()) {
    userValidationErrors.value.login = t('admin:users.validation.loginRequired')
  }
  
  if (!userFormData.value.email.trim()) {
    userValidationErrors.value.email = t('admin:users.validation.emailRequired')
  }
  
  return Object.keys(userValidationErrors.value).length === 0
}

// Event handlers
const handleRefresh = async (): Promise<void> => {
  await loadUsers(true)
}

const handleExport = async (): Promise<void> => {
  try {
    const exportData = filteredUsers.value.map(user => ({
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      activated: user.activated,
      authorities: user.authorities
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showSuccessToast('Users exported successfully')
  } catch (error: any) {
    handleError(error, 'export')
  }
}

// Modal management
const closeUserModal = (): void => {
  showCreateUserModal.value = false
  editingUser.value = null
  resetUserForm()
}

const resetUserForm = (): void => {
  userFormData.value = {
    login: '',
    firstName: '',
    lastName: '',
    email: '',
    activated: true,
    langKey: 'en',
    authorities: ['ROLE_USER']
  }
  userValidationErrors.value = {}
}

// Pagination
const changePage = (page: number): void => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Lifecycle
onMounted(async () => {
  await loadNamespace('admin')
  await loadUsers()
})

// Watchers
watch([statusFilter, roleFilter], () => {
  applyFilters()
})
</script>

<style scoped>
.admin-users-optimized {
  padding: 1.5rem;
}

.page-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.user-avatar {
  font-size: 1.5rem;
}

.role-badges .badge {
  font-size: 0.75rem;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .admin-users-optimized {
    padding: 1rem;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}
</style>