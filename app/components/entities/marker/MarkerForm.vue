<template>
  <EntityForm
    :mode="mode"
    entity-name="Marker"
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
            {{ t('markers:form.fields.code.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="code"
            v-model="formData.code"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
            :placeholder="t('markers:form.fields.code.placeholder')"
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
            {{ t('markers:form.fields.name.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
            :placeholder="t('markers:form.fields.name.placeholder')"
            required
            @blur="validateField('name')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Marker Type -->
        <div class="col-md-6 mb-2">
          <label for="markerType" class="form-label">
            {{ t('markers:form.fields.markerType.label') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="markerType"
            v-model="formData.markerType"
            class="form-select"
            :class="{ 'is-invalid': errors.markerType, 'is-valid': !errors.markerType && formData.markerType }"
            required
            @change="handleMarkerTypeChange"
          >
            <option value="">{{ t('markers:form.fields.markerType.placeholder') }}</option>
            <option v-for="type in markerTypes" :key="type" :value="type">
              {{ t(`markers:form.fields.markerType.options.${type}`) }}
            </option>
          </select>
          <div v-if="errors.markerType" class="invalid-feedback">
            {{ errors.markerType }}
          </div>
          <div class="form-text">
            {{ t('markers:form.fields.markerType.help') }}
          </div>
        </div>

        <!-- Symbol -->
        <div class="col-md-6 mb-2">
          <label for="symbol" class="form-label">
            {{ t('markers:form.fields.symbol.label') }}
          </label>
          <input
            id="symbol"
            v-model="formData.symbol"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.symbol }"
            :placeholder="t('markers:form.fields.symbol.placeholder')"
            maxlength="10"
          >
          <div v-if="errors.symbol" class="invalid-feedback">
            {{ errors.symbol }}
          </div>
          <div class="form-text">
            {{ t('markers:form.fields.symbol.help') }}
          </div>
        </div>
      </div>

      <!-- Visual Properties Section -->
      <div class="card bg-light border-0 mb-3">
        <div class="card-header bg-transparent border-0">
          <h6 class="mb-0">
            <i class="bi bi-palette me-2"></i>
            {{ t('markers:form.visual.title') }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Color -->
            <div class="col-md-4 mb-2">
              <label for="color" class="form-label">
                {{ t('markers:form.fields.color.label') }}
              </label>
              <div class="input-group">
                <input
                  id="color"
                  v-model="formData.color"
                  type="color"
                  class="form-control form-control-color"
                  :class="{ 'is-invalid': errors.color }"
                  :title="t('markers:form.fields.color.title')"
                >
                <input
                  v-model="formData.color"
                  type="text"
                  class="form-control"
                  :placeholder="t('markers:form.fields.color.placeholder')"
                  pattern="^#[0-9A-Fa-f]{6}$"
                >
              </div>
              <div v-if="errors.color" class="invalid-feedback">
                {{ errors.color }}
              </div>
            </div>

            <!-- Size -->
            <div class="col-md-4 mb-2">
              <label for="size" class="form-label">
                {{ t('markers:form.fields.size.label') }}
              </label>
              <div class="input-group">
                <input
                  id="size"
                  v-model.number="formData.size"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  class="form-control"
                  :class="{ 'is-invalid': errors.size }"
                  :placeholder="t('markers:form.fields.size.placeholder')"
                >
                <span class="input-group-text">px</span>
              </div>
              <div v-if="errors.size" class="invalid-feedback">
                {{ errors.size }}
              </div>
            </div>

            <!-- Shape -->
            <div class="col-md-4 mb-2">
              <label for="shape" class="form-label">
                {{ t('markers:form.fields.shape.label') }}
              </label>
              <select
                id="shape"
                v-model="formData.shape"
                class="form-select"
                :class="{ 'is-invalid': errors.shape }"
              >
                <option value="">{{ t('markers:form.fields.shape.placeholder') }}</option>
                <option v-for="shape in markerShapes" :key="shape" :value="shape">
                  {{ t(`markers:form.fields.shape.options.${shape}`) }}
                </option>
              </select>
              <div v-if="errors.shape" class="invalid-feedback">
                {{ errors.shape }}
              </div>
            </div>
          </div>

          <!-- Marker Preview -->
          <div class="row">
            <div class="col-12">
              <label class="form-label">{{ t('markers:form.preview.title') }}</label>
              <div class="border rounded p-3 bg-white text-center">
                <div class="marker-preview-container">
                  <svg width="100" height="60" viewBox="0 0 100 60">
                    <!-- Grid background -->
                    <defs>
                      <pattern id="markerGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="60" fill="url(#markerGrid)" />
                    
                    <!-- Marker preview -->
                    <g v-if="formData.markerType">
                      <circle
                        v-if="formData.shape === 'CIRCLE' || !formData.shape"
                        cx="50"
                        cy="30"
                        :r="(formData.size || 12) / 2"
                        :fill="formData.color || '#0d6efd'"
                        stroke="#fff"
                        stroke-width="2"
                      />
                      <rect
                        v-else-if="formData.shape === 'SQUARE'"
                        :x="50 - (formData.size || 12) / 2"
                        :y="30 - (formData.size || 12) / 2"
                        :width="formData.size || 12"
                        :height="formData.size || 12"
                        :fill="formData.color || '#0d6efd'"
                        stroke="#fff"
                        stroke-width="2"
                      />
                      <polygon
                        v-else-if="formData.shape === 'TRIANGLE'"
                        :points="`50,${30 - (formData.size || 12) / 2} ${50 - (formData.size || 12) / 2},${30 + (formData.size || 12) / 2} ${50 + (formData.size || 12) / 2},${30 + (formData.size || 12) / 2}`"
                        :fill="formData.color || '#0d6efd'"
                        stroke="#fff"
                        stroke-width="2"
                      />
                      
                      <!-- Symbol text -->
                      <text
                        v-if="formData.symbol"
                        x="50"
                        y="35"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        font-size="10"
                        fill="white"
                        font-weight="bold"
                      >
                        {{ formData.symbol }}
                      </text>
                    </g>
                  </svg>
                </div>
                <small class="text-muted d-block mt-2">
                  {{ t('markers:form.preview.description') }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Configuration Section -->
      <div class="row">
        <!-- Use in Balloons -->
        <div class="col-md-6 mb-2">
          <div class="form-check">
            <input
              id="useInBalloons"
              v-model="formData.useInBalloons"
              type="checkbox"
              class="form-check-input"
            >
            <label for="useInBalloons" class="form-check-label">
              {{ t('markers:form.fields.useInBalloons.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('markers:form.fields.useInBalloons.help') }}
          </div>
        </div>

        <!-- Use in Annotations -->
        <div class="col-md-6 mb-2">
          <div class="form-check">
            <input
              id="useInAnnotations"
              v-model="formData.useInAnnotations"
              type="checkbox"
              class="form-check-input"
            >
            <label for="useInAnnotations" class="form-check-label">
              {{ t('markers:form.fields.useInAnnotations.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('markers:form.fields.useInAnnotations.help') }}
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="row">
        <div class="col-12 mb-2">
          <label for="description" class="form-label">
            {{ t('markers:form.fields.description.label') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-control"
            rows="3"
            :class="{ 'is-invalid': errors.description }"
            :placeholder="t('markers:form.fields.description.placeholder')"
          ></textarea>
          <div v-if="errors.description" class="invalid-feedback">
            {{ errors.description }}
          </div>
          <div class="form-text">
            {{ t('markers:form.fields.description.help') }}
          </div>
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('markers:form.presets.title') }}</label>
          <div class="btn-group" role="group">
            <button
              v-for="preset in markerPresets"
              :key="preset.name"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="applyPreset(preset)"
            >
              <span 
                class="badge me-1"
                :style="{ backgroundColor: preset.color }"
              >
                {{ preset.symbol }}
              </span>
              {{ t(`markers:form.presets.${preset.name}`) }}
            </button>
          </div>
          <div class="form-text">
            {{ t('markers:form.presets.help') }}
          </div>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type IMarker, Marker } from '~/model/marker.model'
import { MarkerType } from '~/model/enumerations/marker-type.model'
import { Shape } from '~/model/enumerations/shape.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IMarker
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [marker: IMarker]
  cancel: []
}>()

// Validation Rules
const validationRules = {
  code: commonValidationRules.required('Code'),
  name: commonValidationRules.required('Name'),
  markerType: commonValidationRules.required('Marker Type')
}

// Constants
const markerTypes = computed(() => Object.values(MarkerType))
const markerShapes = computed(() => Object.values(Shape))

// Predefined marker presets
const markerPresets = [
  {
    name: 'standard',
    markerType: MarkerType.STANDARD,
    symbol: '●',
    color: '#0d6efd',
    size: 12,
    shape: Shape.CIRCLE
  },
  {
    name: 'warning',
    markerType: MarkerType.WARNING,
    symbol: '⚠',
    color: '#ffc107',
    size: 14,
    shape: Shape.TRIANGLE
  },
  {
    name: 'error',
    markerType: MarkerType.ERROR,
    symbol: '✕',
    color: '#dc3545',
    size: 12,
    shape: Shape.CIRCLE
  },
  {
    name: 'info',
    markerType: MarkerType.INFO,
    symbol: 'i',
    color: '#17a2b8',
    size: 12,
    shape: Shape.CIRCLE
  },
  {
    name: 'success',
    markerType: MarkerType.SUCCESS,
    symbol: '✓',
    color: '#28a745',
    size: 12,
    shape: Shape.CIRCLE
  },
  {
    name: 'custom',
    markerType: MarkerType.CUSTOM,
    symbol: '★',
    color: '#6f42c1',
    size: 14,
    shape: Shape.CIRCLE
  }
]

// Methods
const handleMarkerTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const markerType = target.value as MarkerType
  
  // Auto-suggest defaults based on marker type
  if (markerType && props.initialData) {
    const preset = markerPresets.find(p => p.markerType === markerType)
    if (preset) {
      applyPreset(preset)
    }
  }
}

const applyPreset = (preset: any) => {
  if (props.initialData) {
    props.initialData.markerType = preset.markerType
    props.initialData.symbol = preset.symbol
    props.initialData.color = preset.color
    props.initialData.size = preset.size
    props.initialData.shape = preset.shape
  }
}

const handleSubmit = (formData: any) => {
  const marker = new Marker(
    formData.id,
    formData.code,
    formData.name,
    formData.markerType,
    formData.symbol,
    formData.color,
    formData.size,
    formData.shape,
    formData.description,
    formData.useInBalloons,
    formData.useInAnnotations
  )
  
  emit('submit', marker)
}
</script>

<style scoped>
.marker-preview-container {
  background: white;
  border-radius: 0.375rem;
  padding: 1rem;
}

.form-control-color {
  width: 3rem;
  height: calc(1.5em + 0.75rem + 2px);
}

.btn-group .btn {
  font-size: 0.8125rem;
}

.badge {
  font-size: 0.75rem;
  min-width: 1.5rem;
}
</style>