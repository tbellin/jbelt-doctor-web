<template>
  <EntityTable
    entity-name="Author"
    :data="authors"
    :columns="columns"
    :loading="loading"
    title="Authors & Team Members"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @refresh="$emit('refresh')"
  >
    <template #filters="{ search, updateSearch, updateFilter, clearFilters }">
      <div class="row g-3">
        <!-- Search -->
        <div class="col-md-3">
          <input
            :value="search"
            @input="updateSearch($event.target.value)"
            type="text"
            class="form-control"
            :placeholder="t('authors:table.search.placeholder')"
          >
        </div>
        
        <!-- Department Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('department', $event.target.value)"
          >
            <option value="">{{ t('authors:table.filters.department.all') }}</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ t(`authors:form.fields.department.options.${dept}`) }}
            </option>
          </select>
        </div>
        
        <!-- Status Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('isActive', $event.target.value)"
          >
            <option value="">{{ t('authors:table.filters.status.all') }}</option>
            <option value="true">{{ t('authors:table.filters.status.active') }}</option>
            <option value="false">{{ t('authors:table.filters.status.inactive') }}</option>
          </select>
        </div>
        
        <!-- Clear Filters -->
        <div class="col-md-3">
          <button
            class="btn btn-outline-secondary w-100"
            @click="clearFilters"
          >
            {{ t('common:clear_filters') }}
          </button>
        </div>
      </div>
    </template>

    <template #cell-name="{ item }">
      <div class="d-flex align-items-center">
        <div class="author-avatar me-2">
          <div class="avatar-circle">
            {{ getInitials(item.firstName, item.lastName) }}
          </div>
        </div>
        <div>
          <div class="fw-medium">{{ getFullName(item.firstName, item.lastName) }}</div>
          <small class="text-muted">{{ item.email }}</small>
        </div>
      </div>
    </template>

    <template #cell-role="{ item }">
      <div>
        <div class="fw-medium">{{ item.role || '-' }}</div>
        <small v-if="item.department" class="text-muted">
          {{ t(`authors:form.fields.department.options.${item.department}`) }}
        </small>
      </div>
    </template>

    <template #cell-contact="{ item }">
      <div class="contact-info">
        <small v-if="item.phone" class="d-block text-muted">
          <i class="bi bi-telephone me-1"></i>{{ item.phone }}
        </small>
        <small v-if="item.location" class="d-block text-muted">
          <i class="bi bi-geo-alt me-1"></i>{{ item.location }}
        </small>
        <small v-if="item.login" class="d-block text-muted">
          <i class="bi bi-person-badge me-1"></i>{{ item.login }}
        </small>
      </div>
    </template>

    <template #cell-teams="{ item }">
      <div v-if="item.teams && item.teams.length > 0" class="teams-container">
        <span
          v-for="team in item.teams.slice(0, 2)"
          :key="team.id"
          class="badge bg-info me-1 mb-1"
        >
          {{ team.name }}
        </span>
        <span 
          v-if="item.teams.length > 2" 
          class="badge bg-secondary"
          :title="item.teams.slice(2).map(t => t.name).join(', ')"
        >
          +{{ item.teams.length - 2 }}
        </span>
      </div>
      <span v-else class="text-muted">-</span>
    </template>

    <template #cell-permissions="{ item }">
      <div class="permissions-summary">
        <div class="permission-badges">
          <span 
            v-if="item.permissions?.canCreateModels" 
            class="badge bg-success me-1"
            :title="t('authors:form.permissions.canCreateModels')"
          >
            <i class="bi bi-plus-circle"></i>
          </span>
          <span 
            v-if="item.permissions?.canEditModels" 
            class="badge bg-primary me-1"
            :title="t('authors:form.permissions.canEditModels')"
          >
            <i class="bi bi-pencil"></i>
          </span>
          <span 
            v-if="item.permissions?.canDeleteModels" 
            class="badge bg-danger me-1"
            :title="t('authors:form.permissions.canDeleteModels')"
          >
            <i class="bi bi-trash"></i>
          </span>
          <span 
            v-if="item.permissions?.canApproveChanges" 
            class="badge bg-warning me-1"
            :title="t('authors:form.permissions.canApproveChanges')"
          >
            <i class="bi bi-check-circle"></i>
          </span>
          <span 
            v-if="item.permissions?.canManageVersions" 
            class="badge bg-info me-1"
            :title="t('authors:form.permissions.canManageVersions')"
          >
            <i class="bi bi-clock-history"></i>
          </span>
        </div>
        <small v-if="!hasAnyPermissions(item)" class="text-muted">{{ t('authors:table.noPermissions') }}</small>
      </div>
    </template>

    <template #cell-isActive="{ value, item }">
      <div class="d-flex align-items-center">
        <i 
          :class="value ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-muted'"
          class="me-2"
        ></i>
        <div>
          <span :class="value ? 'text-success' : 'text-muted'">{{ value ? t('common:active') : t('common:inactive') }}</span>
          <small v-if="item.canReceiveNotifications" class="d-block text-info">
            <i class="bi bi-bell"></i> {{ t('authors:table.notifications') }}
          </small>
        </div>
      </div>
    </template>

    <template #actions="{ item }">
      <div class="btn-group btn-group-sm">
        <button
          class="btn btn-outline-primary"
          @click="$emit('view', item)"
          :title="t('common:view')"
        >
          <i class="bi bi-eye"></i>
        </button>
        <button
          class="btn btn-outline-info"
          @click="$emit('sendMessage', item)"
          :title="t('authors:table.sendMessage')"
          :disabled="!item.isActive || !item.canReceiveNotifications"
        >
          <i class="bi bi-envelope"></i>
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="$emit('edit', item)"
          :title="t('common:edit')"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          v-if="item.isActive"
          class="btn btn-outline-warning"
          @click="$emit('deactivate', item)"
          :title="t('authors:table.deactivate')"
        >
          <i class="bi bi-pause-circle"></i>
        </button>
        <button
          v-else
          class="btn btn-outline-success"
          @click="$emit('activate', item)"
          :title="t('authors:table.activate')"
        >
          <i class="bi bi-play-circle"></i>
        </button>
        <button
          class="btn btn-outline-danger"
          @click="$emit('delete', item)"
          :title="t('common:delete')"
          :disabled="item.isActive"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </template>

    <template #empty-state>
      <div class="text-center py-4">
        <i class="bi bi-people display-1 text-muted"></i>
        <h5 class="mt-3">{{ t('authors:table.empty.title') }}</h5>
        <p class="text-muted">{{ t('authors:table.empty.message') }}</p>
        <div class="btn-group">
          <button
            class="btn btn-primary"
            @click="$emit('create')"
          >
            <i class="bi bi-person-plus me-2"></i>
            {{ t('authors:table.empty.createFirst') }}
          </button>
          <button
            class="btn btn-outline-primary"
            @click="$emit('invite')"
          >
            <i class="bi bi-envelope-plus me-2"></i>
            {{ t('authors:table.empty.invite') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Summary Cards -->
    <template #header-summary>
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-people fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ totalAuthors }}</div>
                  <small>{{ t('authors:summary.total') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-person-check fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ activeAuthors }}</div>
                  <small>{{ t('authors:summary.active') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-diagram-3 fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ uniqueTeams }}</div>
                  <small>{{ t('authors:summary.teams') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-dark">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-building fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ uniqueDepartments }}</div>
                  <small>{{ t('authors:summary.departments') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </EntityTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type IAuthor } from '~/model/author.model'
import EntityTable from '../shared/EntityTable.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  authors: IAuthor[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  view: [author: IAuthor]
  edit: [author: IAuthor]
  delete: [author: IAuthor]
  activate: [author: IAuthor]
  deactivate: [author: IAuthor]
  sendMessage: [author: IAuthor]
  create: []
  invite: []
  refresh: []
}>()

// Constants
const departments = [
  'ENGINEERING',
  'DESIGN',
  'QUALITY',
  'MANUFACTURING',
  'RESEARCH',
  'MANAGEMENT',
  'CONSULTING',
  'EXTERNAL'
]

// Computed
const totalAuthors = computed(() => props.authors.length)
const activeAuthors = computed(() => props.authors.filter(a => a.isActive).length)
const uniqueTeams = computed(() => {
  const teams = new Set()
  props.authors.forEach(author => {
    author.teams?.forEach(team => teams.add(team.id))
  })
  return teams.size
})
const uniqueDepartments = computed(() => {
  const departments = new Set(props.authors.map(a => a.department).filter(Boolean))
  return departments.size
})

// Table Columns
const columns = computed(() => [
  {
    key: 'name',
    label: t('authors:table.columns.name'),
    sortable: true
  },
  {
    key: 'role',
    label: t('authors:table.columns.role'),
    sortable: true
  },
  {
    key: 'contact',
    label: t('authors:table.columns.contact'),
    sortable: false
  },
  {
    key: 'teams',
    label: t('authors:table.columns.teams'),
    sortable: false
  },
  {
    key: 'permissions',
    label: t('authors:table.columns.permissions'),
    sortable: false
  },
  {
    key: 'isActive',
    label: t('authors:table.columns.status'),
    sortable: true
  }
])

// Methods
const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || ''
  const last = lastName?.charAt(0).toUpperCase() || ''
  return first + last || '?'
}

const getFullName = (firstName?: string, lastName?: string): string => {
  return [firstName, lastName].filter(Boolean).join(' ') || t('authors:table.noName')
}

const hasAnyPermissions = (author: IAuthor): boolean => {
  const perms = author.permissions
  return perms ? Object.values(perms).some(Boolean) : false
}
</script>

<style scoped>
.author-avatar {
  width: 40px;
  text-align: center;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.contact-info {
  min-width: 150px;
}

.teams-container {
  max-width: 200px;
}

.permission-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.permission-badges .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.4rem;
}

.permissions-summary {
  min-width: 120px;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.4rem;
}

.card {
  border: none;
  border-radius: 0.5rem;
}
</style>