<!-- app/components/entities/format/FormatTable.vue -->
<template>
  <div class="format-table-container">
    <!-- Filters -->
    <div class="card border-0 bg-light mb-3">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                :placeholder="t('formats:table.search.placeholder')"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select
              v-model="selectedCategory"
              class="form-select form-select-sm"
            >
              <option value="">{{ t('formats:table.filters.category.all') }}</option>
              <option value="DIN">DIN</option>
              <option value="ISO">ISO</option>
              <option value="ANSI">ANSI</option>
              <option value="CUSTOM">{{ t('formats:table.filters.category.custom') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <select
              v-model="selectedOrientation"
              class="form-select form-select-sm"
            >
              <option value="">{{ t('formats:table.filters.orientation.all') }}</option>
              <option value="PORTRAIT">{{ t('formats:table.filters.orientation.portrait') }}</option>
              <option value="LANDSCAPE">{{ t('formats:table.filters.orientation.landscape') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <div class="d-flex gap-1">
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="resetFilters"
              >
                <i class="bi bi-arrow-clockwise"></i>
              </button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="toggleView"
              >
                <i :class="viewMode === 'table' ? 'bi bi-grid-3x3' : 'bi bi-list'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="table-responsive">
      <table class="table table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col" class="sortable" @click="sort('name')">
              {{ t('formats:table.columns.name') }}
              <i :class="getSortIcon('name')"></i>
            </th>
            <th scope="col" class="sortable" @click="sort('width')">
              {{ t('formats:table.columns.dimensions') }}
              <i :class="getSortIcon('width')"></i>
            </th>
            <th scope="col">{{ t('formats:table.columns.orientation') }}</th>
            <th scope="col">{{ t('formats:table.columns.category') }}</th>
            <th scope="col">{{ t('formats:table.columns.ratio') }}</th>
            <th scope="col" class="text-center">{{ t('formats:table.columns.standard') }}</th>
            <th scope="col" class="text-center">{{ t('common:actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="format in paginatedFormats" :key="format.id">
            <td>
              <div class="d-flex align-items-center">
                <div class="format-preview me-2" :style="getPreviewStyle(format)">
                  <div class="format-preview-inner"></div>
                </div>
                <div>
                  <strong>{{ format.name }}</strong>
                  <div v-if="format.description" class="small text-muted">
                    {{ format.description }}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span class="badge bg-light text-dark">
                {{ format.width }} × {{ format.height }} mm
              </span>
            </td>
            <td>
              <span :class="getOrientationClass(format.orientation)">
                <i :class="getOrientationIcon(format.orientation)"></i>
                {{ t(`formats:table.orientation.${format.orientation?.toLowerCase()}`) }}
              </span>
            </td>
            <td>
              <span class="badge" :class="getCategoryBadgeClass(format.category)">
                {{ format.category }}
              </span>
            </td>
            <td class="font-monospace small">
              {{ getAspectRatio(format) }}
            </td>
            <td class="text-center">
              <i v-if="format.isStandard" class="bi bi-check-circle text-success" :title="t('formats:table.standard.yes')"></i>
              <i v-else class="bi bi-dash-circle text-muted" :title="t('formats:table.standard.no')"></i>
            </td>
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-primary"
                  @click="$emit('edit', format)"
                  :title="t('common:edit')"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-outline-info"
                  @click="$emit('duplicate', format)"
                  :title="t('common:duplicate')"
                >
                  <i class="bi bi-files"></i>
                </button>
                <button
                  v-if="!format.isStandard"
                  class="btn btn-outline-danger"
                  @click="$emit('delete', format)"
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

    <!-- Grid View -->
    <div v-else class="row g-3">
      <div v-for="format in paginatedFormats" :key="format.id" class="col-lg-3 col-md-4 col-sm-6">
        <div class="card h-100 format-card">
          <div class="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0">{{ format.name }}</h6>
            <span class="badge" :class="getCategoryBadgeClass(format.category)">
              {{ format.category }}
            </span>
          </div>
          <div class="card-body">
            <div class="format-preview-large mx-auto mb-3" :style="getLargePreviewStyle(format)">
              <div class="format-preview-inner"></div>
            </div>
            <div class="text-center mb-2">
              <div class="fw-bold">{{ format.width }} × {{ format.height }} mm</div>
              <div class="small text-muted">{{ getAspectRatio(format) }}</div>
            </div>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <span :class="getOrientationClass(format.orientation)">
                <i :class="getOrientationIcon(format.orientation)"></i>
                {{ t(`formats:table.orientation.${format.orientation?.toLowerCase()}`) }}
              </span>
              <i v-if="format.isStandard" class="bi bi-check-circle text-success" :title="t('formats:table.standard.yes')"></i>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-center gap-1">
              <button
                class="btn btn-outline-primary btn-sm"
                @click="$emit('edit', format)"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                class="btn btn-outline-info btn-sm"
                @click="$emit('duplicate', format)"
              >
                <i class="bi bi-files"></i>
              </button>
              <button
                v-if="!format.isStandard"
                class="btn btn-outline-danger btn-sm"
                @click="$emit('delete', format)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="filteredFormats.length === 0" class="text-center py-5">
      <i class="bi bi-search display-1 text-muted"></i>
      <h4 class="text-muted mt-3">{{ t('formats:table.noResults.title') }}</h4>
      <p class="text-muted">{{ t('formats:table.noResults.message') }}</p>
      <button class="btn btn-outline-primary" @click="resetFilters">
        <i class="bi bi-arrow-clockwise me-2"></i>
        {{ t('formats:table.noResults.reset') }}
      </button>
    </div>

    <!-- Pagination -->
    <nav v-if="totalPages > 1" aria-label="Formats pagination" class="mt-4">
      <ul class="pagination justify-content-center">
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
        <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type IFormat } from '~/model/format.model'

// Composables
const { t } = useI18n()

// Props
interface Props {
  formats: IFormat[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  edit: [format: IFormat]
  delete: [format: IFormat]
  duplicate: [format: IFormat]
}>()

// Reactive Data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedOrientation = ref('')
const sortField = ref('name')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const viewMode = ref<'table' | 'grid'>('table')

// Computed
const filteredFormats = computed(() => {
  let filtered = [...props.formats]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(format =>
      format.name?.toLowerCase().includes(query) ||
      format.description?.toLowerCase().includes(query) ||
      format.category?.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(format => format.category === selectedCategory.value)
  }

  // Orientation filter
  if (selectedOrientation.value) {
    filtered = filtered.filter(format => format.orientation === selectedOrientation.value)
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue = a[sortField.value as keyof IFormat] as any
    let bValue = b[sortField.value as keyof IFormat] as any

    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredFormats.value.length / itemsPerPage.value))

const paginatedFormats = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFormats.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const sort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return 'bi bi-arrow-down-up text-muted'
  return sortDirection.value === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedOrientation.value = ''
  currentPage.value = 1
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'grid' : 'table'
}

const getPreviewStyle = (format: IFormat) => {
  const maxWidth = 40
  const maxHeight = 25
  const ratio = (format.width || 210) / (format.height || 297)
  
  let width, height
  if (ratio > maxWidth / maxHeight) {
    width = maxWidth
    height = maxWidth / ratio
  } else {
    height = maxHeight
    width = maxHeight * ratio
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
    border: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa'
  }
}

const getLargePreviewStyle = (format: IFormat) => {
  const maxWidth = 120
  const maxHeight = 80
  const ratio = (format.width || 210) / (format.height || 297)
  
  let width, height
  if (ratio > maxWidth / maxHeight) {
    width = maxWidth
    height = maxWidth / ratio
  } else {
    height = maxHeight
    width = maxHeight * ratio
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
    border: '2px solid #dee2e6',
    backgroundColor: '#f8f9fa'
  }
}

const getOrientationIcon = (orientation?: string) => {
  switch (orientation) {
    case 'PORTRAIT': return 'bi bi-phone'
    case 'LANDSCAPE': return 'bi bi-phone-landscape'
    default: return 'bi bi-square'
  }
}

const getOrientationClass = (orientation?: string) => {
  switch (orientation) {
    case 'PORTRAIT': return 'text-primary'
    case 'LANDSCAPE': return 'text-info'
    default: return 'text-muted'
  }
}

const getCategoryBadgeClass = (category?: string) => {
  switch (category) {
    case 'DIN': return 'bg-primary'
    case 'ISO': return 'bg-success'
    case 'ANSI': return 'bg-warning'
    case 'CUSTOM': return 'bg-secondary'
    default: return 'bg-light text-dark'
  }
}

const getAspectRatio = (format: IFormat) => {
  if (!format.width || !format.height) return '1:1'
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(format.width, format.height)
  return `${format.width / divisor}:${format.height / divisor}`
}

// Watchers
watch([searchQuery, selectedCategory, selectedOrientation], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.format-table-container {
  position: relative;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.format-preview {
  display: inline-block;
  position: relative;
  border-radius: 2px;
}

.format-preview-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #fff 25%, transparent 25%),
              linear-gradient(-45deg, #fff 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #fff 75%),
              linear-gradient(-45deg, transparent 75%, #fff 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  border-radius: inherit;
}

.format-preview-large {
  display: inline-block;
  position: relative;
  border-radius: 4px;
}

.format-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.format-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-link {
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

@media (max-width: 768px) {
  .format-table-container .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.25rem 0.4rem;
  }
}
</style>