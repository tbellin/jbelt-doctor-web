<!--
  Componente per i filtri di ricerca e selezione dei modelli
  @version 1.0.0
-->
<template>
  <div class="card mb-4">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="card-title mb-0">
          <i class="bi bi-funnel me-2"></i>
          {{ t('models:filters.title') }}
        </h6>
        <button 
          class="btn btn-sm btn-outline-secondary"
          @click="toggleFiltersCollapse"
          :title="isFiltersCollapsed ? t('models:filters.expandFilters') : t('models:filters.collapseFilters')"
        >
          <i class="bi" :class="isFiltersCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
          {{ isFiltersCollapsed ? t('models:table.show') : t('models:table.hide') }}
        </button>
      </div>
    </div>
    <div class="card-body collapse-content" v-show="!isFiltersCollapsed">
      <div class="row">
        <div class="col-md-4">
          <label for="searchCode" class="form-label">{{ t('models:search.code') }}</label>
          <div class="input-group">
            <input
              id="searchCode"
              :value="searchCode"
              @input="handleSearchInput"
              type="text"
              class="form-control"
              :placeholder="t('models:search.codePlaceholder')"
              @keyup.enter="$emit('search')"
            >
            <button 
              class="btn btn-outline-secondary" 
              @click="$emit('search')" 
              :disabled="loading"
            >
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
        
        <div class="col-md-3">
          <label for="filterType" class="form-label">{{ t('models:filter.type') }}</label>
          <select 
            id="filterType" 
            :model-value="selectedType" 
            @change="handleTypeChange"
            class="form-select"
          >
            <option value="">{{ t('common:all') }}</option>
            <option value="PART">{{ t('models:types.part') }}</option>
            <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
            <option value="DRAWING">{{ t('models:types.drawing') }}</option>
          </select>
        </div>
        
        <div class="col-md-3">
          <label for="filterInstance" class="form-label">{{ t('models:filter.instance') }}</label>
          <select 
            id="filterInstance" 
            :model-value="selectedInstance" 
            @change="handleInstanceChange"
            class="form-select"
          >
            <option value="">{{ t('common:all') }}</option>
            <option value="PARAMETRIC">{{ t('models:instances.parametric') }}</option>
            <option value="NORMAL">{{ t('models:instances.normal') }}</option>
            <option value="GENERIC">{{ t('models:instances.generic') }}</option>
            <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
            <option value="BULK">{{ t('models:instances.bulk') }}</option>
          </select>
        </div>
        
        <div class="col-md-2 d-flex align-items-end">
          <button 
            class="btn btn-secondary w-100" 
            @click="$emit('clearFilters')" 
            :disabled="loading"
          >
            <i class="bi bi-x-circle me-2"></i>
            {{ t('common:clear') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  searchCode: string
  selectedType: string
  selectedInstance: string
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:searchCode': [value: string]
  'update:selectedType': [value: string]
  'update:selectedInstance': [value: string]
  'search': []
  'filtersChanged': []
  'clearFilters': []
}>()

const handleTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedType', target.value)
  emit('filtersChanged')
}

const handleInstanceChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedInstance', target.value)
  emit('filtersChanged')
}

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:searchCode', target.value)
}

// Stato del collapse dei filtri
const isFiltersCollapsed = ref(false)

// Metodo per toggle del collapse dei filtri
const toggleFiltersCollapse = () => {
  isFiltersCollapsed.value = !isFiltersCollapsed.value
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

/* Animazione per il collapse dei filtri */
.collapse-content {
  transition: all 0.3s ease-in-out;
}

/* Stile per il pulsante di collapse */
.card-header .btn {
  transition: all 0.2s ease;
}

.card-header .btn:hover {
  transform: translateY(-1px);
}

.card-header .btn i {
  transition: transform 0.2s ease;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.card-title {
  color: #495057;
  font-weight: 600;
}

@media (max-width: 768px) {
  .card-header .d-flex {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.5rem;
  }
  
  .card-header .btn {
    align-self: center;
  }
}
</style>