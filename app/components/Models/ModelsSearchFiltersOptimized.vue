<!--
  Models Search and Filters - Optimized Component
  
  Enhanced features:
  - Advanced filtering options
  - Search debouncing
  - Filter presets
  - Mobile responsive design
  - Performance optimizations
  
  @version 2.0.0
-->
<template>
  <div class="models-search-filters">
    <!-- Main Search Bar -->
    <div class="search-section mb-3">
      <div class="card">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  :value="searchCode"
                  @input="handleSearchInput"
                  type="text"
                  class="form-control"
                  :placeholder="t('models:search.placeholder')"
                  :disabled="loading"
                />
                <button 
                  v-if="searchCode"
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
                :value="selectedType"
                @change="handleTypeChange"
                class="form-select"
                :disabled="loading"
              >
                <option value="">{{ t('models:filters.allTypes') }}</option>
                <option value="PART">{{ t('models:types.part') }}</option>
                <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
                <option value="DRAWING">{{ t('models:types.drawing') }}</option>
                <option value="FORMAT">{{ t('models:types.format') }}</option>
              </select>
            </div>
            
            <div class="col-md-3">
              <select 
                :value="selectedInstance"
                @change="handleInstanceChange"
                class="form-select"
                :disabled="loading"
              >
                <option value="">{{ t('models:filters.allInstances') }}</option>
                <option value="GENERIC">{{ t('models:instances.generic') }}</option>
                <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters (Collapsible) -->
    <div class="advanced-filters mb-3">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="bi bi-funnel me-2"></i>
            {{ t('models:filters.advanced') }}
            <span v-if="activeFiltersCount" class="badge bg-primary ms-2">
              {{ activeFiltersCount }}
            </span>
          </h6>
          <button 
            class="btn btn-sm btn-outline-secondary"
            @click="showAdvanced = !showAdvanced"
          >
            <i class="bi" :class="showAdvanced ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>
        </div>
        
        <div class="card-body" v-show="showAdvanced">
          <div class="row g-3">
            <!-- Sheets Association Filter -->
            <div class="col-md-4">
              <label class="form-label">{{ t('models:filters.sheets') }}</label>
              <select 
                :value="advancedFilters.hasSheets"
                @change="handleSheetsFilterChange"
                class="form-select"
              >
                <option :value="null">{{ t('common:all') }}</option>
                <option :value="true">{{ t('models:filters.withSheets') }}</option>
                <option :value="false">{{ t('models:filters.withoutSheets') }}</option>
              </select>
            </div>
            
            <!-- Drawings Association Filter -->
            <div class="col-md-4">
              <label class="form-label">{{ t('models:filters.drawings') }}</label>
              <select 
                :value="advancedFilters.hasDrawings"
                @change="handleDrawingsFilterChange"
                class="form-select"
              >
                <option :value="null">{{ t('common:all') }}</option>
                <option :value="true">{{ t('models:filters.withDrawings') }}</option>
                <option :value="false">{{ t('models:filters.withoutDrawings') }}</option>
              </select>
            </div>
            
            <!-- Tags Filter -->
            <div class="col-md-4">
              <label class="form-label">{{ t('models:filters.tags') }}</label>
              <input
                v-model="tagsInput"
                type="text"
                class="form-control"
                :placeholder="t('models:filters.tagsPlaceholder')"
                @input="handleTagsInput"
              />
              <small class="form-text text-muted">
                {{ t('models:filters.tagsHint') }}
              </small>
            </div>
          </div>
          
          <!-- Filter Actions -->
          <div class="row mt-3">
            <div class="col">
              <div class="d-flex justify-content-between align-items-center">
                <div class="filter-presets">
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-secondary"
                      @click="applyPreset('parts')"
                    >
                      {{ t('models:presets.partsOnly') }}
                    </button>
                    <button 
                      class="btn btn-outline-secondary"
                      @click="applyPreset('assemblies')"
                    >
                      {{ t('models:presets.assembliesOnly') }}
                    </button>
                    <button 
                      class="btn btn-outline-secondary"
                      @click="applyPreset('withSheets')"
                    >
                      {{ t('models:presets.withSheets') }}
                    </button>
                  </div>
                </div>
                
                <div class="filter-actions">
                  <button 
                    class="btn btn-sm btn-outline-danger me-2"
                    @click="clearAllFilters"
                    :disabled="!hasActiveFilters"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    {{ t('common:clearAll') }}
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="saveCurrentAsPreset"
                    :disabled="!hasActiveFilters"
                  >
                    <i class="bi bi-bookmark me-1"></i>
                    {{ t('models:filters.savePreset') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Summary -->
    <div class="filter-summary" v-if="hasActiveFilters">
      <div class="alert alert-info d-flex justify-content-between align-items-center">
        <div class="summary-text">
          <i class="bi bi-info-circle me-2"></i>
          {{ filterSummaryText }}
        </div>
        <button 
          class="btn btn-sm btn-outline-primary"
          @click="clearAllFilters"
        >
          {{ t('common:clearFilters') }}
        </button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info d-flex justify-content-between align-items-center mb-3">
      <span class="text-muted">
        {{ t('models:search.results', { count: totalCount || 0 }) }}
      </span>
      <div class="search-actions" v-if="hasActiveFilters">
        <button 
          class="btn btn-sm btn-outline-secondary"
          @click="$emit('save-filter-preset')"
        >
          <i class="bi bi-download me-1"></i>
          {{ t('models:search.export') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'

// Props
interface Props {
  searchCode?: string
  selectedType?: string
  selectedInstance?: string
  advancedFilters?: {
    hasSheets: boolean | null
    hasDrawings: boolean | null
    tags: string[]
  }
  loading?: boolean
  totalCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  searchCode: '',
  selectedType: '',
  selectedInstance: '',
  advancedFilters: () => ({
    hasSheets: null,
    hasDrawings: null,
    tags: []
  }),
  loading: false,
  totalCount: 0
})

// Emits
const emit = defineEmits<{
  'update:searchCode': [value: string]
  'update:selectedType': [value: string]
  'update:selectedInstance': [value: string]
  'update:advancedFilters': [value: any]
  'search': []
  'filtersChanged': []
  'clearFilters': []
  'saveFilterPreset': []
}>()

// Composables
const { t } = useI18n()

// Local state
const showAdvanced = ref(false)
const tagsInput = ref('')

// Search debouncing
let searchTimeout: NodeJS.Timeout

const handleSearchInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('update:searchCode', value)
    emit('search')
  }, 300)
}

