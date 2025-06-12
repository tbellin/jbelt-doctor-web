<!--
  Componente per la tabella principale degli sheet
  @version 1.0.0
-->
<template>
  <div class="card">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">
          {{ t('sheets:list.title') }}
          <span v-if="sheets.length" class="badge bg-secondary ms-2">
            {{ sheets.length }}
          </span>
        </h5>
        <button 
          class="btn btn-sm btn-outline-secondary"
          @click="toggleTableCollapse"
          :title="isTableCollapsed ? t('sheets:table.expandTable') : t('sheets:table.collapseTable')"
        >
          <i class="bi" :class="isTableCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
          {{ isTableCollapsed ? t('sheets:table.show') : t('sheets:table.hide') }}
        </button>
      </div>
    </div>
    
    <div class="card-body collapse-content" v-show="!isTableCollapsed">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t('common:loading') }}</span>
        </div>
        <p class="mt-2 text-muted">{{ t('sheets:loading') }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="$emit('retry')">
          {{ t('common:retry') }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!sheets.length" class="text-center py-5">
        <i class="bi bi-file-earmark-text display-1 text-muted"></i>
        <h4 class="mt-3">{{ t('sheets:empty.title') }}</h4>
        <p class="text-muted">{{ t('sheets:empty.message') }}</p>
        <button class="btn btn-primary" @click="$emit('createFirst')">
          <i class="bi bi-plus-lg me-2"></i>
          {{ t('sheets:actions.createFirst') }}
        </button>
      </div>

      <!-- Tabella con dati -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ t('sheets:table.id') }}</th>
              <th>{{ t('sheets:table.code') }}</th>
              <th>{{ t('sheets:table.name') }}</th>
              <th>{{ t('sheets:table.format') }}</th>
              <th>{{ t('sheets:table.drawing') }}</th>
              <th>{{ t('sheets:table.models') }}</th>
              <th>{{ t('sheets:table.creoId') }}</th>
              <th>{{ t('common:actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sheet in sheets" :key="sheet.id">
              <td>
                <span class="badge bg-light text-dark">{{ sheet.id }}</span>
              </td>
              <td>
                <strong>{{ sheet.code }}</strong>
              </td>
              <td>{{ sheet.name }}</td>
              <td>
                <span class="badge bg-info">{{ sheet.formatType }}</span>
              </td>
              <td>
                <span v-if="getDrawingInfo(sheet.drawing)" class="badge bg-success">
                  <i class="bi bi-image me-1"></i>
                  {{ getDrawingInfo(sheet.drawing) }}
                </span>
                <span v-else class="text-muted">
                  <i class="bi bi-dash-circle me-1"></i>
                  {{ t('sheets:table.noDrawing') }}
                </span>
              </td>
              <td>
                <div v-if="sheet.models && sheet.models.length > 0" class="models-list">
                  <span 
                    v-for="(model, index) in sheet.models" 
                    :key="model.id || index"
                    class="badge me-1 mb-1"
                    :class="getModelBadgeClass(model)"
                  >
                    <i :class="getModelIcon(model)" class="me-1"></i>
                    {{ getModelInfo(model) }}
                  </span>
                </div>
                <span v-else class="text-muted">
                  <i class="bi bi-dash-circle me-1"></i>
                  {{ t('sheets:table.noModels') }}
                </span>
              </td>
              <td>
                <code v-if="sheet.creoId" class="text-muted">{{ sheet.creoId }}</code>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    class="btn btn-outline-primary"
                    @click="$emit('view', sheet)"
                    :title="t('common:view')"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-outline-warning"
                    @click="$emit('edit', sheet)"
                    :title="t('common:edit')"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-outline-danger"
                    @click="$emit('delete', sheet)"
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

      <!-- Paginazione -->
      <nav v-if="totalPages > 1" aria-label="Paginazione sheet">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button 
              class="page-link" 
              @click="$emit('changePage', currentPage - 1)" 
              :disabled="currentPage === 1"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <li 
            v-for="page in visiblePages" 
            :key="page" 
            class="page-item" 
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="$emit('changePage', page)">
              {{ page }}
            </button>
          </li>
          
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button 
              class="page-link" 
              @click="$emit('changePage', currentPage + 1)" 
              :disabled="currentPage === totalPages"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SheetWithRelations } from '~/composables/useApi'
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  sheets: SheetWithRelations[]
  loading?: boolean
  error?: string | null
  currentPage: number
  totalPages: number
  visiblePages: number[]
}

const props = defineProps<Props>()

defineEmits<{
  'view': [sheet: SheetWithRelations]
  'edit': [sheet: SheetWithRelations]
  'delete': [sheet: SheetWithRelations]
  'retry': []
  'createFirst': []
  'changePage': [page: number]
}>()

// Stato del collapse della tabella
const isTableCollapsed = ref(false)

// Metodo per toggle del collapse della tabella
const toggleTableCollapse = () => {
  isTableCollapsed.value = !isTableCollapsed.value
}

const getDrawingInfo = (drawing: Model | number | undefined): string => {
  console.log('[SheetsTable] getDrawingInfo called with:', drawing, 'type:', typeof drawing)
  
  if (!drawing) {
    console.log('[SheetsTable] No drawing found')
    return ''
  }
  
  if (typeof drawing === 'number') {
    console.log('[SheetsTable] Drawing is number:', drawing)
    return `ID: ${drawing}`
  }
  
  if (typeof drawing === 'object') {
    console.log('[SheetsTable] Drawing is object:', drawing)
    
    // Prova diversi campi possibili
    if (drawing.code) {
      console.log('[SheetsTable] Found code:', drawing.code)
      return drawing.code
    }
    
    if (drawing.id) {
      console.log('[SheetsTable] Found ID in object:', drawing.id)
      return `ID: ${drawing.id}`
    }
    
    // Se è un oggetto con struttura diversa
    console.log('[SheetsTable] Object keys:', Object.keys(drawing))
    return `Drawing: ${drawing.id || 'Unknown'}`
  }
  
  console.log('[SheetsTable] Unexpected drawing type:', typeof drawing)
  return ''
}

// Helper functions per i modelli
const getModelInfo = (model: Model | number | undefined): string => {
  if (!model) return ''
  
  if (typeof model === 'number') {
    return `ID: ${model}`
  }
  
  if (typeof model === 'object') {
    // Priorità: code > name > id
    if (model.code) {
      return model.code
    }
    if (model.name) {
      return model.name
    }
    if (model.id) {
      return `ID: ${model.id}`
    }
  }
  
  return String(model)
}

const getModelBadgeClass = (model: Model | number | undefined): string => {
  if (!model || typeof model === 'number') {
    return 'bg-secondary'
  }
  
  if (typeof model === 'object' && model.modelType) {
    switch (model.modelType) {
      case 'PART':
        return 'bg-primary'
      case 'ASSEMBLY':
        return 'bg-warning text-dark'
      case 'DRAWING':
        return 'bg-success'
      default:
        return 'bg-secondary'
    }
  }
  
  return 'bg-secondary'
}

const getModelIcon = (model: Model | number | undefined): string => {
  if (!model || typeof model === 'number') {
    return 'bi bi-question-circle'
  }
  
  if (typeof model === 'object' && model.modelType) {
    switch (model.modelType) {
      case 'PART':
        return 'bi bi-gear'
      case 'ASSEMBLY':
        return 'bi bi-collection'
      case 'DRAWING':
        return 'bi bi-image'
      default:
        return 'bi bi-question-circle'
    }
  }
  
  return 'bi bi-question-circle'
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.table th {
  background-color: var(--bs-light);
  font-weight: 600;
  border-bottom: 2px solid var(--bs-border-color);
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

.pagination .page-link {
  border-color: var(--bs-border-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

/* Animazione per il collapse della tabella */
.collapse-content {
  transition: all 0.3s ease-in-out;
}

/* Stili per la colonna modelli */
.models-list {
  max-width: 200px;
}

.models-list .badge {
  font-size: 0.75em;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;
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

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
  }
  
  .card-header .d-flex {
    flex-direction: column;
    align-items: stretch !important;
  }
  
  .card-header .btn {
    align-self: center;
  }
}
</style>