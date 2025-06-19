<!--
  Componente per i filtri di ricerca e selezione degli sheet (Versione Ottimizzata)
  @version 1.1.0
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
          <label for="filterDrawing" class="form-label">{{ t('sheets:filter.drawingName') }}</label>
          <select 
            id="filterDrawing" 
            :value="selectedDrawing" 
            @change="handleDrawingChange"
            class="form-select"
          >
            <option value="">{{ t('common:all') }}</option>
            <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
              {{ drawing.name || drawing.code }} ({{ drawing.code }})
            </option>
          </select>
        </div>
        
        <div class="col-md-3">
          <label for="filterModel" class="form-label">{{ t('sheets:filter.modelName') }}</label>
          <select 
            id="filterModel" 
            :value="selectedModel" 
            @change="handleModelChange"
            class="form-select"
          >
            <option value="">{{ t('common:all') }}</option>
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.name || model.code }} ({{ model.modelType }})
            </option>
          </select>
        </div>
        
        <div class="col-md-3 d-flex align-items-end">
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
  selectedDrawing: string
  selectedModel: string
  availableDrawings: any[]
  availableModels: any[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:searchCode': [value: string]
  'update:selectedDrawing': [value: string]
  'update:selectedModel': [value: string]
  'search': []
  'filtersChanged': []
  'clearFilters': []
}>()

const handleDrawingChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedDrawing', target.value)
  emit('filtersChanged')
}

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedModel', target.value)
  emit('filtersChanged')
}

const handleSearchCodeInput = (event: Event) => {
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