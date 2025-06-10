<!--
  Componente per la lista dei sheet associati a un modello
  @version 1.0.0
-->
<template>
  <div class="sheets-container">
    <div class="sheets-header">
      <h6 class="mb-2">
        <i class="bi bi-file-earmark-text me-2"></i>
        {{ t('models:table.associatedSheets') }}
        <span class="badge bg-secondary ms-2">
          {{ sheets.length }}
        </span>
      </h6>
    </div>
    
    <div v-if="sheets.length === 0" class="text-muted p-3">
      {{ t('models:table.noSheets') }}
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-sm mb-0">
        <thead class="table-light">
          <tr>
            <th>{{ t('models:sheets.table.id') }}</th>
            <th>{{ t('models:sheets.table.code') }}</th>
            <th>{{ t('models:sheets.table.name') }}</th>
            <th>{{ t('models:sheets.table.format') }}</th>
            <th>{{ t('models:sheets.table.relation') }}</th>
            <th>{{ t('models:sheets.table.creoId') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sheet in sheets" :key="sheet.id">
            <td>
              <span class="badge bg-light text-dark">{{ sheet.id }}</span>
            </td>
            <td>
              <code class="text-primary">{{ sheet.code }}</code>
            </td>
            <td>{{ sheet.name }}</td>
            <td>
              <span class="badge bg-info">{{ sheet.formatType }}</span>
            </td>
            <td>
              <span v-if="modelType === 'DRAWING'" class="badge bg-success">
                <i class="bi bi-file-earmark-text me-1"></i>
                {{ t('models:sheets.relation.hasDrawing') }}
              </span>
              <span v-else class="badge bg-warning">
                <i class="bi bi-link me-1"></i>
                {{ t('models:sheets.relation.references') }}
              </span>
            </td>
            <td>
              <code v-if="sheet.creoId" class="text-muted">{{ sheet.creoId }}</code>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Sheet {
  id?: number
  code: string
  name: string
  creoId?: string
  formatType: string
}

interface Props {
  sheets: Sheet[]
  modelType: string
}

defineProps<Props>()
</script>

<style scoped>
.sheets-container {
  padding: 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid var(--bs-primary);
  margin: 0.5rem 0;
}

.sheets-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.sheets-container .table {
  background-color: white;
  border-radius: 0.375rem;
  overflow: hidden;
}

.sheets-container .table th {
  background-color: #e9ecef;
  font-weight: 600;
  font-size: 0.875rem;
}

.sheets-container .table td {
  font-size: 0.875rem;
  vertical-align: middle;
}
</style>