<!--
  Componente per i filtri di ricerca e selezione degli sheet
  @version 1.0.0
-->
<template>
  <div class="card mb-4">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="card-title mb-0">
          <i class="bi bi-funnel me-2"></i>
          {{ t('sheets:filters.title') }}
        </h6>
        <button 
          class="btn btn-sm btn-outline-secondary"
          @click="toggleFiltersCollapse"
          :title="isFiltersCollapsed ? t('sheets:filters.expandFilters') : t('sheets:filters.collapseFilters')"
        >
          <i class="bi" :class="isFiltersCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
        </button>
      </div>
    </div>
    <div class="card-body collapse-content" v-show="!isFiltersCollapsed">
      <div class="row">
        <div class="col-md-3">
          <label for="searchCode" class="form-label">{{ t('sheets:search.code') }}</label>
          <div class="input-group">
            <input
              id="searchCode"
              :value="searchCode"
              @input="handleSearchCodeInput"
              type="text"
              class="form-control"
              :placeholder="t('sheets:search.codePlaceholder')"
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
          <label for="searchName" class="form-label">{{ t('sheets:search.name') }}</label>
          <div class="input-group">
            <input
              id="searchName"
              :value="searchName"
              @input="handleSearchNameInput"
              type="text"
              class="form-control"
              :placeholder="t('sheets:search.namePlaceholder')"
              @keyup.enter="$emit('searchByName')"
            >
            <button 
              class="btn btn-outline-secondary" 
              @click="$emit('searchByName')" 
              :disabled="loading"
            >
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
        
        <div class="col-md-2">
          <label for="filterFormat" class="form-label">{{ t('sheets:filter.format') }}</label>
          <select 
            id="filterFormat" 
            :value="selectedFormat" 
            @change="handleFormatChange"
            class="form-select"
          >
            <option value="">{{ t('common:all') }}</option>
            <option v-for="format in availableFormats" :key="format" :value="format">
              {{ format }}
            </option>
          </select>
        </div>
        
        <div class="col-md-2">
          <label for="filterDrawing" class="form-label">{{ t('sheets:filter.drawing') }}</label>
          <select 
            id="filterDrawing" 
            :value="selectedDrawing" 
            @change="handleDrawingChange"
            class="form-select"
          >
            <option value="">{{ t('common:all') }}</option>
            <option value="WITH_DRAWING">{{ t('sheets:filter.withDrawing') }}</option>
            <option value="WITHOUT_DRAWING">{{ t('sheets:filter.withoutDrawing') }}</option>
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
  searchName: string
  selectedFormat: string
  selectedDrawing: string
  availableFormats: string[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:searchCode': [value: string]
  'update:searchName': [value: string]
  'update:selectedFormat': [value: string]
  'update:selectedDrawing': [value: string]
  'search': []
  'searchByName': []
  'filtersChanged': []
  'clearFilters': []
}>()

const handleFormatChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedFormat', target.value)
  emit('filtersChanged')
}

const handleDrawingChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedDrawing', target.value)
  emit('filtersChanged')
}

const handleSearchCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:searchCode', target.value)
}

const handleSearchNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:searchName', target.value)
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