<template>
  <EntityForm
    :mode="mode"
    entity-name="Position"
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
            {{ t('positions:form.fields.code.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="code"
            v-model="formData.code"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
            :placeholder="t('positions:form.fields.code.placeholder')"
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
            {{ t('positions:form.fields.name.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
            :placeholder="t('positions:form.fields.name.placeholder')"
            required
            @blur="validateField('name')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>
      </div>

      <!-- Type and Value Section -->
      <div class="row">
        <!-- Type Value -->
        <div class="col-md-6 mb-2">
          <label for="typeValue" class="form-label">
            {{ t('positions:form.fields.typeValue.label') }}
          </label>
          <select
            id="typeValue"
            v-model="formData.typeValue"
            class="form-select"
            :class="{ 'is-invalid': errors.typeValue }"
          >
            <option value="">{{ t('positions:form.fields.typeValue.placeholder') }}</option>
            <option v-for="type in typeValues" :key="type" :value="type">
              {{ t(`positions:form.fields.typeValue.options.${type}`) }}
            </option>
          </select>
          <div v-if="errors.typeValue" class="invalid-feedback">
            {{ errors.typeValue }}
          </div>
          <div class="form-text">
            {{ t('positions:form.fields.typeValue.help') }}
          </div>
        </div>

        <!-- Attribute Value -->
        <div class="col-md-6 mb-2">
          <label for="attributeValue" class="form-label">
            {{ t('positions:form.fields.attributeValue.label') }}
          </label>
          <input
            id="attributeValue"
            v-model="formData.attributeValue"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.attributeValue }"
            :placeholder="t('positions:form.fields.attributeValue.placeholder')"
          >
          <div v-if="errors.attributeValue" class="invalid-feedback">
            {{ errors.attributeValue }}
          </div>
          <div class="form-text">
            {{ t('positions:form.fields.attributeValue.help') }}
          </div>
        </div>
      </div>

      <!-- 3D Coordinates Section -->
      <div class="card bg-light border-0 mb-3">
        <div class="card-header bg-transparent border-0">
          <h6 class="mb-0">
            <i class="bi bi-box me-2"></i>
            {{ t('positions:form.coordinates.title') }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- X Coordinate -->
            <div class="col-md-4 mb-2">
              <label for="posX" class="form-label">
                {{ t('positions:form.fields.posX.label') }}
              </label>
              <div class="input-group">
                <input
                  id="posX"
                  v-model.number="formData.posX"
                  type="number"
                  step="0.001"
                  class="form-control"
                  :class="{ 'is-invalid': errors.posX }"
                  :placeholder="t('positions:form.fields.posX.placeholder')"
                  @input="updateCoordinates"
                >
                <span class="input-group-text">mm</span>
              </div>
              <div v-if="errors.posX" class="invalid-feedback">
                {{ errors.posX }}
              </div>
            </div>

            <!-- Y Coordinate -->
            <div class="col-md-4 mb-2">
              <label for="posY" class="form-label">
                {{ t('positions:form.fields.posY.label') }}
              </label>
              <div class="input-group">
                <input
                  id="posY"
                  v-model.number="formData.posY"
                  type="number"
                  step="0.001"
                  class="form-control"
                  :class="{ 'is-invalid': errors.posY }"
                  :placeholder="t('positions:form.fields.posY.placeholder')"
                  @input="updateCoordinates"
                >
                <span class="input-group-text">mm</span>
              </div>
              <div v-if="errors.posY" class="invalid-feedback">
                {{ errors.posY }}
              </div>
            </div>

            <!-- Z Coordinate -->
            <div class="col-md-4 mb-2">
              <label for="posZ" class="form-label">
                {{ t('positions:form.fields.posZ.label') }}
              </label>
              <div class="input-group">
                <input
                  id="posZ"
                  v-model.number="formData.posZ"
                  type="number"
                  step="0.001"
                  class="form-control"
                  :class="{ 'is-invalid': errors.posZ }"
                  :placeholder="t('positions:form.fields.posZ.placeholder')"
                  @input="updateCoordinates"
                >
                <span class="input-group-text">mm</span>
              </div>
              <div v-if="errors.posZ" class="invalid-feedback">
                {{ errors.posZ }}
              </div>
            </div>
          </div>

          <!-- Coordinate Display -->
          <div class="row">
            <div class="col-12">
              <div class="alert alert-info mb-0">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ t('positions:form.coordinates.current') }}:</strong>
                    <span class="font-monospace ms-2">
                      ({{ formData.posX || 0 }}, {{ formData.posY || 0 }}, {{ formData.posZ || 0 }})
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="resetCoordinates"
                    >
                      <i class="bi bi-arrow-clockwise me-1"></i>
                      {{ t('positions:form.coordinates.reset') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coordinate Validation -->
          <div v-if="coordinateValidation.message" class="row mt-2">
            <div class="col-12">
              <div :class="['alert', coordinateValidation.type === 'error' ? 'alert-danger' : 'alert-warning']">
                <i :class="coordinateValidation.type === 'error' ? 'bi bi-exclamation-triangle' : 'bi bi-info-circle'" class="me-2"></i>
                {{ coordinateValidation.message }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Box/Container Section -->
      <div class="row">
        <div class="col-md-12 mb-2">
          <label for="box" class="form-label">
            {{ t('positions:form.fields.box.label') }}
          </label>
          <textarea
            id="box"
            v-model="formData.box"
            class="form-control"
            rows="3"
            :class="{ 'is-invalid': errors.box }"
            :placeholder="t('positions:form.fields.box.placeholder')"
          ></textarea>
          <div v-if="errors.box" class="invalid-feedback">
            {{ errors.box }}
          </div>
          <div class="form-text">
            {{ t('positions:form.fields.box.help') }}
          </div>
        </div>
      </div>

      <!-- 3D Visualization (Simple) -->
      <div v-if="hasValidCoordinates" class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('positions:form.visualization.title') }}</label>
          <div class="border rounded p-3 bg-light text-center">
            <div class="position-3d-viewer">
              <svg width="300" height="200" viewBox="0 0 300 200">
                <!-- 3D Grid -->
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dee2e6" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="300" height="200" fill="url(#grid)" />
                
                <!-- Origin -->
                <circle cx="150" cy="100" r="3" fill="#6c757d" />
                <text x="155" y="105" font-size="10" fill="#6c757d">Origin</text>
                
                <!-- Position Point -->
                <circle 
                  :cx="150 + (formData.posX || 0) * 0.1" 
                  :cy="100 - (formData.posY || 0) * 0.1" 
                  r="5" 
                  fill="#0d6efd" 
                />
                <text 
                  :x="155 + (formData.posX || 0) * 0.1" 
                  :y="95 - (formData.posY || 0) * 0.1" 
                  font-size="10" 
                  fill="#0d6efd"
                >
                  Position
                </text>
                
                <!-- Coordinate Lines -->
                <line 
                  x1="150" 
                  y1="100" 
                  :x2="150 + (formData.posX || 0) * 0.1" 
                  :y2="100 - (formData.posY || 0) * 0.1" 
                  stroke="#0d6efd" 
                  stroke-width="2" 
                  stroke-dasharray="3,3"
                />
              </svg>
            </div>
            <small class="text-muted d-block mt-2">
              {{ t('positions:form.visualization.description') }}
            </small>
          </div>
        </div>
      </div>

      <!-- Quick Position Presets -->
      <div class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('positions:form.presets.title') }}</label>
          <div class="btn-group" role="group">
            <button
              v-for="preset in positionPresets"
              :key="preset.name"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="applyPreset(preset)"
            >
              {{ t(`positions:form.presets.${preset.name}`) }}
            </button>
          </div>
          <div class="form-text">
            {{ t('positions:form.presets.help') }}
          </div>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type IPosition, Position } from '~/model/position.model'
import { TypeValue } from '~/model/enumerations/type-value.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IPosition
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [position: IPosition]
  cancel: []
}>()

// Validation Rules
const validationRules = {
  code: commonValidationRules.required('Code'),
  name: commonValidationRules.required('Name')
}

// Constants
const typeValues = computed(() => Object.values(TypeValue))

const positionPresets = [
  { name: 'origin', posX: 0, posY: 0, posZ: 0 },
  { name: 'center', posX: 100, posY: 100, posZ: 0 },
  { name: 'topLeft', posX: -100, posY: 100, posZ: 0 },
  { name: 'topRight', posX: 100, posY: 100, posZ: 0 },
  { name: 'bottomLeft', posX: -100, posY: -100, posZ: 0 },
  { name: 'bottomRight', posX: 100, posY: -100, posZ: 0 }
]

// Computed
const hasValidCoordinates = computed(() => {
  return props.initialData?.posX !== null || 
         props.initialData?.posY !== null || 
         props.initialData?.posZ !== null
})

const coordinateValidation = computed(() => {
  const x = props.initialData?.posX || 0
  const y = props.initialData?.posY || 0
  const z = props.initialData?.posZ || 0
  
  const distance = Math.sqrt(x * x + y * y + z * z)
  
  if (distance > 10000) {
    return {
      type: 'error',
      message: t('positions:form.validation.coordinatesOutOfRange')
    }
  }
  
  if (distance > 1000) {
    return {
      type: 'warning',
      message: t('positions:form.validation.coordinatesFarFromOrigin')
    }
  }
  
  return { type: null, message: null }
})

// Methods
const updateCoordinates = () => {
  // Trigger reactivity for coordinate-dependent computed properties
  // This method is called when any coordinate changes
}

const resetCoordinates = () => {
  if (props.initialData) {
    props.initialData.posX = 0
    props.initialData.posY = 0
    props.initialData.posZ = 0
  }
}

const applyPreset = (preset: any) => {
  if (props.initialData) {
    props.initialData.posX = preset.posX
    props.initialData.posY = preset.posY
    props.initialData.posZ = preset.posZ
  }
}

const handleSubmit = (formData: any) => {
  const position = new Position(
    formData.id,
    formData.code,
    formData.name,
    formData.typeValue,
    formData.attributeValue,
    formData.posX,
    formData.posY,
    formData.posZ,
    formData.box
  )
  
  emit('submit', position)
}
</script>

<style scoped>
.position-3d-viewer {
  background: white;
  border-radius: 0.375rem;
  padding: 1rem;
}

.font-monospace {
  font-family: 'Courier New', monospace;
}

.input-group-text {
  font-size: 0.875rem;
  min-width: 40px;
}

.btn-group .btn {
  font-size: 0.8125rem;
}

.alert.mb-0 {
  border: 1px solid #b6effb;
  background-color: #f0fbff;
}
</style>