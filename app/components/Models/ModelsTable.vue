<!--
  Componente per la tabella principale dei modelli con righe espandibili
  @version 1.0.0
-->
<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        {{ t('models:list.title') }}
        <span v-if="models.length" class="badge bg-secondary ms-2">
          {{ models.length }}
        </span>
      </h5>
    </div>
    
    <div class="card-body">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t('common:loading') }}</span>
        </div>
        <p class="mt-2 text-muted">{{ t('models:loading') }}</p>
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
      <div v-else-if="!models.length" class="text-center py-5">
        <i class="bi bi-box-seam display-1 text-muted"></i>
        <h4 class="mt-3">{{ t('models:empty.title') }}</h4>
        <p class="text-muted">{{ t('models:empty.message') }}</p>
        <button class="btn btn-primary" @click="$emit('createFirst')">
          <i class="bi bi-plus-lg me-2"></i>
          {{ t('models:actions.createFirst') }}
        </button>
      </div>

      <!-- Tabella con dati -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th style="width: 50px;"></th>
              <th>{{ t('models:table.id') }}</th>
              <th>{{ t('models:table.code') }}</th>
              <th>{{ t('models:table.name') }}</th>
              <th>{{ t('models:table.type') }}</th>
              <th>{{ t('models:table.instance') }}</th>
              <th>{{ t('common:actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="model in models" :key="model.id">
              <!-- Riga principale del modello -->
              <tr>
                <td>
                  <button 
                    class="btn btn-sm btn-link p-0"
                    @click="$emit('toggleExpansion', model)"
                    :title="isExpanded(model.id || 0) ? t('models:table.collapse') : t('models:table.expand')"
                  >
                    <i 
                      class="bi" 
                      :class="isExpanded(model.id || 0) ? 'bi-chevron-down' : 'bi-chevron-right'"
                    ></i>
                  </button>
                </td>
                <td>
                  <span class="badge bg-light text-dark">{{ model.id }}</span>
                </td>
                <td>
                  <strong>{{ model.code }}</strong>
                </td>
                <td>{{ model.name }}</td>
                <td>
                  <span class="badge" :class="getTypeClass(model.modelType)">
                    <i :class="getTypeIcon(model.modelType)" class="me-1"></i>
                    {{ t(`models:types.${model.modelType.toLowerCase()}`) }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-secondary">
                    {{ t(`models:instances.${model.instanceType.toLowerCase()}`) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      class="btn btn-outline-primary"
                      @click="$emit('view', model)"
                      :title="t('common:view')"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-outline-warning"
                      @click="$emit('edit', model)"
                      :title="t('common:edit')"
                    >
                      <i class="bi bi-pencil"></i>
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
              
              <!-- Riga espandibile per i sheet associati -->
              <tr v-if="isExpanded(model.id || 0)" class="expanded-row">
                <td></td>
                <td colspan="6" class="p-0">
                  <ModelSheetsList 
                    :sheets="getModelSheets(model.id || 0)"
                    :model-type="model.modelType"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Paginazione -->
      <nav v-if="totalPages > 1" aria-label="Paginazione modelli">
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
import type { Model } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'
import ModelSheetsList from './ModelSheetsList.vue'

const { t } = useI18n()

interface Props {
  models: Model[]
  loading?: boolean
  error?: string | null
  expandedRows: Set<number>
  modelSheets: Record<number, any[]>
  currentPage: number
  totalPages: number
  visiblePages: number[]
}

const props = defineProps<Props>()

defineEmits<{
  'toggleExpansion': [model: Model]
  'view': [model: Model]
  'edit': [model: Model]
  'delete': [model: Model]
  'retry': []
  'createFirst': []
  'changePage': [page: number]
}>()

const isExpanded = (modelId: number): boolean => {
  return props.expandedRows.has(modelId)
}

const getModelSheets = (modelId: number): any[] => {
  return props.modelSheets[modelId] || []
}

const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    'PART': 'bg-success',
    'ASSEMBLY': 'bg-info',
    'DRAWING': 'bg-warning'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'PART': 'bi-gear',
    'ASSEMBLY': 'bi-diagram-3',
    'DRAWING': 'bi-file-earmark-text'
  }
  return icons[type] || 'bi-box-seam'
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

.expanded-row {
  background-color: var(--bs-light);
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
}
</style>