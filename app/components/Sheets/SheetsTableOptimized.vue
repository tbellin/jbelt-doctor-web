<!--
  Componente per la tabella principale degli sheet (Versione Ottimizzata)
  @version 1.1.0
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

      <!-- Data table -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">{{ t('sheets:table.code') }}</th>
              <th scope="col">{{ t('sheets:table.drawing') }}</th>
              <th scope="col">{{ t('sheets:table.models') }}</th>
              <th scope="col">{{ t('sheets:table.format') }}</th>
              <th scope="col" class="text-center">{{ t('common:actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sheet in sheets" :key="sheet.id">
              <td>
                <code class="text-primary">{{ sheet.code }}</code>
              </td>
              <td>
                <span v-if="sheet.drawing">
                  {{ sheet.drawing.name || sheet.drawing.code }}
                </span>
                <span v-else class="text-muted">{{ t('common:notSet') }}</span>
              </td>
              <td>
                <div v-if="sheet.models && sheet.models.length" class="d-flex flex-wrap gap-1">
                  <span 
                    v-for="model in sheet.models.slice(0, 3)" 
                    :key="model.id"
                    class="badge bg-light text-dark"
                  >
                    {{ model.code }}
                  </span>
                  <span 
                    v-if="sheet.models.length > 3"
                    class="badge bg-secondary"
                  >
                    +{{ sheet.models.length - 3 }}
                  </span>
                </div>
                <span v-else class="text-muted">{{ t('common:none') }}</span>
              </td>
              <td>
                <span v-if="sheet.format" class="badge bg-info">
                  {{ sheet.format.name }}
                </span>
                <span v-else class="text-muted">{{ t('common:notSet') }}</span>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    class="btn btn-outline-secondary"
                    @click="$emit('view', sheet)"
                    :title="t('common:view')"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-outline-primary"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import type { Sheet } from '~/types/sheet'

const { t } = useI18n()

interface Props {
  sheets: Sheet[]
  loading?: boolean
  error?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'view': [sheet: Sheet]
  'edit': [sheet: Sheet]
  'delete': [sheet: Sheet]
  'createFirst': []
  'retry': []
}>()

// Stato del collapse della tabella
const isTableCollapsed = ref(false)

// Metodo per toggle del collapse della tabella
const toggleTableCollapse = () => {
  isTableCollapsed.value = !isTableCollapsed.value
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

/* Animazione per il collapse della tabella */
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

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.btn-group-sm .btn {
  transition: all 0.2s ease;
}

.btn-group-sm .btn:hover {
  transform: translateY(-1px);
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
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.25rem 0.4rem;
  }
}
</style>