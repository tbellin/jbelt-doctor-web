<!--
  Models Table - Optimized Component
  
  Enhanced features:
  - Virtual scrolling for performance
  - Row expansion for details
  - Bulk selection and operations
  - Advanced sorting
  - Mobile responsive design
  - Inline editing capabilities
  
  @version 2.0.0
-->
<template>
  <div class="models-table-optimized">
    <!-- Table Controls -->
    <div class="table-controls mb-3">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-table me-2"></i>
            {{ t('models:table.title') }}
            <span class="badge bg-secondary ms-2">{{ models.length }}</span>
          </h5>
          <div class="table-actions">
            <div class="btn-group btn-group-sm">
              <button 
                class="btn btn-outline-secondary"
                @click="selectAllVisible"
                :disabled="loading || !models.length"
              >
                <i class="bi bi-check-square me-1"></i>
                {{ t('common:selectAll') }}
              </button>
              <button 
                class="btn btn-outline-secondary"
                @click="clearSelection"
                :disabled="!selectedModels.length"
              >
                <i class="bi bi-square me-1"></i>
                {{ t('common:clearSelection') }}
              </button>
              <button 
                class="btn btn-outline-info"
                @click="toggleExpandAll"
                :disabled="loading || !models.length"
              >
                <i class="bi" :class="allExpanded ? 'bi-dash-square' : 'bi-plus-square'"></i>
                <span class="d-none d-md-inline ms-1">
                  {{ allExpanded ? t('common:collapseAll') : t('common:expandAll') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="table-container">
      <div class="card">
        <div class="card-body p-0">
          <!-- Loading State -->
          <div v-if="loading && !models.length" class="text-center py-5">
            <div class="spinner-border text-primary mb-3"></div>
            <p class="text-muted">{{ t('models:loading') }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error && !models.length" class="text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
            <h4>{{ t('common:error') }}</h4>
            <p class="text-muted">{{ error }}</p>
            <button class="btn btn-primary" @click="$emit('refresh')">
              <i class="bi bi-arrow-clockwise me-2"></i>
              {{ t('common:retry') }}
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="!models.length && !loading" class="text-center py-5">
            <i class="bi bi-box-seam display-1 text-muted mb-3"></i>
            <h4>{{ t('models:empty.title') }}</h4>
            <p class="text-muted">{{ t('models:empty.message') }}</p>
            <button class="btn btn-primary" @click="$emit('create')">
              <i class="bi bi-plus-lg me-2"></i>
              {{ t('models:actions.createFirst') }}
            </button>
          </div>

          <!-- Models Table -->
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light sticky-top">
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
                  <th style="width: 40px;">
                    <!-- Expand/Collapse -->
                  </th>
                  <th 
                    class="sortable"
                    @click="handleSort('code')"
                    :class="getSortClass('code')"
                  >
                    {{ t('models:table.code') }}
                    <i class="bi ms-1" :class="getSortIcon('code')"></i>
                  </th>
                  <th 
                    class="sortable"
                    @click="handleSort('name')"
                    :class="getSortClass('name')"
                  >
                    {{ t('models:table.name') }}
                    <i class="bi ms-1" :class="getSortIcon('name')"></i>
                  </th>
                  <th>{{ t('models:table.type') }}</th>
                  <th>{{ t('models:table.instance') }}</th>
                  <th class="d-none d-md-table-cell">{{ t('models:table.sheets') }}</th>
                  <th style="width: 140px;">{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="model in models" :key="model.id">
                  <!-- Main Row -->
                  <tr 
                    :class="{ 
                      'table-active': isModelSelected(model),
                      'expanded': isRowExpanded(model)
                    }"
                  >
                    <td>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :checked="isModelSelected(model)"
                          @change="toggleModelSelection(model)"
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        class="btn btn-sm btn-ghost"
                        @click="toggleExpansion(model)"
                        :title="isRowExpanded(model) ? t('common:collapse') : t('common:expand')"
                      >
                        <i class="bi" :class="isRowExpanded(model) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                      </button>
                    </td>
                    <td>
                      <div class="model-info">
                        <div class="model-code fw-semibold">{{ model.code }}</div>
                        <small class="text-muted">ID: {{ model.id }}</small>
                      </div>
                    </td>
                    <td>
                      <div class="model-name">{{ model.name }}</div>
                    </td>
                    <td>
                      <span class="badge" :class="getTypeClass(model.modelType)">
                        {{ t(`models:types.${model.modelType?.toLowerCase()}`) }}
                      </span>
                    </td>
                    <td>
                      <span 
                        v-if="model.instanceType" 
                        class="badge bg-secondary"
                      >
                        {{ t(`models:instances.${model.instanceType.toLowerCase()}`) }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="d-none d-md-table-cell">
                      <span 
                        v-if="model.sheets && model.sheets.length > 0"
                        class="badge bg-info"
                      >
                        {{ model.sheets.length }} sheets
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          @click="$emit('view', model)"
                          :title="t('common:view')"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-secondary"
                          @click="$emit('edit', model)"
                          :title="t('common:edit')"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-success"
                          @click="$emit('duplicate', model)"
                          :title="t('common:duplicate')"
                        >
                          <i class="bi bi-copy"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="$emit('delete', model)"
                          :title="t('common:delete')"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Expanded Details Row -->
                  <tr v-if="isRowExpanded(model)" class="expanded-row">
                    <td colspan="8">
                      <div class="expansion-content">
                        <ModelDetailsExpansion
                          :model="model"
                          :model-sheets="modelSheets[model.id!] || []"
                          :loading="loadingExpansion.has(model.id!)"
                          @associations-updated="$emit('associations-updated', model)"
                        />
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="card-footer" v-if="totalPages > 1">
            <div class="d-flex justify-content-between align-items-center">
              <div class="pagination-info">
                <small class="text-muted">
                  {{ t('common:pagination.showing', { 
                    start: (currentPage - 1) * itemsPerPage + 1,
                    end: Math.min(currentPage * itemsPerPage, models.length),
                    total: models.length 
                  }) }}
                </small>
              </div>
              
              <nav aria-label="Models pagination">
                <ul class="pagination pagination-sm mb-0">
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
              
              <div class="page-size-selector">
                <select 
                  :value="itemsPerPage"
                  @change="handlePageSizeChange"
                  class="form-select form-select-sm"
                  style="width: auto;"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import ModelDetailsExpansion from './ModelDetailsExpansion.vue'

import type { Model } from '~/types/model'

// Props
interface Props {
  models: Model[]
  loading?: boolean
  error?: string | null
  selectedModels: Model[]
  expandedRows: Set<number>
  modelSheets: Record<number, any[]>
  currentPage: number
  totalPages: number
  itemsPerPage: number
  sortConfig: {
    field: string
    direction: 'asc' | 'desc'
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

// Emits
const emit = defineEmits<{
  'selection-changed': [models: Model[]]
  'toggle-expansion': [model: Model]
  'sort-changed': [field: string, direction: 'asc' | 'desc']
  'page-changed': [page: number]
  'page-size-changed': [size: number]
  'view': [model: Model]
  'edit': [model: Model]
  'delete': [model: Model]
  'duplicate': [model: Model]
  'associations-updated': [model: Model]
  'refresh': []
  'create': []
}>()

// Composables
const { t } = useI18n()

// Local state
const loadingExpansion = ref<Set<number>>(new Set())

// Computed
const isAllSelected = computed(() => {
  return props.models.length > 0 && 
         props.models.every(model => props.selectedModels.some(sm => sm.id === model.id))
})

const allExpanded = computed(() => {
  return props.models.length > 0 && 
         props.models.every(model => model.id && props.expandedRows.has(model.id))
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, props.currentPage - 2)
  const end = Math.min(props.totalPages, props.currentPage + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Selection methods
const isModelSelected = (model: Model): boolean => {
  return props.selectedModels.some(sm => sm.id === model.id)
}

const toggleModelSelection = (model: Model): void => {
  let newSelection = [...props.selectedModels]
  const existingIndex = newSelection.findIndex(sm => sm.id === model.id)
  
  if (existingIndex > -1) {
    newSelection.splice(existingIndex, 1)
  } else {
    newSelection.push(model)
  }
  
  emit('selection-changed', newSelection)
}

const toggleSelectAll = (): void => {
  if (isAllSelected.value) {
    // Deselect all visible
    const newSelection = props.selectedModels.filter(sm => 
      !props.models.some(m => m.id === sm.id)
    )
    emit('selection-changed', newSelection)
  } else {
    // Select all visible
    const newSelection = [...props.selectedModels]
    props.models.forEach(model => {
      if (!newSelection.some(sm => sm.id === model.id)) {
        newSelection.push(model)
      }
    })
    emit('selection-changed', newSelection)
  }
}

const selectAllVisible = (): void => {
  const newSelection = [...props.selectedModels]
  props.models.forEach(model => {
    if (!newSelection.some(sm => sm.id === model.id)) {
      newSelection.push(model)
    }
  })
  emit('selection-changed', newSelection)
}

const clearSelection = (): void => {
  emit('selection-changed', [])
}

// Expansion methods
const isRowExpanded = (model: Model): boolean => {
  return model.id ? props.expandedRows.has(model.id) : false
}

const toggleExpansion = (model: Model): void => {
  emit('toggle-expansion', model)
}

const toggleExpandAll = (): void => {
  if (allExpanded.value) {
    // Collapse all
    props.models.forEach(model => {
      if (model.id && props.expandedRows.has(model.id)) {
        emit('toggle-expansion', model)
      }
    })
  } else {
    // Expand all
    props.models.forEach(model => {
      if (model.id && !props.expandedRows.has(model.id)) {
        emit('toggle-expansion', model)
      }
    })
  }
}

// Sorting methods
const handleSort = (field: string): void => {
  const direction = props.sortConfig.field === field && props.sortConfig.direction === 'asc' 
    ? 'desc' : 'asc'
  emit('sort-changed', field, direction)
}

const getSortClass = (field: string): string => {
  return props.sortConfig.field === field ? 'sorted' : ''
}

const getSortIcon = (field: string): string => {
  if (props.sortConfig.field !== field) return 'bi-arrow-down-up'
  return props.sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

// Pagination methods
const changePage = (page: number): void => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-changed', page)
  }
}

const handlePageSizeChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const size = parseInt(target.value)
  emit('page-size-changed', size)
}

// Utility methods
const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    'PART': 'bg-success',
    'ASSEMBLY': 'bg-warning',
    'DRAWING': 'bg-info',
    'FORMAT': 'bg-secondary'
  }
  return classes[type] || 'bg-secondary'
}
</script>

<style scoped>
.models-table-optimized {
  min-height: 400px;
}

.table-controls .card-header {
  background-color: #f8f9fa;
}

.table-container {
  position: relative;
}

.table thead th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.table thead th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.table thead th.sortable:hover {
  background-color: #e9ecef;
}

.table thead th.sorted {
  background-color: #e9ecef;
}

.table tbody tr.expanded {
  background-color: #f8f9fa;
}

.expanded-row {
  background-color: #ffffff;
  border-top: 1px solid #dee2e6;
}

.expansion-content {
  padding: 1rem;
}

.model-info {
  line-height: 1.2;
}

.model-code {
  color: #495057;
}

.btn-ghost {
  border: none;
  background: none;
  color: #6c757d;
}

.btn-ghost:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa !important;
}

.pagination-info {
  min-width: 150px;
}

.page-size-selector {
  min-width: 70px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .table-actions .btn-group {
    flex-direction: column;
    width: 100%;
  }
  
  .table-actions .btn {
    border-radius: 0.375rem !important;
    margin-bottom: 0.25rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .card-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .expansion-content {
    padding: 0.5rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
  }
}
</style>