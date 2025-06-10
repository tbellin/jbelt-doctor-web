<!--
  Componente modal per la creazione/modifica di un modello
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
            {{ editingModel ? t('models:modal.edit') : t('models:modal.create') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <form @submit.prevent="$emit('save')">
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <label for="modelCode" class="form-label">{{ t('models:form.code') }} *</label>
                <input
                  id="modelCode"
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
                <label for="modelName" class="form-label">{{ t('models:form.name') }} *</label>
                <input
                  id="modelName"
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
                <label for="modelType" class="form-label">{{ t('models:form.type') }} *</label>
                <select
                  id="modelType"
                  :value="formData.modelType"
                  @change="updateModelType"
                  class="form-select"
                  :class="{ 'is-invalid': errors.modelType }"
                  required
                >
                  <option value="">{{ t('common:select') }}</option>
                  <option value="PART">{{ t('models:types.part') }}</option>
                  <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
                  <option value="DRAWING">{{ t('models:types.drawing') }}</option>
                </select>
                <div v-if="errors.modelType" class="invalid-feedback">
                  {{ errors.modelType }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="instanceType" class="form-label">{{ t('models:form.instance') }} *</label>
                <select
                  id="instanceType"
                  :value="formData.instanceType"
                  @change="updateInstanceType"
                  class="form-select"
                  :class="{ 'is-invalid': errors.instanceType }"
                  required
                >
                  <option value="">{{ t('common:select') }}</option>
                  <option value="NORMAL">{{ t('models:instances.normal') }}</option>
                  <option value="GENERIC">{{ t('models:instances.generic') }}</option>
                  <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
                </select>
                <div v-if="errors.instanceType" class="invalid-feedback">
                  {{ errors.instanceType }}
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
              {{ saving ? t('common:saving') : (editingModel ? t('common:update') : t('common:create')) }}
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
import type { Model } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface FormData {
  code: string
  name: string
  modelType: string
  instanceType: string
}

interface Props {
  show: boolean
  editingModel?: Model | null
  formData: FormData
  errors: Record<string, string>
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

const updateModelType = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:formData', { ...props.formData, modelType: target.value })
}

const updateInstanceType = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:formData', { ...props.formData, instanceType: target.value })
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
</style>