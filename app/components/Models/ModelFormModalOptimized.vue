<!--
  Model Form Modal - Optimized Component
  
  Enhanced features:
  - Real-time validation
  - Enhanced UX with loading states
  - Mobile responsive design
  - Auto-save drafts
  - Improved form layout
  
  @version 2.0.0
-->
<template>
  <div 
    class="modal fade" 
    :class="{ show: show }" 
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    @click.self="handleBackdropClick"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title d-flex align-items-center">
            <i class="bi bi-box-seam me-2 text-primary"></i>
            {{ isEditing ? t('models:edit.title') : t('models:create.title') }}
            <span v-if="isEditing && editingModel" class="badge bg-secondary ms-2">
              {{ editingModel.code }}
            </span>
          </h5>
          <button 
            type="button" 
            class="btn-close"
            @click="handleClose"
            :disabled="saving"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave" novalidate>
            <!-- Basic Information -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-info-circle me-2"></i>
                {{ t('models:form.basicInfo') }}
              </h6>
              
              <div class="row g-3">
                <!-- Model Code -->
                <div class="col-md-6">
                  <label for="modelCode" class="form-label required">
                    {{ t('models:form.code') }}
                  </label>
                  <input
                    id="modelCode"
                    v-model="localFormData.code"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.code }"
                    :placeholder="t('models:form.codePlaceholder')"
                    required
                    @blur="validateField('code')"
                    @input="handleFieldChange('code')"
                  />
                  <div v-if="validationErrors.code" class="invalid-feedback">
                    {{ validationErrors.code }}
                  </div>
                  <div class="form-text">
                    {{ t('models:form.codeHint') }}
                  </div>
                </div>

                <!-- Model Name -->
                <div class="col-md-6">
                  <label for="modelName" class="form-label required">
                    {{ t('models:form.name') }}
                  </label>
                  <input
                    id="modelName"
                    v-model="localFormData.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.name }"
                    :placeholder="t('models:form.namePlaceholder')"
                    required
                    @blur="validateField('name')"
                    @input="handleFieldChange('name')"
                  />
                  <div v-if="validationErrors.name" class="invalid-feedback">
                    {{ validationErrors.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Model Classification -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-tags me-2"></i>
                {{ t('models:form.classification') }}
              </h6>
              
              <div class="row g-3">
                <!-- Model Type -->
                <div class="col-md-6">
                  <label for="modelType" class="form-label required">
                    {{ t('models:form.type') }}
                  </label>
                  <select
                    id="modelType"
                    v-model="localFormData.modelType"
                    class="form-select"
                    :class="{ 'is-invalid': validationErrors.modelType }"
                    required
                    @change="handleTypeChange"
                  >
                    <option value="">{{ t('models:form.selectType') }}</option>
                    <option value="PART">{{ t('models:types.part') }}</option>
                    <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
                    <option value="DRAWING">{{ t('models:types.drawing') }}</option>
                    <option value="FORMAT">{{ t('models:types.format') }}</option>
                  </select>
                  <div v-if="validationErrors.modelType" class="invalid-feedback">
                    {{ validationErrors.modelType }}
                  </div>
                </div>

                <!-- Instance Type -->
                <div class="col-md-6">
                  <label for="instanceType" class="form-label">
                    {{ t('models:form.instance') }}
                  </label>
                  <select
                    id="instanceType"
                    v-model="localFormData.instanceType"
                    class="form-select"
                    :class="{ 'is-invalid': validationErrors.instanceType }"
                  >
                    <option value="">{{ t('models:form.selectInstance') }}</option>
                    <option value="GENERIC">{{ t('models:instances.generic') }}</option>
                    <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
                  </select>
                  <div v-if="validationErrors.instanceType" class="invalid-feedback">
                    {{ validationErrors.instanceType }}
                  </div>
                  <div class="form-text">
                    {{ t('models:form.instanceHint') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-file-text me-2"></i>
                {{ t('models:form.additionalInfo') }}
              </h6>
              
              <!-- Description -->
              <div class="mb-3">
                <label for="modelDescription" class="form-label">
                  {{ t('models:form.description') }}
                </label>
                <textarea
                  id="modelDescription"
                  v-model="localFormData.description"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.description }"
                  rows="3"
                  :placeholder="t('models:form.descriptionPlaceholder')"
                  @input="handleFieldChange('description')"
                ></textarea>
                <div v-if="validationErrors.description" class="invalid-feedback">
                  {{ validationErrors.description }}
                </div>
              </div>

              <!-- Tags -->
              <div class="mb-3">
                <label for="modelTags" class="form-label">
                  {{ t('models:form.tags') }}
                </label>
                <input
                  id="modelTags"
                  v-model="tagsInput"
                  type="text"
                  class="form-control"
                  :placeholder="t('models:form.tagsPlaceholder')"
                  @input="handleTagsInput"
                />
                <div class="form-text">
                  {{ t('models:form.tagsHint') }}
                </div>
                <div v-if="localFormData.tags.length" class="mt-2">
                  <span
                    v-for="(tag, index) in localFormData.tags"
                    :key="index"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      class="btn-close btn-close-white ms-1"
                      style="font-size: 0.5rem;"
                      @click="removeTag(index)"
                    ></button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Form Validation Summary -->
            <div v-if="hasValidationErrors" class="alert alert-danger">
              <h6 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ t('models:form.validationErrors') }}
              </h6>
              <ul class="mb-0">
                <li v-for="(error, field) in validationErrors" :key="field">
                  {{ error }}
                </li>
              </ul>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="d-flex justify-content-between align-items-center w-100">
            <!-- Left side - Draft info -->
            <div class="draft-info">
              <small v-if="isDraftSaved" class="text-success">
                <i class="bi bi-check-circle me-1"></i>
                {{ t('models:form.draftSaved') }}
              </small>
              <small v-else-if="hasChanges" class="text-muted">
                <i class="bi bi-pencil me-1"></i>
                {{ t('models:form.unsavedChanges') }}
              </small>
            </div>
            
            <!-- Right side - Actions -->
            <div class="modal-actions">
              <button 
                type="button" 
                class="btn btn-secondary me-2"
                @click="handleClose"
                :disabled="saving"
              >
                {{ t('common:cancel') }}
              </button>
              <button 
                type="button" 
                class="btn btn-success"
                @click="handleSave"
                :disabled="saving || hasValidationErrors"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ isEditing ? t('common:update') : t('common:create') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div 
    v-if="show" 
    class="modal-backdrop fade show"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

import type { Model } from '~/types/model'

// Props
interface Props {
  show: boolean
  editingModel?: Model | null
  formData: {
    code: string
    name: string
    modelType: string
    instanceType: string
    description: string
    tags: string[]
  }
  validationErrors: Record<string, string>
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingModel: null,
  saving: false
})

