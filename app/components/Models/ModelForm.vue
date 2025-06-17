<!--
  Comprehensive Model Form Component
  Handles all 11 Model fields with validation, associations, and proper Bootstrap styling
  @version 1.0.0
-->
<template>
  <form @submit.prevent="handleSubmit" class="model-form">
    <!-- Basic Information Section -->
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="card-title mb-0">{{ t('models:form.basicInfo') }}</h6>
      </div>
      <div class="card-body">
        <!-- Row 1: Code and Name -->
        <div class="row">
          <div class="col-md-6">
            <label for="modelCode" class="form-label">
              {{ t('models:form.code') }} <span class="text-danger">*</span>
            </label>
            <input
              id="modelCode"
              v-model="formData.code"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.code }"
              :placeholder="t('models:form.codePlaceholder')"
              required
              @blur="validateField('code')"
            >
            <div v-if="errors.code" class="invalid-feedback">
              {{ errors.code }}
            </div>
          </div>
          
          <div class="col-md-6">
            <label for="modelName" class="form-label">
              {{ t('models:form.name') }} <span class="text-danger">*</span>
            </label>
            <input
              id="modelName"
              v-model="formData.name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.name }"
              :placeholder="t('models:form.namePlaceholder')"
              required
              @blur="validateField('name')"
            >
            <div v-if="errors.name" class="invalid-feedback">
              {{ errors.name }}
            </div>
          </div>
        </div>
        
        <!-- Row 2: Model Type and Instance Type -->
        <div class="row mt-3">
          <div class="col-md-6">
            <label for="modelType" class="form-label">
              {{ t('models:form.type') }} <span class="text-danger">*</span>
            </label>
            <select
              id="modelType"
              v-model="formData.modelType"
              class="form-select"
              :class="{ 'is-invalid': errors.modelType }"
              required
              @change="validateField('modelType')"
            >
              <option value="">{{ t('common:select') }}</option>
              <option value="PART">{{ t('models:types.part') }}</option>
              <option value="ASSEMBLY">{{ t('models:types.assembly') }}</option>
              <option value="DRAWING">{{ t('models:types.drawing') }}</option>
              <option value="FORMAT">{{ t('models:types.format') }}</option>
            </select>
            <div v-if="errors.modelType" class="invalid-feedback">
              {{ errors.modelType }}
            </div>
          </div>
          
          <div class="col-md-6">
            <label for="instanceType" class="form-label">
              {{ t('models:form.instance') }} <span class="text-danger">*</span>
            </label>
            <select
              id="instanceType"
              v-model="formData.instanceType"
              class="form-select"
              :class="{ 'is-invalid': errors.instanceType }"
              required
              @change="validateField('instanceType')"
            >
              <option value="">{{ t('common:select') }}</option>
              <option value="PARAMETRIC">{{ t('models:instances.parametric') }}</option>
              <option value="NORMAL">{{ t('models:instances.normal') }}</option>
              <option value="GENERIC">{{ t('models:instances.generic') }}</option>
              <option value="INSTANCE">{{ t('models:instances.instance') }}</option>
              <option value="BULK">{{ t('models:instances.bulk') }}</option>
            </select>
            <div v-if="errors.instanceType" class="invalid-feedback">
              {{ errors.instanceType }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File and Version Information Section -->
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="card-title mb-0">{{ t('models:form.fileInfo') }}</h6>
      </div>
      <div class="card-body">
        <!-- Row 1: File and Version -->
        <div class="row">
          <div class="col-md-6">
            <label for="fileId" class="form-label">{{ t('models:form.file') }}</label>
            <select
              id="fileId"
              v-model="formData.fileId"
              class="form-select"
              :class="{ 'is-invalid': errors.fileId }"
              @change="validateField('fileId')"
            >
              <option value="">{{ t('models:form.noFile') }}</option>
              <option v-for="file in availableFiles" :key="file.id" :value="file.id">
                {{ file.fileName || file.name }} 
                <span v-if="file.extension" class="text-muted">({{ file.extension }})</span>
              </option>
            </select>
            <div v-if="errors.fileId" class="invalid-feedback">
              {{ errors.fileId }}
            </div>
            <div class="form-text">
              {{ t('models:form.fileHelp') }}
            </div>
          </div>
          
          <div class="col-md-6">
            <label for="versionId" class="form-label">{{ t('models:form.version') }}</label>
            <select
              id="versionId"
              v-model="formData.versionId"
              class="form-select"
              :class="{ 'is-invalid': errors.versionId }"
              @change="validateField('versionId')"
            >
              <option value="">{{ t('models:form.noVersion') }}</option>
              <option v-for="version in availableVersions" :key="version.id" :value="version.id">
                {{ version.versionNumber }} 
                <span v-if="version.active" class="badge bg-success ms-1">{{ t('models:form.active') }}</span>
              </option>
            </select>
            <div v-if="errors.versionId" class="invalid-feedback">
              {{ errors.versionId }}
            </div>
            <div class="form-text">
              {{ t('models:form.versionHelp') }}
            </div>
          </div>
        </div>
        
        <!-- Row 2: Item and Designer -->
        <div class="row mt-3">
          <div class="col-md-6">
            <label for="itemId" class="form-label">{{ t('models:form.item') }}</label>
            <select
              id="itemId"
              v-model="formData.itemId"
              class="form-select"
              :class="{ 'is-invalid': errors.itemId }"
              @change="validateField('itemId')"
            >
              <option value="">{{ t('models:form.noItem') }}</option>
              <option v-for="item in availableItems" :key="item.id" :value="item.id">
                {{ item.itemCode }} - {{ item.itemName }}
                <span v-if="!item.itemActive" class="text-muted">({{ t('models:form.inactive') }})</span>
              </option>
            </select>
            <div v-if="errors.itemId" class="invalid-feedback">
              {{ errors.itemId }}
            </div>
            <div class="form-text">
              {{ t('models:form.itemHelp') }}
            </div>
          </div>
          
          <div class="col-md-6">
            <label for="designerId" class="form-label">{{ t('models:form.designer') }}</label>
            <select
              id="designerId"
              v-model="formData.designerId"
              class="form-select"
              :class="{ 'is-invalid': errors.designerId }"
              @change="validateField('designerId')"
            >
              <option value="">{{ t('models:form.noDesigner') }}</option>
              <option v-for="designer in availableDesigners" :key="designer.id" :value="designer.id">
                {{ designer.firstName }} {{ designer.lastName }}
                <span v-if="designer.email" class="text-muted">({{ designer.email }})</span>
              </option>
            </select>
            <div v-if="errors.designerId" class="invalid-feedback">
              {{ errors.designerId }}
            </div>
            <div class="form-text">
              {{ t('models:form.designerHelp') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Model Associations Section -->
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="card-title mb-0">{{ t('models:form.associations') }}</h6>
      </div>
      <div class="card-body">
        <!-- Row 1: Generic and Parent Models -->
        <div class="row">
          <div class="col-md-6">
            <label for="genericId" class="form-label">{{ t('models:form.generic') }}</label>
            <select
              id="genericId"
              v-model="formData.genericId"
              class="form-select"
              :class="{ 'is-invalid': errors.genericId }"
              @change="validateField('genericId')"
            >
              <option value="">{{ t('models:form.noGeneric') }}</option>
              <option 
                v-for="model in availableGenericModels" 
                :key="model.id" 
                :value="model.id"
                :disabled="model.id === formData.id"
              >
                <span class="badge me-2" :class="getModelBadgeClass(model.modelType)">
                  {{ model.modelType }}
                </span>
                {{ model.code }} - {{ model.name }}
                <span v-if="model.instanceType" class="text-muted ms-1">({{ model.instanceType }})</span>
              </option>
            </select>
            <div v-if="errors.genericId" class="invalid-feedback">
              {{ errors.genericId }}
            </div>
            <div class="form-text">
              {{ t('models:form.genericHelp') }}
            </div>
          </div>
          
          <div class="col-md-6">
            <label for="parentId" class="form-label">{{ t('models:form.parent') }}</label>
            <select
              id="parentId"
              v-model="formData.parentId"
              class="form-select"
              :class="{ 'is-invalid': errors.parentId }"
              @change="validateField('parentId')"
            >
              <option value="">{{ t('models:form.noParent') }}</option>
              <option 
                v-for="model in availableParentModels" 
                :key="model.id" 
                :value="model.id"
                :disabled="model.id === formData.id"
              >
                <span class="badge me-2" :class="getModelBadgeClass(model.modelType)">
                  {{ model.modelType }}
                </span>
                {{ model.code }} - {{ model.name }}
                <span v-if="model.instanceType" class="text-muted ms-1">({{ model.instanceType }})</span>
              </option>
            </select>
            <div v-if="errors.parentId" class="invalid-feedback">
              {{ errors.parentId }}
            </div>
            <div class="form-text">
              {{ t('models:form.parentHelp') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sheet Associations Section (only for PART and ASSEMBLY models) -->
    <div v-if="canHaveSheets" class="card mb-3">
      <div class="card-header">
        <h6 class="card-title mb-0">{{ t('models:form.sheetAssociations') }}</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <label class="form-label">{{ t('models:form.sheets') }}</label>
            <div class="sheets-selection-container">
              <div class="form-text mb-2">
                {{ t('models:form.sheetsHelp') }}
              </div>
              
              <!-- Search box for sheets -->
              <div class="mb-3">
                <input
                  v-model="sheetSearchQuery"
                  type="text"
                  class="form-control form-control-sm"
                  :placeholder="t('models:form.searchSheets')"
                >
              </div>
              
              <!-- Lista di checkbox per i fogli -->
              <div class="sheets-checkbox-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem; padding: 0.75rem;">
                <div class="form-check" v-for="sheet in filteredAvailableSheets" :key="sheet.id">
                  <input
                    :id="`sheet-${sheet.id}`"
                    type="checkbox"
                    class="form-check-input"
                    :value="sheet.id?.toString()"
                    :checked="isSheetSelected(sheet.id?.toString())"
                    @change="toggleSheet"
                  >
                  <label :for="`sheet-${sheet.id}`" class="form-check-label">
                    <span class="badge bg-info me-2">{{ sheet.formatType || 'No Format' }}</span>
                    <strong>{{ sheet.code }}</strong> - {{ sheet.name }}
                    <span v-if="sheet.creoId" class="text-muted ms-1">({{ sheet.creoId }})</span>
                  </label>
                </div>
                
                <div v-if="filteredAvailableSheets.length === 0" class="text-muted text-center py-3">
                  {{ sheetSearchQuery ? t('models:form.noSheetsMatchSearch') : t('models:form.noSheetsAvailable') }}
                </div>
              </div>
              
              <!-- Mostra fogli selezionati -->
              <div v-if="formData.sheetIds.length > 0" class="mt-3">
                <small class="text-muted">{{ t('models:form.selectedSheets') }}:</small>
                <div class="mt-1">
                  <span 
                    v-for="sheetId in formData.sheetIds" 
                    :key="sheetId"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ getSheetDisplay(sheetId) }}
                    <i 
                      class="bi bi-x-circle ms-1" 
                      style="cursor: pointer;"
                      @click="removeSheet(sheetId)"
                      :title="t('models:form.removeSheet')"
                    ></i>
                  </span>
                </div>
              </div>
            </div>
            
            <div v-if="errors.sheetIds" class="invalid-feedback d-block">
              {{ errors.sheetIds }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Form Actions -->
    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')" :disabled="loading">
        {{ t('common:cancel') }}
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? t('common:saving') : (isEditMode ? t('common:update') : t('common:create')) }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Model, type IModel } from '~/model/model.model'
import { type IArchive } from '~/model/archive.model'
import { type IModelVersion } from '~/model/model-version.model'
import { type IItem } from '~/model/item.model'
import { type ISheet } from '~/model/sheet.model'
import { type IAuthor } from '~/model/author.model'
import { ModelType } from '~/model/enumerations/model-type.model'
import { InstanceType } from '~/model/enumerations/instance-type.model'
import { useI18n } from '~/composables/useI18n'
import { useApi } from '~/composables/useApi'

const { t } = useI18n()
const api = useApi()

// Props
interface Props {
  modelData?: IModel | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelData: null,
  loading: false
})

// Emits
const emit = defineEmits<{
  submit: [model: IModel]
  cancel: []
}>()

// Form data
const formData = ref({
  id: null as number | null,
  code: '',
  name: '',
  modelType: '' as keyof typeof ModelType | '',
  instanceType: '' as keyof typeof InstanceType | '',
  fileId: null as number | null,
  versionId: null as number | null,
  itemId: null as number | null,
  designerId: null as number | null,
  genericId: null as number | null,
  parentId: null as number | null,
  instanceId: null as number | null,
  sheetIds: [] as string[]
})

// Validation errors
const errors = ref<Record<string, string>>({})

// Available data for dropdowns
const availableFiles = ref<IArchive[]>([])
const availableVersions = ref<IModelVersion[]>([])
const availableItems = ref<IItem[]>([])
const availableDesigners = ref<IAuthor[]>([]) // AuthorDTO from backend
const availableModels = ref<IModel[]>([])
const availableSheets = ref<ISheet[]>([])

// Sheet search
const sheetSearchQuery = ref('')

// Computed properties
const isEditMode = computed(() => !!props.modelData?.id)

const canHaveSheets = computed(() => {
  return formData.value.modelType === 'PART' || formData.value.modelType === 'ASSEMBLY'
})

const availableGenericModels = computed(() => {
  return availableModels.value.filter(model => 
    model.instanceType === 'GENERIC' && model.id !== formData.value.id
  )
})

const availableParentModels = computed(() => {
  return availableModels.value.filter(model => 
    (model.modelType === 'ASSEMBLY' || model.modelType === 'PART') && 
    model.id !== formData.value.id
  )
})

const filteredAvailableSheets = computed(() => {
  if (!sheetSearchQuery.value) return availableSheets.value
  
  const query = sheetSearchQuery.value.toLowerCase()
  return availableSheets.value.filter(sheet => 
    sheet.code?.toLowerCase().includes(query) ||
    sheet.name?.toLowerCase().includes(query) ||
    sheet.creoId?.toLowerCase().includes(query)
  )
})

const isFormValid = computed(() => {
  return formData.value.code && 
         formData.value.name && 
         formData.value.modelType && 
         formData.value.instanceType &&
         Object.keys(errors.value).length === 0
})

// Methods
const validateField = (fieldName: string) => {
  const model = new Model(
    formData.value.id || undefined,
    formData.value.code || null,
    formData.value.name || null,
    formData.value.modelType || null,
    formData.value.instanceType || null
  )

  // Clear previous error
  delete errors.value[fieldName]

  // Required field validation
  const requiredFields = ['code', 'name', 'modelType', 'instanceType']
  if (requiredFields.includes(fieldName)) {
    const value = (formData.value as any)[fieldName]
    if (!value || value === '') {
      errors.value[fieldName] = t(`models:validation.${fieldName}Required`)
      return false
    }
  }

  // Model-specific validation
  if (fieldName === 'code' && formData.value.code) {
    if (formData.value.code.length < 2) {
      errors.value.code = t('models:validation.codeMinLength')
      return false
    }
  }

  if (fieldName === 'name' && formData.value.name) {
    if (formData.value.name.length < 2) {
      errors.value.name = t('models:validation.nameMinLength')
      return false
    }
  }

  return true
}

const validateForm = () => {
  errors.value = {}
  
  let isValid = true
  const fieldsToValidate = ['code', 'name', 'modelType', 'instanceType']
  
  for (const field of fieldsToValidate) {
    if (!validateField(field)) {
      isValid = false
    }
  }
  
  return isValid
}

const isSheetSelected = (sheetId: string | undefined): boolean => {
  if (!sheetId) return false
  return formData.value.sheetIds.includes(sheetId)
}

const toggleSheet = (event: Event) => {
  const target = event.target as HTMLInputElement
  const sheetId = target.value
  let newSheetIds = [...formData.value.sheetIds]
  
  if (target.checked) {
    if (!newSheetIds.includes(sheetId)) {
      newSheetIds.push(sheetId)
    }
  } else {
    newSheetIds = newSheetIds.filter(id => id !== sheetId)
  }
  
  formData.value.sheetIds = newSheetIds
}

const removeSheet = (sheetId: string) => {
  formData.value.sheetIds = formData.value.sheetIds.filter(id => id !== sheetId)
}

const getSheetDisplay = (sheetId: string): string => {
  const sheet = availableSheets.value.find(s => s.id?.toString() === sheetId)
  return sheet ? `${sheet.code} (${sheet.formatType || 'No Format'})` : `ID: ${sheetId}`
}

const getModelBadgeClass = (modelType: string | undefined): string => {
  switch (modelType) {
    case 'PART':
      return 'bg-primary'
    case 'ASSEMBLY':
      return 'bg-warning text-dark'
    case 'DRAWING':
      return 'bg-success'
    case 'FORMAT':
      return 'bg-info'
    default:
      return 'bg-secondary'
  }
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // Build model object
  const modelData: IModel = {
    id: formData.value.id || undefined,
    code: formData.value.code,
    name: formData.value.name,
    modelType: formData.value.modelType as keyof typeof ModelType,
    instanceType: formData.value.instanceType as keyof typeof InstanceType,
    // Object associations - convert IDs to objects if they exist
    file: formData.value.fileId ? availableFiles.value.find(f => f.id === formData.value.fileId) || null : null,
    version: formData.value.versionId ? availableVersions.value.find(v => v.id === formData.value.versionId) || null : null,
    item: formData.value.itemId ? availableItems.value.find(i => i.id === formData.value.itemId) || null : null,
    generic: formData.value.genericId ? availableModels.value.find(m => m.id === formData.value.genericId) || null : null,
    parent: formData.value.parentId ? availableModels.value.find(m => m.id === formData.value.parentId) || null : null,
    // Sheet associations
    sheets: formData.value.sheetIds.map(id => 
      availableSheets.value.find(s => s.id?.toString() === id)
    ).filter(Boolean) as ISheet[]
  }

  emit('submit', modelData)
}

const loadAvailableData = async () => {
  try {
    // Load available models (for generic/parent relationships)
    const modelsResponse = await api.models.getAll()
    if (modelsResponse.success && modelsResponse.data) {
      availableModels.value = modelsResponse.data
    }

    // Load available sheets (for associations)
    const sheetsResponse = await api.sheets.getAll()
    if (sheetsResponse.success && sheetsResponse.data) {
      availableSheets.value = sheetsResponse.data
    }

    // TODO: Load other available data when APIs are available
    // availableFiles.value = await loadFiles()
    // availableVersions.value = await loadVersions()
    // availableItems.value = await loadItems()
  } catch (error) {
    console.error('[ModelForm] Error loading available data:', error)
  }
}

// Initialize form data when modelData prop changes
watch(() => props.modelData, (newModelData) => {
  if (newModelData) {
    formData.value = {
      id: newModelData.id || null,
      code: newModelData.code || '',
      name: newModelData.name || '',
      modelType: newModelData.modelType || '',
      instanceType: newModelData.instanceType || '',
      fileId: newModelData.file?.id || null,
      versionId: newModelData.version?.id || null,
      itemId: newModelData.item?.id || null,
      genericId: newModelData.generic?.id || null,
      parentId: newModelData.parent?.id || null,
      sheetIds: newModelData.sheets?.map(s => s.id?.toString()).filter(Boolean) as string[] || []
    }
  } else {
    // Reset form for create mode
    formData.value = {
      id: null,
      code: '',
      name: '',
      modelType: '',
      instanceType: '',
      fileId: null,
      versionId: null,
      itemId: null,
      genericId: null,
      parentId: null,
      sheetIds: []
    }
  }
  
  // Clear errors when data changes
  errors.value = {}
}, { immediate: true })

// Load available data on mount
onMounted(() => {
  loadAvailableData()
})
</script>

<style scoped>
.model-form {
  max-width: 100%;
}

.card-title {
  color: var(--bs-primary);
  font-weight: 600;
}

.sheets-selection-container {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
}

.sheets-checkbox-list {
  background-color: white;
}

.sheets-checkbox-list .form-check {
  padding: 0.5rem;
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 0;
}

.sheets-checkbox-list .form-check:last-child {
  border-bottom: none;
}

.sheets-checkbox-list .form-check:hover {
  background-color: #f8f9fa;
}

.sheets-checkbox-list .form-check-label {
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

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.form-text {
  font-size: 0.75rem;
  color: #6c757d;
}

.text-danger {
  color: #dc3545 !important;
}

/* Compact styling integration */
.card-header {
  padding: 0.65rem 0.875rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-body {
  padding: 0.875rem;
}
</style>