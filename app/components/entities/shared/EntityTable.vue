<template>
  <div class="entity-table">
    <div class="card">
      <div class="card-header" v-if="showHeader">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">{{ title || `${entityName} List` }}</h5>
          <div class="d-flex gap-2">
            <slot name="header-actions" :refresh="refreshData" :loading="loading">
              <button 
                class="btn btn-outline-primary btn-sm"
                @click="refreshData"
                :disabled="loading"
              >
                <i class="bi bi-arrow-clockwise"></i>
                {{ t('common:refresh') }}
              </button>
            </slot>
          </div>
        </div>
      </div>
      
      <div class="card-body p-0">
        <!-- Search and Filters -->
        <div v-if="showFilters" class="p-3 border-bottom bg-light">
          <slot 
            name="filters" 
            :search="search"
            :filters="filters"
            :updateSearch="updateSearch"
            :updateFilter="updateFilter"
            :clearFilters="clearFilters"
          >
            <div class="row">
              <div class="col-md-6">
                <input
                  v-model="search"
                  type="text"
                  class="form-control"
                  :placeholder="`${t('common:search')} ${entityName}...`"
                >
              </div>
            </div>
          </slot>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-4 text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ t('common:loading') }}</span>
          </div>
          <p class="mt-2 mb-0">{{ t('common:loading') }}...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredData.length === 0" class="p-4 text-center">
          <slot name="empty-state">
            <div class="text-muted">
              <i class="bi bi-inbox display-4 d-block mb-3"></i>
              <h5>{{ t('common:no_data') }}</h5>
              <p>{{ search ? t('common:no_results') : `No ${entityName.toLowerCase()} found` }}</p>
            </div>
          </slot>
        </div>

        <!-- Data Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <slot 
                  name="headers"
                  :sortBy="sortBy"
                  :sortDirection="sortDirection"
                  :sort="sort"
                >
                  <th v-for="column in columns" :key="column.key">
                    <button
                      v-if="column.sortable"
                      class="btn btn-link p-0 text-decoration-none"
                      @click="sort(column.key)"
                    >
                      {{ column.label }}
                      <i 
                        class="bi ms-1"
                        :class="{
                          'bi-sort-alpha-down': sortBy === column.key && sortDirection === 'asc',
                          'bi-sort-alpha-up': sortBy === column.key && sortDirection === 'desc',
                          'bi-sort': sortBy !== column.key
                        }"
                      ></i>
                    </button>
                    <span v-else>{{ column.label }}</span>
                  </th>
                  <th v-if="showActions" class="text-end">{{ t('common:actions') }}</th>
                </slot>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedData" :key="getItemKey(item)">
                <slot 
                  name="row" 
                  :item="item" 
                  :index="data.indexOf(item)"
                  :columns="columns"
                >
                  <td v-for="column in columns" :key="column.key">
                    <slot 
                      :name="`cell-${column.key}`" 
                      :item="item" 
                      :value="getNestedValue(item, column.key)"
                    >
                      {{ formatCellValue(getNestedValue(item, column.key), column) }}
                    </slot>
                  </td>
                </slot>
                
                <td v-if="showActions" class="text-end">
                  <slot name="actions" :item="item">
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="$emit('view', item)"
                        :title="t('common:view')"
                      >
                        <i class="bi bi-eye"></i>
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
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="p-3 border-top bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
              {{ t('common:showing') }} {{ startIndex + 1 }}-{{ endIndex }} {{ t('common:of') }} {{ filteredData.length }}
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-double-left"></i>
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Composables
const { t } = useI18n()

// Types
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge'
  format?: (value: any) => string
}

// Props
interface Props {
  entityName: string
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  showHeader?: boolean
  showFilters?: boolean
  showActions?: boolean
  title?: string
  pageSize?: number
  itemKeyField?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showHeader: true,
  showFilters: true,
  showActions: true,
  pageSize: 10,
  itemKeyField: 'id'
})

// Emits
const emit = defineEmits<{
  view: [item: any]
  edit: [item: any]
  delete: [item: any]
  refresh: []
}>()

// Reactive Data
const search = ref('')
const filters = ref<Record<string, any>>({})
const sortBy = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

// Computed
const filteredData = computed(() => {
  let result = [...props.data]
  
  // Apply search
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(item =>
      props.columns.some(column => {
        const value = getNestedValue(item, column.key)
        return String(value || '').toLowerCase().includes(searchLower)
      })
    )
  }
  
  // Apply filters
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result = result.filter(item => {
        const itemValue = getNestedValue(item, key)
        return itemValue === value
      })
    }
  })
  
  // Apply sorting
  if (sortBy.value) {
    result.sort((a, b) => {
      const aValue = getNestedValue(a, sortBy.value)
      const bValue = getNestedValue(b, sortBy.value)
      
      if (aValue === bValue) return 0
      
      const comparison = aValue < bValue ? -1 : 1
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / props.pageSize))

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() => Math.min(startIndex.value + props.pageSize, filteredData.value.length))

const paginatedData = computed(() => 
  filteredData.value.slice(startIndex.value, endIndex.value)
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const getItemKey = (item: any): string | number => {
  return item[props.itemKeyField] || JSON.stringify(item)
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatCellValue = (value: any, column: TableColumn): string => {
  if (value === null || value === undefined) return '-'
  
  if (column.format) {
    return column.format(value)
  }
  
  switch (column.type) {
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'boolean':
      return value ? t('common:yes') : t('common:no')
    case 'number':
      return Number(value).toLocaleString()
    default:
      return String(value)
  }
}

const sort = (column: string) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortDirection.value = 'asc'
  }
}

const updateSearch = (value: string) => {
  search.value = value
  currentPage.value = 1
}

const updateFilter = (key: string, value: any) => {
  filters.value[key] = value
  currentPage.value = 1
}

const clearFilters = () => {
  search.value = ''
  filters.value = {}
  currentPage.value = 1
}

const refreshData = () => {
  emit('refresh')
}

// Watchers
watch(() => props.data, () => {
  currentPage.value = 1
})

// Expose methods
defineExpose({
  search,
  filters,
  clearFilters,
  refreshData
})
</script>

<style scoped>
.entity-table .table th {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--bs-gray-700);
}

.entity-table .btn-link {
  color: var(--bs-gray-700);
  font-weight: 600;
}

.entity-table .btn-link:hover {
  color: var(--bs-primary);
}

.page-link {
  font-size: 0.8125rem;
}

.card-title {
  color: var(--bs-primary);
  font-weight: 600;
}
</style>