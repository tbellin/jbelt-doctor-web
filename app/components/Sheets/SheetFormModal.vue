<!--
  Componente modal per la creazione/modifica di uno sheet
  @version 1.0.0
-->
<template>
  <div 
    class="modal fade" 
    :class="{ show: show }" 
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editingSheet ? t('sheets:modal.edit') : t('sheets:modal.create') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <form @submit.prevent="$emit('save')">
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <label for="sheetCode" class="form-label">{{ t('sheets:form.code') }} *</label>
                <input
                  id="sheetCode"
                  :value="formData.code"
                  @input="updateCode"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.code }"
                  required
                >
                <div v-if="errors.code" class="invalid-feedback">
                  {{ errors.code }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="sheetName" class="form-label">{{ t('sheets:form.name') }} *</label>
                <input
                  id="sheetName"
                  :value="formData.name"
                  @input="updateName"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  required
                >
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>
            </div>
            
            <div class="row mt-3">
              <div class="col-md-6">
                <label for="formatType" class="form-label">{{ t('sheets:form.format') }} *</label>
                <select
                  id="formatType"
                  :value="formData.formatType"
                  @change="updateFormatType"
                  class="form-select"
                  :class="{ 'is-invalid': errors.formatType }"
                  required
                >
                  <option value="">{{ t('common:select') }}</option>
                  <option v-for="format in availableFormats" :key="format" :value="format">
                    {{ format }}
                  </option>
                </select>
                <div v-if="errors.formatType" class="invalid-feedback">
                  {{ errors.formatType }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="creoId" class="form-label">{{ t('sheets:form.creoId') }}</label>
                <input
                  id="creoId"
                  :value="formData.creoId"
                  @input="updateCreoId"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.creoId }"
                >
                <div v-if="errors.creoId" class="invalid-feedback">
                  {{ errors.creoId }}
                </div>
              </div>
            </div>
            
            <div class="row mt-3">
              <div class="col-md-6">
                <label for="drawingId" class="form-label">{{ t('sheets:form.drawing') }}</label>
                <select
                  id="drawingId"
                  :value="formData.drawingId"
                  @change="updateDrawingId"
                  class="form-select"
                  :class="{ 'is-invalid': errors.drawingId }"
                >
                  <option value="">{{ t('sheets:form.noDrawing') }}</option>
                  <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                    {{ drawing.code }} - {{ drawing.name }}
                  </option>
                </select>
                <div v-if="errors.drawingId" class="invalid-feedback">
                  {{ errors.drawingId }}
                </div>
                <div class="form-text">
                  {{ t('sheets:form.drawingHelp') }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="balloon" class="form-label">{{ t('sheets:form.balloon') }}</label>
                <input
                  id="balloon"
                  :value="formData.balloon"
                  @input="updateBalloon"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.balloon }"
                  :placeholder="t('sheets:form.balloonPlaceholder')"
                >
                <div v-if="errors.balloon" class="invalid-feedback">
                  {{ errors.balloon }}
                </div>
                <div class="form-text">
                  {{ t('sheets:form.balloonHelp') }}
                </div>
              </div>
            </div>
            
            <div class="row mt-3">
              <div class="col-12">
                <label for="modelIds" class="form-label">{{ t('sheets:form.models') }}</label>
                <div class="models-selection-container">
                  <div class="form-text mb-2">
                    {{ t('sheets:form.modelsHelp') }}
                  </div>
                  
                  <!-- Lista di checkbox per i modelli PART/ASSEMBLY -->
                  <div class="models-checkbox-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem; padding: 0.75rem;">
                    <div class="form-check" v-for="model in availableModels" :key="model.id">
                      <input
                        :id="`model-${model.id}`"
                        type="checkbox"
                        class="form-check-input"
                        :value="model.id?.toString()"
                        :checked="isModelSelected(model.id?.toString())"
                        @change="toggleModel"
                      >
                      <label :for="`model-${model.id}`" class="form-check-label">
                        <span class="badge me-2" :class="model.modelType === 'PART' ? 'bg-success' : 'bg-info'">
                          {{ model.modelType }}
                        </span>
                        <strong>{{ model.code }}</strong> - {{ model.name }}
                      </label>
                    </div>
                    
                    <div v-if="availableModels.length === 0" class="text-muted text-center py-3">
                      {{ t('sheets:form.noModels') }}
                    </div>
                  </div>
                  
                  <!-- Mostra modelli selezionati -->
                  <div v-if="formData.modelIds.length > 0" class="mt-3">
                    <small class="text-muted">{{ t('sheets:form.selectedModels') }}:</small>
                    <div class="mt-1">
                      <span 
                        v-for="modelId in formData.modelIds" 
                        :key="modelId"
                        class="badge bg-secondary me-1 mb-1"
                      >
                        {{ getModelDisplay(modelId) }}
                        <i 
                          class="bi bi-x-circle ms-1" 
                          style="cursor: pointer;"
                          @click="removeModel(modelId)"
                          :title="t('sheets:form.removeModel')"
                        ></i>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div v-if="errors.modelIds" class="invalid-feedback d-block">
                  {{ errors.modelIds }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              {{ t('common:cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? t('common:saving') : (editingSheet ? t('common:update') : t('common:create')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Backdrop del modal -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { SheetWithRelations } from '~/composables/useApi'
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface FormData {
  code: string
  name: string
  formatType: string
  creoId: string
  drawingId: string
  modelIds: string[]
  balloon: string
}

interface Props {
  show: boolean
  editingSheet?: SheetWithRelations | null
  formData: FormData
  errors: Record<string, string>
  availableFormats: string[]
  availableDrawings: Model[]
  availableModels: Model[]  // Modelli PART/ASSEMBLY
  saving?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'save': []
  'update:formData': [value: FormData]
}>()

const updateCode = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { ...props.formData, code: target.value })
}

const updateName = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { ...props.formData, name: target.value })
}

const updateFormatType = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:formData', { ...props.formData, formatType: target.value })
}

