<!--
  Model Details Expansion - Component for expanded row content
  
  Features:
  - Shows associated sheets
  - Model relationships
  - Quick actions
  - Performance optimized
  
  @version 1.0.0
-->
<template>
  <div class="model-details-expansion">
    <div class="expansion-tabs">
      <ul class="nav nav-tabs nav-tabs-sm" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link"
            :class="{ active: activeTab === 'sheets' }"
            @click="activeTab = 'sheets'"
            type="button"
          >
            <i class="bi bi-file-earmark-text me-1"></i>
            {{ t('models:details.sheets') }}
            <span class="badge bg-secondary ms-1">{{ modelSheets.length }}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link"
            :class="{ active: activeTab === 'info' }"
            @click="activeTab = 'info'"
            type="button"
          >
            <i class="bi bi-info-circle me-1"></i>
            {{ t('models:details.info') }}
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link"
            :class="{ active: activeTab === 'relations' }"
            @click="activeTab = 'relations'"
            type="button"
          >
            <i class="bi bi-diagram-3 me-1"></i>
            {{ t('models:details.relations') }}
          </button>
        </li>
      </ul>
    </div>

    <div class="expansion-content">
      <!-- Sheets Tab -->
      <div v-if="activeTab === 'sheets'" class="tab-content-sheets">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span class="ms-2">{{ t('models:details.loadingSheets') }}</span>
        </div>
        
        <div v-else-if="!modelSheets.length" class="empty-state text-center py-3">
          <i class="bi bi-file-earmark-x text-muted mb-2" style="font-size: 2rem;"></i>
          <p class="text-muted mb-3">{{ t('models:details.noSheets') }}</p>
          <button class="btn btn-sm btn-outline-primary" @click="handleCreateSheet">
            <i class="bi bi-plus me-1"></i>
            {{ t('models:details.createSheet') }}
          </button>
        </div>
        
        <div v-else class="sheets-list">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('sheets:table.code') }}</th>
                  <th>{{ t('sheets:table.name') }}</th>
                  <th>{{ t('sheets:table.format') }}</th>
                  <th style="width: 100px;">{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sheet in modelSheets" :key="sheet.id">
                  <td>
                    <span class="fw-semibold">{{ sheet.code }}</span>
                  </td>
                  <td>{{ sheet.name }}</td>
                  <td>
                    <span class="badge bg-info">{{ sheet.formatType }}</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="viewSheet(sheet)"
                        :title="t('common:view')"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeAssociation(sheet)"
                        :title="t('models:details.removeAssociation')"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Info Tab -->
      <div v-if="activeTab === 'info'" class="tab-content-info">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="info-group">
              <label class="form-label fw-semibold">{{ t('models:details.basicInfo') }}</label>
              <div class="info-content">
                <div class="info-item">
                  <span class="info-label">{{ t('models:form.code') }}:</span>
                  <span class="info-value">{{ model.code }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ t('models:form.name') }}:</span>
                  <span class="info-value">{{ model.name || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ t('models:form.type') }}:</span>
                  <span class="badge" :class="getTypeClass(model.modelType)">
                    {{ t(`models:types.${model.modelType?.toLowerCase()}`) }}
                  </span>
                </div>
                <div v-if="model.instanceType" class="info-item">
                  <span class="info-label">{{ t('models:form.instance') }}:</span>
                  <span class="badge bg-secondary">
                    {{ t(`models:instances.${model.instanceType.toLowerCase()}`) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="info-group">
              <label class="form-label fw-semibold">{{ t('models:details.additionalInfo') }}</label>
              <div class="info-content">
                <div v-if="model.description" class="info-item">
                  <span class="info-label">{{ t('models:form.description') }}:</span>
                  <span class="info-value">{{ model.description }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ t('models:details.sheetsCount') }}:</span>
                  <span class="info-value">{{ modelSheets.length }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ t('models:details.lastModified') }}:</span>
                  <span class="info-value text-muted">
                    {{ formatDate(model.lastModifiedDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Relations Tab -->
      <div v-if="activeTab === 'relations'" class="tab-content-relations">
        <div class="relations-section">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            {{ t('models:details.relationsInfo') }}
          </div>
          
          <!-- Parent Models -->
          <div v-if="model.parentModels && model.parentModels.length" class="relation-group mb-3">
            <h6 class="fw-semibold">
              <i class="bi bi-arrow-up me-2"></i>
              {{ t('models:details.parentModels') }}
            </h6>
            <div class="relation-items">
              <span 
                v-for="parent in model.parentModels" 
                :key="parent.id"
                class="badge bg-primary me-1 mb-1"
              >
                {{ parent.code }}
              </span>
            </div>
          </div>
          
          <!-- Child Models -->
          <div v-if="model.childModels && model.childModels.length" class="relation-group mb-3">
            <h6 class="fw-semibold">
              <i class="bi bi-arrow-down me-2"></i>
              {{ t('models:details.childModels') }}
            </h6>
            <div class="relation-items">
              <span 
                v-for="child in model.childModels" 
                :key="child.id"
                class="badge bg-success me-1 mb-1"
              >
                {{ child.code }}
              </span>
            </div>
          </div>
          
          <!-- Generic/Instance Relations -->
          <div v-if="model.instanceType === 'INSTANCE' && model.genericModel" class="relation-group mb-3">
            <h6 class="fw-semibold">
              <i class="bi bi-link me-2"></i>
              {{ t('models:details.genericModel') }}
            </h6>
            <div class="relation-items">
              <span class="badge bg-warning">
                {{ model.genericModel.code }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Footer -->
    <div class="expansion-footer">
      <div class="d-flex justify-content-between align-items-center">
        <div class="quick-info">
          <small class="text-muted">
            {{ t('models:details.id') }}: {{ model.id }}
          </small>
        </div>
        <div class="quick-actions">
          <button 
            class="btn btn-sm btn-outline-primary me-2"
            @click="handleEditModel"
          >
            <i class="bi bi-pencil me-1"></i>
            {{ t('common:edit') }}
          </button>
          <button 
            class="btn btn-sm btn-outline-success"
            @click="handleAddSheet"
          >
            <i class="bi bi-plus me-1"></i>
            {{ t('models:details.addSheet') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'

import type { Model } from '~/types/model'

// Props
interface Props {
  model: Model
  modelSheets: any[]
  loading?: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'associations-updated': [model: Model]
}>()

// Composables
const { t } = useI18n()

// Local state
const activeTab = ref('sheets')

// Methods
const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    'PART': 'bg-success',
    'ASSEMBLY': 'bg-warning',
    'DRAWING': 'bg-info',
    'FORMAT': 'bg-secondary'
  }
  return classes[type] || 'bg-secondary'
}

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '-'
  
  try {
    const d = new Date(date)
    return d.toLocaleDateString()
  } catch {
    return '-'
  }
}

const viewSheet = (sheet: any): void => {
  // Navigate to sheet view or emit event
  console.log('View sheet:', sheet)
}

const removeAssociation = (sheet: any): void => {
  const confirmed = confirm(t('models:details.confirmRemoveAssociation'))
  if (confirmed) {
    // Remove association logic
    console.log('Remove association:', sheet)
    emit('associations-updated', props.model)
  }
}

const handleCreateSheet = (): void => {
  // Create new sheet for this model
  console.log('Create sheet for model:', props.model)
}

const handleEditModel = (): void => {
  // Edit current model
  console.log('Edit model:', props.model)
}

const handleAddSheet = (): void => {
  // Add existing sheet to model
  console.log('Add sheet to model:', props.model)
}
</script>

<style scoped>
.model-details-expansion {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.expansion-tabs .nav-tabs {
  border-bottom: 1px solid #dee2e6;
  background-color: #ffffff;
  border-radius: 0.375rem 0.375rem 0 0;
}

.expansion-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-size: 0.875rem;
}

.expansion-tabs .nav-link.active {
  background-color: #f8f9fa;
  color: #495057;
  border-bottom: 2px solid #0d6efd;
}

.expansion-content {
  padding: 1rem;
  background-color: #ffffff;
}

.info-group {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
  height: 100%;
}

.info-content {
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 100px;
}

.info-value {
  color: #495057;
  word-break: break-word;
}

.relation-group {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
}

.relation-items {
  margin-top: 0.5rem;
}

.expansion-footer {
  border-top: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0 0 0.375rem 0.375rem;
}

.empty-state {
  padding: 2rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .expansion-tabs .nav-link {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .expansion-content {
    padding: 0.75rem;
  }
  
  .info-group {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .expansion-footer {
    padding: 0.5rem;
  }
  
  .expansion-footer .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .quick-actions {
    width: 100%;
  }
  
  .quick-actions .btn {
    width: 48%;
  }
}
</style>