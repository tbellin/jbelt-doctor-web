<template>
  <EntityTable
    entity-name="ModelVersion"
    :data="modelVersions"
    :columns="columns"
    :loading="loading"
    title="Model Versions"
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
            :placeholder="t('modelVersions:table.search.placeholder')"
          >
        </div>
        
        <!-- Status Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('status', $event.target.value)"
          >
            <option value="">{{ t('modelVersions:table.filters.status.all') }}</option>
            <option v-for="status in versionStatuses" :key="status" :value="status">
              {{ t(`modelVersions:form.fields.status.options.${status}`) }}
            </option>
          </select>
        </div>
        
        <!-- Current Version Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('isCurrentVersion', $event.target.value)"
          >
            <option value="">{{ t('modelVersions:table.filters.current.all') }}</option>
            <option value="true">{{ t('modelVersions:table.filters.current.yes') }}</option>
            <option value="false">{{ t('modelVersions:table.filters.current.no') }}</option>
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

    <template #cell-versionNumber="{ item, value }">
      <div class="d-flex align-items-center">
        <span class="fw-medium font-monospace">v{{ value }}</span>
        <span v-if="item.isCurrentVersion" class="badge bg-success ms-2 small">
          {{ t('modelVersions:table.current') }}
        </span>
      </div>
    </template>

    <template #cell-status="{ value }">
      <span 
        class="badge"
        :class="getStatusBadgeClass(value)"
      >
        {{ value || '-' }}
      </span>
    </template>

    <template #cell-model="{ item }">
      <div v-if="item.model">
        <div class="fw-medium">{{ item.model.name }}</div>
        <small class="text-muted">
          {{ item.model.code }}
          <span v-if="item.model.type" class="text-muted">({{ item.model.type }})</span>
        </small>
      </div>
      <span v-else class="text-muted">-</span>
    </template>

    <template #cell-createdDate="{ value }">
      <small class="text-muted">
        {{ value ? formatDate(value) : '-' }}
      </small>
    </template>

    <template #cell-isApproved="{ value }">
      <i 
        :class="value ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-muted'"
        :title="value ? t('common:yes') : t('common:no')"
      ></i>
    </template>

    <template #cell-comments="{ value }">
      <div v-if="value" class="text-truncate" style="max-width: 200px;" :title="value">
        {{ value }}
      </div>
      <span v-else class="text-muted">-</span>
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
          v-if="!item.isCurrentVersion"
          class="btn btn-outline-success"
          @click="$emit('makeCurrent', item)"
          :title="t('modelVersions:table.makeCurrent')"
        >
          <i class="bi bi-arrow-up-circle"></i>
        </button>
        <button
          class="btn btn-outline-info"
          @click="$emit('copy', item)"
          :title="t('modelVersions:table.copy')"
        >
          <i class="bi bi-copy"></i>
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
          :disabled="item.isCurrentVersion"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </template>

    <template #empty-state>
      <div class="text-center py-4">
        <i class="bi bi-clock-history display-1 text-muted"></i>
        <h5 class="mt-3">{{ t('modelVersions:table.empty.title') }}</h5>
        <p class="text-muted">{{ t('modelVersions:table.empty.message') }}</p>
        <button
          class="btn btn-primary"
          @click="$emit('create')"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('modelVersions:table.empty.createFirst') }}
        </button>
      </div>
    </template>

    <!-- Custom row styling -->
    <template #row-class="{ item }">
      {{ item.isCurrentVersion ? 'table-success' : '' }}
    </template>
  </EntityTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type IModelVersion } from '~/model/model-version.model'
import { VersionStatus } from '~/model/enumerations/version-status.model'
import EntityTable from '../shared/EntityTable.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  modelVersions: IModelVersion[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  view: [modelVersion: IModelVersion]
  edit: [modelVersion: IModelVersion]
  delete: [modelVersion: IModelVersion]
  copy: [modelVersion: IModelVersion]
  makeCurrent: [modelVersion: IModelVersion]
  create: []
  refresh: []
}>()

// Constants
const versionStatuses = computed(() => Object.values(VersionStatus))

// Table Columns
const columns = computed(() => [
  {
    key: 'versionNumber',
    label: t('modelVersions:table.columns.version'),
    sortable: true
  },
  {
    key: 'name',
    label: t('modelVersions:table.columns.name'),
    sortable: true
  },
  {
    key: 'model',
    label: t('modelVersions:table.columns.model'),
    sortable: false
  },
  {
    key: 'status',
    label: t('modelVersions:table.columns.status'),
    sortable: true
  },
  {
    key: 'createdDate',
    label: t('modelVersions:table.columns.created'),
    sortable: true
  },
  {
    key: 'isApproved',
    label: t('modelVersions:table.columns.approved'),
    sortable: true
  },
  {
    key: 'comments',
    label: t('modelVersions:table.columns.comments'),
    sortable: false
  }
])

// Methods
const getStatusBadgeClass = (status: VersionStatus): string => {
  switch (status) {
    case VersionStatus.DRAFT: return 'bg-secondary'
    case VersionStatus.REVIEW: return 'bg-warning'
    case VersionStatus.APPROVED: return 'bg-success'
    case VersionStatus.REJECTED: return 'bg-danger'
    case VersionStatus.OBSOLETE: return 'bg-dark'
    default: return 'bg-light text-dark'
  }
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.font-monospace {
  font-family: 'Courier New', monospace;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.small {
  font-size: 0.75rem;
}

/* Current version row highlighting */
:deep(.table-success) {
  background-color: rgba(40, 167, 69, 0.1) !important;
}

:deep(.table-success:hover) {
  background-color: rgba(40, 167, 69, 0.15) !important;
}
</style>