const clearSearch = (): void => {
  emit('update:searchCode', '')
  emit('search')
}

// Filter handlers
const handleTypeChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedType', target.value)
  emit('filtersChanged')
}

const handleInstanceChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedInstance', target.value)
  emit('filtersChanged')
}

const handleSheetsFilterChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const value = target.value === 'null' ? null : target.value === 'true'
  
  const updated = {
    ...props.advancedFilters,
    hasSheets: value
  }
  emit('update:advancedFilters', updated)
  emit('filtersChanged')
}

const handleDrawingsFilterChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const value = target.value === 'null' ? null : target.value === 'true'
  
  const updated = {
    ...props.advancedFilters,
    hasDrawings: value
  }
  emit('update:advancedFilters', updated)
  emit('filtersChanged')
}

const handleTagsInput = (): void => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  const updated = {
    ...props.advancedFilters,
    tags
  }
  emit('update:advancedFilters', updated)
  emit('filtersChanged')
}

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    props.searchCode ||
    props.selectedType ||
    props.selectedInstance ||
    props.advancedFilters.hasSheets !== null ||
    props.advancedFilters.hasDrawings !== null ||
    props.advancedFilters.tags.length > 0
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.selectedType) count++
  if (props.selectedInstance) count++
  if (props.advancedFilters.hasSheets !== null) count++
  if (props.advancedFilters.hasDrawings !== null) count++
  if (props.advancedFilters.tags.length > 0) count++
  return count
})

const filterSummaryText = computed(() => {
  const filters = []
  if (props.selectedType) filters.push(t(`models:types.${props.selectedType.toLowerCase()}`))
  if (props.selectedInstance) filters.push(t(`models:instances.${props.selectedInstance.toLowerCase()}`))
  if (props.advancedFilters.hasSheets === true) filters.push(t('models:filters.withSheets'))
  if (props.advancedFilters.hasSheets === false) filters.push(t('models:filters.withoutSheets'))
  if (props.advancedFilters.hasDrawings === true) filters.push(t('models:filters.withDrawings'))
  if (props.advancedFilters.hasDrawings === false) filters.push(t('models:filters.withoutDrawings'))
  if (props.advancedFilters.tags.length > 0) filters.push(`${props.advancedFilters.tags.length} tags`)
  
  return t('models:filters.activeFilters', { filters: filters.join(', ') })
})

// Preset actions
const applyPreset = (preset: string): void => {
  switch (preset) {
    case 'parts':
      emit('update:selectedType', 'PART')
      break
    case 'assemblies':
      emit('update:selectedType', 'ASSEMBLY')
      break
    case 'withSheets':
      emit('update:advancedFilters', {
        ...props.advancedFilters,
        hasSheets: true
      })
      break
  }
  emit('filtersChanged')
}

const clearAllFilters = (): void => {
  emit('update:searchCode', '')
  emit('update:selectedType', '')
  emit('update:selectedInstance', '')
  emit('update:advancedFilters', {
    hasSheets: null,
    hasDrawings: null,
    tags: []
  })
  tagsInput.value = ''
  emit('clearFilters')
}

const saveCurrentAsPreset = (): void => {
  emit('saveFilterPreset')
}

// Initialize tags input
watch(() => props.advancedFilters.tags, (newTags) => {
  tagsInput.value = newTags.join(', ')
}, { immediate: true })
</script>

<style scoped>
.models-search-filters {
  margin-bottom: 1rem;
}

.search-section .card {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.advanced-filters .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.filter-presets .btn-group {
  margin-right: 1rem;
}

.filter-summary .alert {
  border-radius: 0.375rem;
  border: 1px solid #b3d4fc;
}

.results-info {
  font-size: 0.875rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .advanced-filters .row .col-md-4 {
    margin-bottom: 1rem;
  }
  
  .filter-actions .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-presets .btn-group {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .filter-presets .btn {
    flex: 1;
  }
}
</style>