const updateCreoId = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { ...props.formData, creoId: target.value })
}

const updateDrawingId = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:formData', { ...props.formData, drawingId: target.value })
}

const updateBalloon = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { ...props.formData, balloon: target.value })
}

const isModelSelected = (modelId: string | undefined): boolean => {
  if (!modelId) return false
  return props.formData.modelIds.includes(modelId)
}

const toggleModel = (event: Event) => {
  const target = event.target as HTMLInputElement
  const modelId = target.value
  let newModelIds = [...props.formData.modelIds]
  
  console.log('[SheetModal] Toggle model:', modelId, 'checked:', target.checked)
  console.log('[SheetModal] Current modelIds:', props.formData.modelIds)
  
  if (target.checked) {
    if (!newModelIds.includes(modelId)) {
      newModelIds.push(modelId)
      console.log('[SheetModal] Added model ID:', modelId)
    }
  } else {
    newModelIds = newModelIds.filter(id => id !== modelId)
    console.log('[SheetModal] Removed model ID:', modelId)
  }
  
  console.log('[SheetModal] New modelIds array:', newModelIds)
  emit('update:formData', { ...props.formData, modelIds: newModelIds })
}

const removeModel = (modelId: string) => {
  const newModelIds = props.formData.modelIds.filter(id => id !== modelId)
  emit('update:formData', { ...props.formData, modelIds: newModelIds })
}

const getModelDisplay = (modelId: string): string => {
  const model = props.availableModels.find(m => m.id?.toString() === modelId)
  return model ? `${model.code} (${model.modelType})` : `ID: ${modelId}`
}
</script>

<style scoped>
.modal.show {
  background: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Stili per la selezione multipla modelli */
.models-selection-container {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
}

.models-checkbox-list {
  background-color: white;
}

.models-checkbox-list .form-check {
  padding: 0.5rem;
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 0;
}

.models-checkbox-list .form-check:last-child {
  border-bottom: none;
}

.models-checkbox-list .form-check:hover {
  background-color: #f8f9fa;
}

.models-checkbox-list .form-check-label {
  cursor: pointer;
  width: 100%;
  padding-left: 0.5rem;
}

.badge.bg-secondary i {
  font-size: 0.75rem;
}

.badge.bg-secondary i:hover {
  color: #dc3545;
}
</style>