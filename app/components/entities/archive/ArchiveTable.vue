<template>
  <EntityTable
    entity-name="Archive"
    :data="archives"
    :columns="columns"
    :loading="loading"
    title="File Archive"
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
            :placeholder="t('archives:table.search.placeholder')"
          >
        </div>
        
        <!-- Type Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('type', $event.target.value)"
          >
            <option value="">{{ t('archives:table.filters.type.all') }}</option>
            <option v-for="type in fileTypes" :key="type" :value="type">
              {{ t(`archives:form.fields.type.options.${type}`) }}
            </option>
          </select>
        </div>
        
        <!-- Category Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('category', $event.target.value)"
          >
            <option value="">{{ t('archives:table.filters.category.all') }}</option>
            <option v-for="category in fileCategories" :key="category" :value="category">
              {{ t(`archives:form.fields.category.options.${category}`) }}
            </option>
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

    <template #cell-fileName="{ item, value }">
      <div class="d-flex align-items-center">
        <i :class="getFileIcon(item.contentContentType)" class="me-2"></i>
        <div>
          <div class="fw-medium">{{ value }}</div>
          <small class="text-muted">{{ item.extension }}</small>
        </div>
      </div>
    </template>

    <template #cell-type="{ value }">
      <span 
        class="badge"
        :class="getTypeBadgeClass(value)"
      >
        {{ value || '-' }}
      </span>
    </template>

    <template #cell-category="{ value }">
      <span 
        class="badge bg-secondary"
      >
        {{ value || '-' }}
      </span>
    </template>

    <template #cell-contentContentType="{ value }">
      <small class="text-muted font-monospace">{{ value || '-' }}</small>
    </template>

    <template #cell-folder="{ value }">
      <small class="text-muted">
        <i class="bi bi-folder me-1"></i>
        {{ value || t('archives:table.noFolder') }}
      </small>
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
          class="btn btn-outline-success"
          @click="$emit('download', item)"
          :title="t('archives:table.download')"
          v-if="item.content"
        >
          <i class="bi bi-download"></i>
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
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </template>

    <template #empty-state>
      <div class="text-center py-4">
        <i class="bi bi-archive display-1 text-muted"></i>
        <h5 class="mt-3">{{ t('archives:table.empty.title') }}</h5>
        <p class="text-muted">{{ t('archives:table.empty.message') }}</p>
        <button
          class="btn btn-primary"
          @click="$emit('create')"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('archives:table.empty.createFirst') }}
        </button>
      </div>
    </template>
  </EntityTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type IArchive } from '~/model/archive.model'
import EntityTable from '../shared/EntityTable.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  archives: IArchive[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  view: [archive: IArchive]
  edit: [archive: IArchive]
  delete: [archive: IArchive]
  download: [archive: IArchive]
  create: []
  refresh: []
}>()

// Constants
const fileTypes = ['CAD', 'IMAGE', 'DOCUMENT', 'ARCHIVE', 'OTHER']
const fileCategories = ['DRAWING', 'MODEL', 'ASSEMBLY', 'PART', 'FORMAT', 'SYMBOL', 'TEMPLATE', 'DOCUMENTATION']

// Table Columns
const columns = computed(() => [
  {
    key: 'code',
    label: t('archives:table.columns.code'),
    sortable: true
  },
  {
    key: 'name',
    label: t('archives:table.columns.name'),
    sortable: true
  },
  {
    key: 'fileName',
    label: t('archives:table.columns.fileName'),
    sortable: true
  },
  {
    key: 'type',
    label: t('archives:table.columns.type'),
    sortable: true
  },
  {
    key: 'category',
    label: t('archives:table.columns.category'),
    sortable: true
  },
  {
    key: 'contentContentType',
    label: t('archives:table.columns.mimeType'),
    sortable: false
  },
  {
    key: 'folder',
    label: t('archives:table.columns.folder'),
    sortable: true
  }
])

// Methods
const getFileIcon = (contentType: string): string => {
  if (!contentType) return 'bi bi-file-earmark text-muted'
  
  if (contentType.startsWith('image/')) return 'bi bi-file-earmark-image text-primary'
  if (contentType.startsWith('text/')) return 'bi bi-file-earmark-text text-info'
  if (contentType.includes('pdf')) return 'bi bi-file-earmark-pdf text-danger'
  if (contentType.includes('word')) return 'bi bi-file-earmark-word text-primary'
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'bi bi-file-earmark-excel text-success'
  if (contentType.includes('zip') || contentType.includes('rar')) return 'bi bi-file-earmark-zip text-warning'
  if (contentType.includes('dwg') || contentType.includes('dxf')) return 'bi bi-file-earmark-code text-info'
  
  return 'bi bi-file-earmark text-muted'
}

const getTypeBadgeClass = (type: string): string => {
  switch (type) {
    case 'CAD': return 'bg-primary'
    case 'IMAGE': return 'bg-success'
    case 'DOCUMENT': return 'bg-info'
    case 'ARCHIVE': return 'bg-warning'
    case 'OTHER': return 'bg-secondary'
    default: return 'bg-light text-dark'
  }
}
</script>

<style scoped>
.font-monospace {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}
</style>