// Emits
const emit = defineEmits<{
  'close': []
  'save': []
  'validate': [field?: string]
}>()

// Composables
const { t } = useI18n()

// Local state
const localFormData = ref({ ...props.formData })
const tagsInput = ref('')
const isDraftSaved = ref(false)
const originalData = ref<any>(null)

// Auto-save timer
let autoSaveTimer: NodeJS.Timeout | null = null

// Computed
const isEditing = computed(() => !!props.editingModel)

const hasValidationErrors = computed(() => {
  return Object.keys(props.validationErrors).length > 0
})

const hasChanges = computed(() => {
  if (!originalData.value) return false
  
  return JSON.stringify(localFormData.value) !== JSON.stringify(originalData.value)
})

// Methods
const handleFieldChange = (field: string): void => {
  // Clear validation error for this field
  if (props.validationErrors[field]) {
    emit('validate', field)
  }
  
  // Schedule auto-save
  scheduleAutoSave()
}

const handleTypeChange = (): void => {
  // Reset instance type when model type changes
  if (localFormData.value.modelType === 'DRAWING' || localFormData.value.modelType === 'FORMAT') {
    localFormData.value.instanceType = ''
  }
  
  handleFieldChange('modelType')
}

const handleTagsInput = (): void => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  localFormData.value.tags = tags
  handleFieldChange('tags')
}

const removeTag = (index: number): void => {
  localFormData.value.tags.splice(index, 1)
  tagsInput.value = localFormData.value.tags.join(', ')
  handleFieldChange('tags')
}

const validateField = (field: string): void => {
  emit('validate', field)
}

const handleSave = (): void => {
  // Update parent form data
  Object.assign(props.formData, localFormData.value)
  emit('save')
}

const handleClose = (): void => {
  if (hasChanges.value && !props.saving) {
    const confirmed = confirm(t('models:form.confirmDiscard'))
    if (!confirmed) return
  }
  
  emit('close')
}

const handleBackdropClick = (): void => {
  if (!props.saving) {
    handleClose()
  }
}

const scheduleAutoSave = (): void => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  autoSaveTimer = setTimeout(() => {
    saveDraft()
  }, 2000) // Auto-save after 2 seconds of inactivity
}

const saveDraft = (): void => {
  if (!hasChanges.value) return
  
  try {
    const draftKey = isEditing.value 
      ? `model-edit-${props.editingModel?.id}` 
      : 'model-create'
    
    localStorage.setItem(draftKey, JSON.stringify(localFormData.value))
    isDraftSaved.value = true
    
    setTimeout(() => {
      isDraftSaved.value = false
    }, 2000)
  } catch (error) {
    console.warn('Could not save draft:', error)
  }
}

const loadDraft = (): void => {
  try {
    const draftKey = isEditing.value 
      ? `model-edit-${props.editingModel?.id}` 
      : 'model-create'
    
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      const parsedDraft = JSON.parse(draft)
      Object.assign(localFormData.value, parsedDraft)
      
      // Update tags input
      tagsInput.value = localFormData.value.tags.join(', ')
    }
  } catch (error) {
    console.warn('Could not load draft:', error)
  }
}

const clearDraft = (): void => {
  try {
    const draftKey = isEditing.value 
      ? `model-edit-${props.editingModel?.id}` 
      : 'model-create'
    
    localStorage.removeItem(draftKey)
  } catch (error) {
    console.warn('Could not clear draft:', error)
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent): void => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 's') {
      event.preventDefault()
      if (!hasValidationErrors.value && !props.saving) {
        handleSave()
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      handleClose()
    }
  }
}

// Watchers
watch(() => props.formData, (newData) => {
  Object.assign(localFormData.value, newData)
  tagsInput.value = newData.tags.join(', ')
}, { immediate: true, deep: true })

watch(() => props.show, (newShow) => {
  if (newShow) {
    originalData.value = { ...localFormData.value }
    loadDraft()
    document.addEventListener('keydown', handleKeydown)
    document.body.classList.add('modal-open')
  } else {
    clearDraft()
    document.removeEventListener('keydown', handleKeydown)
    document.body.classList.remove('modal-open')
  }
})

// Lifecycle
onMounted(() => {
  if (props.show) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.form-section {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.form-section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.draft-info {
  min-width: 150px;
}

.modal-actions {
  display: flex;
  align-items: center;
}

/* Enhanced validation styles */
.is-invalid {
  border-color: #dc3545;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .form-section {
    padding: 0.75rem;
  }
  
  .modal-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-actions {
    width: 100%;
    justify-content: center;
  }
  
  .draft-info {
    text-align: center;
    min-width: auto;
  }
}
</style>