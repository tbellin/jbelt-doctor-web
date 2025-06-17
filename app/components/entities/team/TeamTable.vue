<template>
  <EntityTable
    entity-name="Team"
    :data="teams"
    :columns="columns"
    :loading="loading"
    title="Teams & Departments"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @refresh="$emit('refresh')"
  >
    <template #filters="{ search, updateSearch, updateFilter, clearFilters }">
      <div class="row g-3">
        <!-- Search -->
        <div class="col-md-4">
          <input
            :value="search"
            @input="updateSearch($event.target.value)"
            type="text"
            class="form-control"
            :placeholder="t('teams:table.search.placeholder')"
          >
        </div>
        
        <!-- Department Filter -->
        <div class="col-md-4">
          <select
            class="form-select"
            @change="updateFilter('department', $event.target.value)"
          >
            <option value="">{{ t('teams:table.filters.department.all') }}</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ t(`teams:form.fields.department.options.${dept}`) }}
            </option>
          </select>
        </div>
        
        <!-- Status Filter -->
        <div class="col-md-2">
          <select
            class="form-select"
            @change="updateFilter('isActive', $event.target.value)"
          >
            <option value="">{{ t('teams:table.filters.status.all') }}</option>
            <option value="true">{{ t('teams:table.filters.status.active') }}</option>
            <option value="false">{{ t('teams:table.filters.status.inactive') }}</option>
          </select>
        </div>
        
        <!-- Clear Filters -->
        <div class="col-md-2">
          <button
            class="btn btn-outline-secondary w-100"
            @click="clearFilters"
          >
            {{ t('common:clear_filters') }}
          </button>
        </div>
      </div>
    </template>

    <template #cell-name="{ item, value }">
      <div class="d-flex align-items-center">
        <div class="team-icon me-2">
          <i :class="getDepartmentIcon(item.department)" class="fs-4"></i>
        </div>
        <div>
          <div class="fw-medium">{{ value }}</div>
          <small v-if="item.description" class="text-muted text-truncate d-block" style="max-width: 200px;">
            {{ item.description }}
          </small>
        </div>
      </div>
    </template>

    <template #cell-department="{ value }">
      <span 
        class="badge"
        :class="getDepartmentBadgeClass(value)"
      >
        {{ value ? t(`teams:form.fields.department.options.${value}`) : '-' }}
      </span>
    </template>

    <template #cell-teamLead="{ item }">
      <div v-if="item.teamLead" class="d-flex align-items-center">
        <div class="lead-avatar me-2">
          <div class="avatar-circle-xs">
            {{ getInitials(item.teamLead.firstName, item.teamLead.lastName) }}
          </div>
        </div>
        <div>
          <div class="fw-medium">{{ getFullName(item.teamLead.firstName, item.teamLead.lastName) }}</div>
          <small class="text-muted">{{ item.teamLead.role || t('teams:table.noRole') }}</small>
        </div>
      </div>
      <span v-else class="text-muted">{{ t('teams:table.noLeader') }}</span>
    </template>

    <template #cell-members="{ item }">
      <div class="members-display">
        <div class="d-flex align-items-center">
          <div class="member-avatars me-2">
            <div
              v-for="(member, index) in item.members?.slice(0, 3)"
              :key="member.id"
              class="avatar-circle-xs overlap"
              :style="{ zIndex: 10 - index, marginLeft: index > 0 ? '-8px' : '0' }"
              :title="getFullName(member.firstName, member.lastName)"
            >
              {{ getInitials(member.firstName, member.lastName) }}
            </div>
            <div 
              v-if="(item.members?.length || 0) > 3"
              class="avatar-circle-xs overlap more-indicator"
              :style="{ zIndex: 7, marginLeft: '-8px' }"
              :title="t('teams:table.moreMembers', { count: (item.members?.length || 0) - 3 })"
            >
              +{{ (item.members?.length || 0) - 3 }}
            </div>
          </div>
          <div>
            <span class="badge bg-info">{{ item.members?.length || 0 }}</span>
            <small class="text-muted d-block">{{ t('teams:table.members') }}</small>
          </div>
        </div>
      </div>
    </template>

    <template #cell-capabilities="{ item }">
      <div class="capabilities-display">
        <div class="capability-icons">
          <span 
            v-if="item.capabilities?.canDesign" 
            class="badge bg-primary me-1 mb-1"
            :title="t('teams:form.capabilities.canDesign')"
          >
            <i class="bi bi-palette"></i>
          </span>
          <span 
            v-if="item.capabilities?.canAnalyze" 
            class="badge bg-success me-1 mb-1"
            :title="t('teams:form.capabilities.canAnalyze')"
          >
            <i class="bi bi-graph-up"></i>
          </span>
          <span 
            v-if="item.capabilities?.canManufacture" 
            class="badge bg-warning me-1 mb-1"
            :title="t('teams:form.capabilities.canManufacture')"
          >
            <i class="bi bi-tools"></i>
          </span>
          <span 
            v-if="item.capabilities?.canTest" 
            class="badge bg-info me-1 mb-1"
            :title="t('teams:form.capabilities.canTest')"
          >
            <i class="bi bi-check-square"></i>
          </span>
          <span 
            v-if="item.capabilities?.canDocument" 
            class="badge bg-secondary me-1 mb-1"
            :title="t('teams:form.capabilities.canDocument')"
          >
            <i class="bi bi-file-earmark-text"></i>
          </span>
          <span 
            v-if="item.capabilities?.canManageProjects" 
            class="badge bg-dark me-1 mb-1"
            :title="t('teams:form.capabilities.canManageProjects')"
          >
            <i class="bi bi-kanban"></i>
          </span>
        </div>
        <small v-if="!hasAnyCapabilities(item)" class="text-muted">{{ t('teams:table.noCapabilities') }}</small>
      </div>
    </template>

    <template #cell-contact="{ item }">
      <div v-if="item.contactEmail" class="contact-info">
        <a :href="`mailto:${item.contactEmail}`" class="text-decoration-none">
          <i class="bi bi-envelope me-1"></i>
          <small>{{ item.contactEmail }}</small>
        </a>
      </div>
      <span v-else class="text-muted">-</span>
    </template>

    <template #cell-isActive="{ value }">
      <div class="d-flex align-items-center">
        <i 
          :class="value ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-muted'"
          class="me-2"
        ></i>
        <span :class="value ? 'text-success' : 'text-muted'">
          {{ value ? t('common:active') : t('common:inactive') }}
        </span>
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
          @click="$emit('viewMembers', item)"
          :title="t('teams:table.viewMembers')"
        >
          <i class="bi bi-people"></i>
        </button>
        <button
          class="btn btn-outline-success"
          @click="$emit('sendMessage', item)"
          :title="t('teams:table.sendMessage')"
          :disabled="!item.contactEmail"
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
          class="btn btn-outline-danger"
          @click="$emit('delete', item)"
          :title="t('common:delete')"
          :disabled="(item.members?.length || 0) > 0"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </template>

    <template #empty-state>
      <div class="text-center py-4">
        <i class="bi bi-diagram-3 display-1 text-muted"></i>
        <h5 class="mt-3">{{ t('teams:table.empty.title') }}</h5>
        <p class="text-muted">{{ t('teams:table.empty.message') }}</p>
        <button
          class="btn btn-primary"
          @click="$emit('create')"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('teams:table.empty.createFirst') }}
        </button>
      </div>
    </template>

    <!-- Department Summary Cards -->
    <template #header-summary>
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-diagram-3 fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ totalTeams }}</div>
                  <small>{{ t('teams:summary.total') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-check-circle fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ activeTeams }}</div>
                  <small>{{ t('teams:summary.active') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-people fs-2 me-3"></i>
                <div>
                  <div class="fs-4 fw-bold">{{ totalMembers }}</div>
                  <small>{{ t('teams:summary.members') }}</small>
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
                  <small>{{ t('teams:summary.departments') }}</small>
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
import { type ITeam } from '~/model/team.model'
import EntityTable from '../shared/EntityTable.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  teams: ITeam[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  view: [team: ITeam]
  edit: [team: ITeam]
  delete: [team: ITeam]
  viewMembers: [team: ITeam]
  sendMessage: [team: ITeam]
  create: []
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
const totalTeams = computed(() => props.teams.length)
const activeTeams = computed(() => props.teams.filter(t => t.isActive).length)
const totalMembers = computed(() => {
  return props.teams.reduce((sum, team) => sum + (team.members?.length || 0), 0)
})
const uniqueDepartments = computed(() => {
  const departments = new Set(props.teams.map(t => t.department).filter(Boolean))
  return departments.size
})

// Table Columns
const columns = computed(() => [
  {
    key: 'name',
    label: t('teams:table.columns.name'),
    sortable: true
  },
  {
    key: 'department',
    label: t('teams:table.columns.department'),
    sortable: true
  },
  {
    key: 'teamLead',
    label: t('teams:table.columns.leader'),
    sortable: false
  },
  {
    key: 'members',
    label: t('teams:table.columns.members'),
    sortable: false
  },
  {
    key: 'capabilities',
    label: t('teams:table.columns.capabilities'),
    sortable: false
  },
  {
    key: 'contact',
    label: t('teams:table.columns.contact'),
    sortable: false
  },
  {
    key: 'isActive',
    label: t('teams:table.columns.status'),
    sortable: true
  }
])

// Methods
const getDepartmentIcon = (department?: string): string => {
  switch (department) {
    case 'ENGINEERING': return 'bi bi-gear text-primary'
    case 'DESIGN': return 'bi bi-palette text-success'
    case 'QUALITY': return 'bi bi-check-circle text-warning'
    case 'MANUFACTURING': return 'bi bi-tools text-info'
    case 'RESEARCH': return 'bi bi-lightbulb text-secondary'
    case 'MANAGEMENT': return 'bi bi-briefcase text-dark'
    default: return 'bi bi-people text-muted'
  }
}

const getDepartmentBadgeClass = (department?: string): string => {
  switch (department) {
    case 'ENGINEERING': return 'bg-primary'
    case 'DESIGN': return 'bg-success'
    case 'QUALITY': return 'bg-warning'
    case 'MANUFACTURING': return 'bg-info'
    case 'RESEARCH': return 'bg-secondary'
    case 'MANAGEMENT': return 'bg-dark'
    default: return 'bg-light text-dark'
  }
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || ''
  const last = lastName?.charAt(0).toUpperCase() || ''
  return first + last || '?'
}

const getFullName = (firstName?: string, lastName?: string): string => {
  return [firstName, lastName].filter(Boolean).join(' ') || t('teams:table.noName')
}

const hasAnyCapabilities = (team: ITeam): boolean => {
  const caps = team.capabilities
  return caps ? Object.values(caps).some(Boolean) : false
}
</script>

<style scoped>
.team-icon {
  width: 50px;
  text-align: center;
}

.lead-avatar {
  width: 35px;
  text-align: center;
}

.avatar-circle-xs {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
  border: 2px solid white;
}

.member-avatars {
  display: flex;
  align-items: center;
}

.overlap {
  position: relative;
}

.more-indicator {
  background: #6c757d !important;
  font-size: 0.6rem;
}

.capability-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.capability-icons .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.4rem;
}

.capabilities-display {
  min-width: 120px;
}

.members-display {
  min-width: 100px;
}

.contact-info a {
  color: inherit;
}

.contact-info a:hover {
  color: var(--bs-primary) !important;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card {
  border: none;
  border-radius: 0.5rem;
}
</style>