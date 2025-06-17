<template>
  <EntityForm
    :mode="mode"
    entity-name="Format"
    :initial-data="initialData"
    :validation-rules="validationRules"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <template #default="{ formData, errors, loading, validateField }">
      <!-- Basic Information Section -->
      <div class="row">
        <!-- Code -->
        <div class="col-md-6 mb-2">
          <label for="code" class="form-label">
            {{ t('formats:form.fields.code.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="code"
            v-model="formData.code"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
            :placeholder="t('formats:form.fields.code.placeholder')"
            required
            @blur="validateField('code')"
          >
          <div v-if="errors.code" class="invalid-feedback">
            {{ errors.code }}
          </div>
        </div>

        <!-- Name -->
        <div class="col-md-6 mb-2">
          <label for="name" class="form-label">
            {{ t('formats:form.fields.name.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
            :placeholder="t('formats:form.fields.name.placeholder')"
            required
            @blur="validateField('name')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Creo ID -->
        <div class="col-md-6 mb-2">
          <label for="creoId" class="form-label">
            {{ t('formats:form.fields.creoId.label') }}
          </label>
          <input
            id="creoId"
            v-model="formData.creoId"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.creoId }"
            :placeholder="t('formats:form.fields.creoId.placeholder')"
          >
          <div v-if="errors.creoId" class="invalid-feedback">
            {{ errors.creoId }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.creoId.help') }}
          </div>
        </div>

        <!-- Format Type (DIN) -->
        <div class="col-md-6 mb-2">
          <label for="formatType" class="form-label">
            {{ t('formats:form.fields.formatType.label') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="formatType"
            v-model="formData.formatType"
            class="form-select"
            :class="{ 'is-invalid': errors.formatType, 'is-valid': !errors.formatType && formData.formatType }"
            required
            @change="handleFormatTypeChange"
          >
            <option value="">{{ t('formats:form.fields.formatType.placeholder') }}</option>
            <option v-for="dinType in dinTypes" :key="dinType" :value="dinType">
              {{ dinType }}
            </option>
          </select>
          <div v-if="errors.formatType" class="invalid-feedback">
            {{ errors.formatType }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.formatType.help') }}
          </div>
        </div>
      </div>

      <!-- Grid Layout Section -->
      <div class="row">
        <!-- Number of Columns -->
        <div class="col-md-6 mb-2">
          <label for="nColumns" class="form-label">
            {{ t('formats:form.fields.nColumns.label') }}
          </label>
          <input
            id="nColumns"
            v-model.number="formData.nColumns"
            type="number"
            min="1"
            max="50"
            class="form-control"
            :class="{ 'is-invalid': errors.nColumns }"
            :placeholder="t('formats:form.fields.nColumns.placeholder')"
          >
          <div v-if="errors.nColumns" class="invalid-feedback">
            {{ errors.nColumns }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.nColumns.help') }}
          </div>
        </div>

        <!-- Number of Rows -->
        <div class="col-md-6 mb-2">
          <label for="nRows" class="form-label">
            {{ t('formats:form.fields.nRows.label') }}
          </label>
          <input
            id="nRows"
            v-model.number="formData.nRows"
            type="number"
            min="1"
            max="50"
            class="form-control"
            :class="{ 'is-invalid': errors.nRows }"
            :placeholder="t('formats:form.fields.nRows.placeholder')"
          >
          <div v-if="errors.nRows" class="invalid-feedback">
            {{ errors.nRows }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.nRows.help') }}
          </div>
        </div>
      </div>

      <!-- Dimensions Section -->
      <div class="row">
        <!-- Width (X) -->
        <div class="col-md-6 mb-2">
          <label for="dimX" class="form-label">
            {{ t('formats:form.fields.dimX.label') }}
          </label>
          <div class="input-group">
            <input
              id="dimX"
              v-model.number="formData.dimX"
              type="number"
              step="0.1"
              min="0"
              class="form-control"
              :class="{ 'is-invalid': errors.dimX }"
              :placeholder="t('formats:form.fields.dimX.placeholder')"
              :readonly="autoCalculateDimensions"
            >
            <span class="input-group-text">mm</span>
          </div>
          <div v-if="errors.dimX" class="invalid-feedback">
            {{ errors.dimX }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.dimX.help') }}
          </div>
        </div>

        <!-- Height (Y) -->
        <div class="col-md-6 mb-2">
          <label for="dimY" class="form-label">
            {{ t('formats:form.fields.dimY.label') }}
          </label>
          <div class="input-group">
            <input
              id="dimY"
              v-model.number="formData.dimY"
              type="number"
              step="0.1"
              min="0"
              class="form-control"
              :class="{ 'is-invalid': errors.dimY }"
              :placeholder="t('formats:form.fields.dimY.placeholder')"
              :readonly="autoCalculateDimensions"
            >
            <span class="input-group-text">mm</span>
          </div>
          <div v-if="errors.dimY" class="invalid-feedback">
            {{ errors.dimY }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.dimY.help') }}
          </div>
        </div>
      </div>

      <!-- Auto-calculate option -->
      <div class="row">
        <div class="col-12 mb-2">
          <div class="form-check">
            <input
              id="autoCalculate"
              v-model="autoCalculateDimensions"
              type="checkbox"
              class="form-check-input"
            >
            <label for="autoCalculate" class="form-check-label">
              {{ t('formats:form.autoCalculateDimensions') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('formats:form.autoCalculateHelp') }}
          </div>
        </div>
      </div>

      <!-- Format Preview -->
      <div v-if="formData.formatType" class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('formats:form.preview.title') }}</label>
          <div class="border rounded p-3 bg-light">
            <div class="d-flex justify-content-center">
              <div 
                class="border border-primary border-2 bg-white position-relative"
                :style="previewStyle"
              >
                <div class="position-absolute top-0 start-0 p-1">
                  <small class="badge bg-primary">{{ formData.formatType }}</small>
                </div>
                <div class="position-absolute bottom-0 end-0 p-1">
                  <small class="text-muted">
                    {{ formData.dimX }}×{{ formData.dimY }}mm
                  </small>
                </div>
                <!-- Grid overlay if columns/rows specified -->
                <svg 
                  v-if="formData.nColumns || formData.nRows"
                  class="position-absolute top-0 start-0 w-100 h-100"
                  :viewBox="`0 0 ${previewWidth} ${previewHeight}`"
                >
                  <!-- Vertical lines -->
                  <line
                    v-for="i in (formData.nColumns || 1)"
                    :key="`v-${i}`"
                    :x1="(i * previewWidth) / (formData.nColumns || 1)"
                    y1="0"
                    :x2="(i * previewWidth) / (formData.nColumns || 1)"
                    :y2="previewHeight"
                    stroke="#dee2e6"
                    stroke-width="1"
                  />
                  <!-- Horizontal lines -->
                  <line
                    v-for="i in (formData.nRows || 1)"
                    :key="`h-${i}`"
                    x1="0"
                    :y1="(i * previewHeight) / (formData.nRows || 1)"
                    :x2="previewWidth"
                    :y2="(i * previewHeight) / (formData.nRows || 1)"
                    stroke="#dee2e6"
                    stroke-width="1"
                  />
                </svg>
              </div>
            </div>
            <div class="text-center mt-2">
              <small class="text-muted">
                {{ t('formats:form.preview.description') }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- File Template Section -->
      <div class="row">
        <div class="col-md-12 mb-2">
          <label for="file" class="form-label">
            {{ t('formats:form.fields.file.label') }}
          </label>
          <select
            id="file"
            v-model="formData.fileId"
            class="form-select"
            :class="{ 'is-invalid': errors.file }"
            :disabled="loading.files"
          >
            <option value="">{{ t('formats:form.fields.file.placeholder') }}</option>
            <option v-for="file in availableFiles" :key="file.id" :value="file.id">
              {{ file.fileName || file.name }}
              <span v-if="file.extension" class="text-muted">({{ file.extension }})</span>
            </option>
          </select>
          <div v-if="loading.files" class="form-text">
            <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
          </div>
          <div v-if="errors.file" class="invalid-feedback">
            {{ errors.file }}
          </div>
          <div class="form-text">
            {{ t('formats:form.fields.file.help') }}
          </div>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { type IFormat, Format } from '~/model/format.model'
import { type IArchive } from '~/model/archive.model'
import { DIN } from '~/model/enumerations/din.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IFormat
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [format: IFormat]
  cancel: []
}>()

// Reactive Data
const availableFiles = ref<IArchive[]>([])
const autoCalculateDimensions = ref(true)
const loading = ref({
  files: false
})

// Validation Rules
const validationRules = {
  code: commonValidationRules.required('Code'),
  name: commonValidationRules.required('Name'),
  formatType: commonValidationRules.required('Format Type')
}

// Constants
const dinTypes = computed(() => Object.values(DIN))

// Standard DIN dimensions (in mm)
const dinDimensions = {
  A0: { width: 841, height: 1189 },
  A1: { width: 594, height: 841 },
  A2: { width: 420, height: 594 },
  A3V: { width: 297, height: 420 }, // Vertical
  A3O: { width: 420, height: 297 }, // Horizontal
  A4V: { width: 210, height: 297 }, // Vertical  
  A4O: { width: 297, height: 210 }  // Horizontal
}

// Computed
const previewWidth = computed(() => 300)
const previewHeight = computed(() => {
  if (!props.initialData?.formatType && !autoCalculateDimensions.value) return 200
  
  const dimensions = dinDimensions[props.initialData?.formatType as keyof typeof dinDimensions]
  if (dimensions) {
    return (previewWidth.value * dimensions.height) / dimensions.width
  }
  
  return 200
})

const previewStyle = computed(() => {
  return {
    width: `${previewWidth.value}px`,
    height: `${previewHeight.value}px`,
    minHeight: '150px'
  }
})

// Methods
const handleFormatTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const formatType = target.value as keyof typeof dinDimensions
  
  if (autoCalculateDimensions.value && formatType && dinDimensions[formatType]) {
    const dimensions = dinDimensions[formatType]
    // Update form data through the parent component
    const formData = (target.closest('form') as any)?.formData || {}
    formData.dimX = dimensions.width
    formData.dimY = dimensions.height
  }
}

const loadAvailableFiles = async () => {
  loading.value.files = true
  try {
    // Mock data - replace with actual API call
    availableFiles.value = [
      { id: 1, fileName: 'A4_template.dwg', name: 'A4 Template', extension: 'dwg' },
      { id: 2, fileName: 'A3_template.dwg', name: 'A3 Template', extension: 'dwg' },
      { id: 3, fileName: 'A2_template.dwg', name: 'A2 Template', extension: 'dwg' }
    ] as IArchive[]
  } catch (error) {
    console.error('Error loading files:', error)
  } finally {
    loading.value.files = false
  }
}

const handleSubmit = (formData: any) => {
  // Find the selected file
  const selectedFile = formData.fileId ? 
    availableFiles.value.find(f => f.id === formData.fileId) : null

  const format = new Format(
    formData.id,
    formData.creoId,
    formData.code,
    formData.name,
    formData.formatType,
    formData.nColumns,
    formData.nRows,
    formData.dimX,
    formData.dimY,
    selectedFile
  )
  
  emit('submit', format)
}

// Watchers
watch(autoCalculateDimensions, (newValue) => {
  if (newValue && props.initialData?.formatType) {
    handleFormatTypeChange({ target: { value: props.initialData.formatType } } as any)
  }
})

// Lifecycle
onMounted(() => {
  loadAvailableFiles()
})
</script>

<style scoped>
.form-label.small {
  font-size: 0.875rem;
}

.input-group-text {
  font-size: 0.875rem;
}

svg line {
  opacity: 0.5;
}
</style>