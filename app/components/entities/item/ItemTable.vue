<template>
  <EntityTable
    entity-name="Item"
    :data="items"
    :columns="columns"
    :loading="loading"
    title="Items & Components"
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
            :placeholder="t('items:table.search.placeholder')"
          >
        </div>
        
        <!-- Type Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('itemType', $event.target.value)"
          >
            <option value="">{{ t('items:table.filters.type.all') }}</option>
            <option v-for="type in itemTypes" :key="type" :value="type">
              {{ t(`items:form.fields.itemType.options.${type}`) }}
            </option>
          </select>
        </div>
        
        <!-- Category Filter -->
        <div class="col-md-3">
          <select
            class="form-select"
            @change="updateFilter('category', $event.target.value)"
          >
            <option value="">{{ t('items:table.filters.category.all') }}</option>
            <option v-for="category in allCategories" :key="category" :value="category">
              {{ category }}
            </option>
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

    <template #cell-code="{ item, value }">
      <div class="d-flex align-items-center">
        <i :class="getItemTypeIcon(item.itemType)" class="me-2"></i>
        <div>
          <div class="fw-medium">{{ value }}</div>
          <small v-if="item.parent" class="text-muted">
            → {{ item.parent.code }}
          </small>
        </div>
      </div>
    </template>

    <template #cell-itemType="{ value }">
      <span 
        class="badge"
        :class="getTypeBadgeClass(value)"
      >
        {{ value || '-' }}
      </span>
    </template>

    <template #cell-category="{ value }">
      <span 
        v-if="value"
        class="badge bg-secondary"
      >
        {{ value }}
      </span>
      <span v-else class="text-muted">-</span>
    </template>

    <template #cell-values="{ item }">
      <div class="item-values">
        <small v-if="item.textValue" class="d-block text-muted">
          <i class="bi bi-type me-1"></i>{{ item.textValue }}
        </small>
        <small v-if="item.numberValue" class="d-block text-muted">
          <i class="bi bi-123 me-1"></i>{{ item.numberValue }}{{ item.unit ? ' ' + item.unit : '' }}
        </small>
        <small v-if="item.booleanValue" class="d-block text-success">
          <i class="bi bi-check-circle me-1"></i>{{ t('common:enabled') }}
        </small>
        <small v-if="item.dateValue" class="d-block text-muted">
          <i class="bi bi-calendar me-1"></i>{{ formatDate(item.dateValue) }}
        </small>
      </div>
    </template>

    <template #cell-tags="{ item }">
      <div v-if="item.tags && item.tags.length > 0" class="tags-container">
        <span
          v-for="tag in item.tags.slice(0, 2)"
          :key="tag"
          class="badge bg-light text-dark me-1 mb-1"
        >
          {{ tag }}
        </span>
        <span 
          v-if="item.tags.length > 2" 
          class="badge bg-secondary"
          :title="item.tags.slice(2).join(', ')"
        >
          +{{ item.tags.length - 2 }}
        </span>
      </div>
      <span v-else class="text-muted">-</span>
    </template>

    <template #cell-children="{ item }">
      <div v-if="item.children && item.children.length > 0" class="text-center">
        <span class="badge bg-info">{{ item.children.length }}</span>
      </div>
      <span v-else class="text-muted text-center">-</span>
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
          v-if="item.children && item.children.length > 0"
          class="btn btn-outline-info"
          @click="$emit('viewChildren', item)"
          :title="t('items:table.viewChildren')"
        >
          <i class="bi bi-diagram-3"></i>
        </button>
        <button
          class="btn btn-outline-success"
          @click="$emit('copy', item)"
          :title="t('items:table.copy')"
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
          :disabled="item.children && item.children.length > 0"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </template>

    <template #empty-state>
      <div class="text-center py-4">
        <i class="bi bi-collection display-1 text-muted"></i>
        <h5 class="mt-3">{{ t('items:table.empty.title') }}</h5>
        <p class="text-muted">{{ t('items:table.empty.message') }}</p>
        <div class="btn-group">
          <button
            class="btn btn-primary"
            @click="$emit('create')"
          >
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('items:table.empty.createFirst') }}
          </button>
          <button
            class="btn btn-outline-primary"
            @click="$emit('import')"
          >
            <i class="bi bi-upload me-2"></i>
            {{ t('items:table.empty.import') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Tree View Toggle -->
    <template #header-actions>
      <div class="btn-group btn-group-sm">
        <button
          class="btn"
          :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'"
          @click="$emit('setViewMode', 'table')"
        >
          <i class="bi bi-table"></i>
          {{ t('items:table.viewModes.table') }}
        </button>
        <button
          class="btn"
          :class="viewMode === 'tree' ? 'btn-primary' : 'btn-outline-primary'"
          @click="$emit('setViewMode', 'tree')"
        >
          <i class="bi bi-diagram-3"></i>
          {{ t('items:table.viewModes.tree') }}
        </button>
      </div>
    </template>
  </EntityTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type IItem } from '~/model/item.model'
import { ItemType } from '~/model/enumerations/item-type.model'
import EntityTable from '../shared/EntityTable.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  items: IItem[]
  loading?: boolean
  viewMode?: 'table' | 'tree'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  viewMode: 'table'
})

// Emits
const emit = defineEmits<{
  view: [item: IItem]
  edit: [item: IItem]
  delete: [item: IItem]
  copy: [item: IItem]
  viewChildren: [item: IItem]
  create: []
  import: []
  refresh: []
  setViewMode: [mode: 'table' | 'tree']
}>()

// Constants
const itemTypes = computed(() => Object.values(ItemType))

const allCategories = computed(() => {
  const categories = new Set<string>()
  props.items.forEach(item => {
    if (item.category) categories.add(item.category)
  })
  return Array.from(categories).sort()
})

// Table Columns
const columns = computed(() => [
  {
    key: 'code',
    label: t('items:table.columns.code'),
    sortable: true
  },
  {
    key: 'name',
    label: t('items:table.columns.name'),
    sortable: true
  },
  {
    key: 'itemType',
    label: t('items:table.columns.type'),
    sortable: true
  },
  {
    key: 'category',
    label: t('items:table.columns.category'),
    sortable: true
  },
  {
    key: 'values',
    label: t('items:table.columns.values'),
    sortable: false
  },
  {
    key: 'tags',
    label: t('items:table.columns.tags'),
    sortable: false
  },
  {
    key: 'children',
    label: t('items:table.columns.children'),
    sortable: false
  }
])

// Methods
const getItemTypeIcon = (itemType: ItemType): string => {
  switch (itemType) {
    case ItemType.COMPONENT: return 'bi bi-gear text-primary'
    case ItemType.ASSEMBLY: return 'bi bi-boxes text-success'
    case ItemType.MATERIAL: return 'bi bi-layers text-warning'
    case ItemType.TOOL: return 'bi bi-tools text-info'
    case ItemType.DOCUMENT: return 'bi bi-file-earmark-text text-secondary'
    default: return 'bi bi-square text-muted'
  }
}

const getTypeBadgeClass = (type: ItemType): string => {
  switch (type) {
    case ItemType.COMPONENT: return 'bg-primary'
    case ItemType.ASSEMBLY: return 'bg-success'
    case ItemType.MATERIAL: return 'bg-warning'
    case ItemType.TOOL: return 'bg-info'
    case ItemType.DOCUMENT: return 'bg-secondary'
    default: return 'bg-light text-dark'
  }
}

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.item-values {
  min-width: 120px;
}

.tags-container {
  max-width: 150px;
}

.badge {
  font-size: 0.75rem;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.4rem;
}
</style>