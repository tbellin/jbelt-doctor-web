<template>
  <div class="sheet-form">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          {{ mode === 'create' ? t('sheets:form.create_title') : t('sheets:form.edit_title') }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Basic Information Section -->
          <div class="row">
            <!-- Hidden ID field for edit mode -->
            <input v-if="mode === 'edit'" type="hidden" v-model="formData.id">
            
            <!-- Creo ID -->
            <div class="col-md-6 mb-2">
              <label for="creoId" class="form-label">
                {{ t('sheets:form.fields.creoId.label') }}
              </label>
              <input
                id="creoId"
                v-model="formData.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.creoId }"
                :placeholder="t('sheets:form.fields.creoId.placeholder')"
              >
              <div v-if="errors.creoId" class="invalid-feedback">
                {{ errors.creoId }}
              </div>
            </div>

            <!-- Code -->
            <div class="col-md-6 mb-2">
              <label for="code" class="form-label">
                {{ t('sheets:form.fields.code.label') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="code"
                v-model="formData.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
                :placeholder="t('sheets:form.fields.code.placeholder')"
                required
              >
              <div v-if="errors.code" class="invalid-feedback">
                {{ errors.code }}
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Name -->
            <div class="col-md-6 mb-2">
              <label for="name" class="form-label">
                {{ t('sheets:form.fields.name.label') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
                :placeholder="t('sheets:form.fields.name.placeholder')"
                required
              >
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Format Type -->
            <div class="col-md-6 mb-2">
              <label for="formatType" class="form-label">
                {{ t('sheets:form.fields.formatType.label') }}
                <span class="text-danger">*</span>
              </label>
              <select
                id="formatType"
                v-model="formData.formatType"
                class="form-select"
                :class="{ 'is-invalid': errors.formatType, 'is-valid': !errors.formatType && formData.formatType }"
                required
              >
                <option value="">{{ t('sheets:form.fields.formatType.placeholder') }}</option>
                <option v-for="dinType in dinTypes" :key="dinType" :value="dinType">
                  {{ dinType }}
                </option>
              </select>
              <div v-if="errors.formatType" class="invalid-feedback">
                {{ errors.formatType }}
              </div>
            </div>
          </div>

          <!-- Associations Section -->
          <div class="row">
            <!-- Format -->
            <div class="col-md-6 mb-2">
              <label for="format" class="form-label">
                {{ t('sheets:form.fields.format.label') }}
              </label>
              <select
                id="format"
                v-model="formData.formatId"
                class="form-select"
                :class="{ 'is-invalid': errors.format }"
                :disabled="loading.formats"
              >
                <option value="">{{ t('sheets:form.fields.format.placeholder') }}</option>
                <option v-for="format in availableFormats" :key="format.id" :value="format.id">
                  {{ format.code }} - {{ format.name }} ({{ format.formatType }})
                </option>
              </select>
              <div v-if="loading.formats" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.format" class="invalid-feedback">
                {{ errors.format }}
              </div>
            </div>

            <!-- Drawing Model -->
            <div class="col-md-6 mb-2">
              <label for="drawing" class="form-label">
                {{ t('sheets:form.fields.drawing.label') }}
              </label>
              <select
                id="drawing"
                v-model="formData.drawingId"
                class="form-select"
                :class="{ 'is-invalid': errors.drawing }"
                :disabled="loading.models"
              >
                <option value="">{{ t('sheets:form.fields.drawing.placeholder') }}</option>
                <option v-for="model in drawingModels" :key="model.id" :value="model.id">
                  {{ model.code }} - {{ model.name }} ({{ model.modelType }})
                </option>
              </select>
              <div v-if="loading.models" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.drawing" class="invalid-feedback">
                {{ errors.drawing }}
              </div>
            </div>
          </div>

          <!-- Associated Models Section -->
          <div class="row">
            <div class="col-12 mb-2">
              <label for="models" class="form-label">
                {{ t('sheets:form.fields.models.label') }}
              </label>
              
              <!-- Model Search -->
              <div class="mb-2">
                <input
                  v-model="modelSearch"
                  type="text"
                  class="form-control"
                  :placeholder="t('sheets:form.fields.models.search_placeholder')"
                  :disabled="loading.models"
                >
              </div>

              <!-- Selected Models -->
              <div v-if="selectedModels.length > 0" class="mb-2">
                <small class="text-muted">{{ t('sheets:form.fields.models.selected') }}: {{ selectedModels.length }}</small>
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="model in selectedModels"
                    :key="model.id"
                    class="badge bg-primary"
                  >
                    {{ model.code }}
                    <button
                      type="button"
                      class="btn-close btn-close-white ms-1"
                      @click="removeModel(model.id!)"
                      :aria-label="t('sheets:form.fields.models.remove_model')"
                    ></button>
                  </span>
                </div>
              </div>

              <!-- Available Models -->
              <div class="border rounded" style="max-height: 200px; overflow-y: auto;">
                <div v-if="loading.models" class="p-3 text-center">
                  <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
                </div>
                <div v-else-if="filteredModels.length === 0" class="p-3 text-center text-muted">
                  {{ t('sheets:form.fields.models.no_models') }}
                </div>
                <div v-else>
                  <div
                    v-for="model in filteredModels"
                    :key="model.id"
                    class="border-bottom p-2 cursor-pointer"
                    :class="{ 'bg-light': selectedModelIds.includes(model.id!) }"
                    @click="toggleModel(model)"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ model.code }}</strong> - {{ model.name }}
                        <small class="text-muted d-block">{{ model.modelType }}</small>
                      </div>
                      <input
                        type="checkbox"
                        :checked="selectedModelIds.includes(model.id!)"
                        @change="toggleModel(model)"
                      >
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="errors.models" class="invalid-feedback d-block">
                {{ errors.models }}
              </div>
            </div>
          </div>

          <!-- Validation Summary -->
          <div v-if="validationSummary.length > 0" class="alert alert-warning">
            <h6>{{ t('sheets:form.validation.summary_title') }}</h6>
            <ul class="mb-0">
              <li v-for="error in validationSummary" :key="error">{{ error }}</li>
            </ul>
          </div>

          <!-- Form Actions -->
          <div class="d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="$emit('cancel')"
              :disabled="loading.submit"
            >
              {{ t('common:cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid || loading.submit"
            >
              <span v-if="loading.submit" class="spinner-border spinner-border-sm me-2"></span>
              {{ mode === 'create' ? t('common:create') : t('common:update') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { type ISheet, Sheet } from '~/model/sheet.model'
import { type IModel } from '~/model/model.model'
import { type IFormat } from '~/model/format.model'
import { DIN } from '~/model/enumerations/din.model'

// Composables
const { t } = useI18n('sheets')
const { $api } = useNuxtApp()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: ISheet
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  initialData: undefined
})

// Emits
const emit = defineEmits<{
  submit: [sheet: ISheet]
  cancel: []
}>()

// Reactive Data
const formData = ref<ISheet>({
  id: undefined,
  creoId: null,
  code: null,
  name: null,
  formatType: null,
  format: null,
  drawing: null,
  models: null
})

const errors = ref<Record<string, string>>({})
const loading = ref({
  submit: false,
  models: false,
  formats: false
})

const availableModels = ref<IModel[]>([])
const availableFormats = ref<IFormat[]>([])
const modelSearch = ref('')

// Computed
const dinTypes = computed(() => Object.values(DIN))

const drawingModels = computed(() => 
  availableModels.value.filter(model => model.modelType === 'DRAWING')
)

const selectedModelIds = computed(() => 
  formData.value.models?.map(m => m.id).filter(id => id !== undefined) || []
)

const selectedModels = computed(() => 
  availableModels.value.filter(model => selectedModelIds.value.includes(model.id!))
)

const filteredModels = computed(() => {
  if (!modelSearch.value) return availableModels.value
  const search = modelSearch.value.toLowerCase()
  return availableModels.value.filter(model => 
    model.code?.toLowerCase().includes(search) ||
    model.name?.toLowerCase().includes(search) ||
    model.modelType?.toLowerCase().includes(search)
  )
})

const validationSummary = computed(() => {
  return Object.values(errors.value).filter(Boolean)
})

const isFormValid = computed(() => {
  return validateForm() && validationSummary.value.length === 0
})

// Separate IDs for form binding
const formDataFormatId = computed({
  get: () => formData.value.format?.id,
  set: (value) => {
    if (value) {
      const format = availableFormats.value.find(f => f.id === value)
      formData.value.format = format || null
    } else {
      formData.value.format = null
    }
  }
})

const formDataDrawingId = computed({
  get: () => formData.value.drawing?.id,
  set: (value) => {
    if (value) {
      const drawing = availableModels.value.find(m => m.id === value)
      formData.value.drawing = drawing || null
    } else {
      formData.value.drawing = null
    }
  }
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.code?.trim()) {
    errors.value.code = t('sheets:form.validation.code_required')
  }
  
  if (!formData.value.name?.trim()) {
    errors.value.name = t('sheets:form.validation.name_required')
  }
  
  if (!formData.value.formatType) {
    errors.value.formatType = t('sheets:form.validation.formatType_required')
  }
  
  // Use Sheet class validation
  const sheet = new Sheet(
    formData.value.id,
    formData.value.creoId,
    formData.value.code,
    formData.value.name,
    formData.value.formatType,
    formData.value.format,
    formData.value.drawing,
    formData.value.models
  )
  
  if (props.mode === 'create' && !sheet.isValidForCreate()) {
    errors.value.form = t('sheets:form.validation.invalid_for_create')
  }
  
  if (props.mode === 'edit' && !sheet.isValidForUpdate()) {
    errors.value.form = t('sheets:form.validation.invalid_for_update')
  }
  
  return Object.keys(errors.value).length === 0
}

const loadModels = async () => {
  loading.value.models = true
  try {
    // Mock data - replace with actual API call
    availableModels.value = [
      { id: 1, code: 'DRW001', name: 'Main Assembly Drawing', modelType: 'DRAWING' },
      { id: 2, code: 'PRT001', name: 'Main Part', modelType: 'PART' },
      { id: 3, code: 'ASM001', name: 'Main Assembly', modelType: 'ASSEMBLY' }
    ]
  } catch (error) {
    console.error('Error loading models:', error)
  } finally {
    loading.value.models = false
  }
}

const loadFormats = async () => {
  loading.value.formats = true
  try {
    // Mock data - replace with actual API call
    availableFormats.value = [
      { id: 1, code: 'FMT_A4V', name: 'A4 Vertical Format', formatType: 'A4V' },
      { id: 2, code: 'FMT_A4O', name: 'A4 Horizontal Format', formatType: 'A4O' },
      { id: 3, code: 'FMT_A3V', name: 'A3 Vertical Format', formatType: 'A3V' }
    ]
  } catch (error) {
    console.error('Error loading formats:', error)
  } finally {
    loading.value.formats = false
  }
}

const toggleModel = (model: IModel) => {
  if (!formData.value.models) {
    formData.value.models = []
  }
  
  const index = formData.value.models.findIndex(m => m.id === model.id)
  if (index > -1) {
    formData.value.models.splice(index, 1)
  } else {
    formData.value.models.push(model)
  }
}

const removeModel = (modelId: number) => {
  if (formData.value.models) {
    formData.value.models = formData.value.models.filter(m => m.id !== modelId)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value.submit = true
  try {
    const sheet = new Sheet(
      formData.value.id,
      formData.value.creoId,
      formData.value.code,
      formData.value.name,
      formData.value.formatType,
      formData.value.format,
      formData.value.drawing,
      formData.value.models
    )
    
    emit('submit', sheet.toCleanObject(true))
  } catch (error) {
    console.error('Error submitting form:', error)
    errors.value.form = t('sheets:form.validation.submit_error')
  } finally {
    loading.value.submit = false
  }
}

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadModels()
  loadFormats()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: var(--bs-light) !important;
}

.badge .btn-close {
  font-size: 0.6rem;
}
</style>