<template>
  <div class="balloon-form">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          {{ mode === 'create' ? t('balloons:form.create_title') : t('balloons:form.edit_title') }}
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
                {{ t('balloons:form.fields.creoId.label') }}
              </label>
              <input
                id="creoId"
                v-model="formData.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.creoId }"
                :placeholder="t('balloons:form.fields.creoId.placeholder')"
              >
              <div v-if="errors.creoId" class="invalid-feedback">
                {{ errors.creoId }}
              </div>
            </div>

            <!-- Code -->
            <div class="col-md-6 mb-2">
              <label for="code" class="form-label">
                {{ t('balloons:form.fields.code.label') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="code"
                v-model="formData.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
                :placeholder="t('balloons:form.fields.code.placeholder')"
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
                {{ t('balloons:form.fields.name.label') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
                :placeholder="t('balloons:form.fields.name.placeholder')"
                required
              >
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Balloon Name -->
            <div class="col-md-6 mb-2">
              <label for="baloonName" class="form-label">
                {{ t('balloons:form.fields.baloonName.label') }}
              </label>
              <input
                id="baloonName"
                v-model="formData.baloonName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.baloonName }"
                :placeholder="t('balloons:form.fields.baloonName.placeholder')"
              >
              <div v-if="errors.baloonName" class="invalid-feedback">
                {{ errors.baloonName }}
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Balloon Value -->
            <div class="col-md-6 mb-2">
              <label for="baloonValue" class="form-label">
                {{ t('balloons:form.fields.baloonValue.label') }}
              </label>
              <input
                id="baloonValue"
                v-model="formData.baloonValue"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.baloonValue }"
                :placeholder="t('balloons:form.fields.baloonValue.placeholder')"
              >
              <div v-if="errors.baloonValue" class="invalid-feedback">
                {{ errors.baloonValue }}
              </div>
            </div>

            <!-- Balloon Type -->
            <div class="col-md-6 mb-2">
              <label for="baloonType" class="form-label">
                {{ t('balloons:form.fields.baloonType.label') }}
              </label>
              <select
                id="baloonType"
                v-model="formData.baloonType"
                class="form-select"
                :class="{ 'is-invalid': errors.baloonType }"
              >
                <option value="">{{ t('balloons:form.fields.baloonType.placeholder') }}</option>
                <option v-for="type in balloonTypes" :key="type" :value="type">
                  {{ t(`balloons:form.fields.baloonType.options.${type}`) }}
                </option>
              </select>
              <div v-if="errors.baloonType" class="invalid-feedback">
                {{ errors.baloonType }}
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Box -->
            <div class="col-md-12 mb-2">
              <label for="box" class="form-label">
                {{ t('balloons:form.fields.box.label') }}
              </label>
              <input
                id="box"
                v-model="formData.box"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.box }"
                :placeholder="t('balloons:form.fields.box.placeholder')"
              >
              <div v-if="errors.box" class="invalid-feedback">
                {{ errors.box }}
              </div>
              <div class="form-text">
                {{ t('balloons:form.fields.box.help') }}
              </div>
            </div>
          </div>

          <!-- Position Section -->
          <div class="row" v-if="formData.position || showAdvanced">
            <div class="col-12 mb-2">
              <label class="form-label">
                {{ t('balloons:form.fields.position.label') }}
              </label>
              <div class="row">
                <div class="col-md-4 mb-2">
                  <label for="positionX" class="form-label small">
                    {{ t('balloons:form.fields.position.x') }}
                  </label>
                  <input
                    id="positionX"
                    v-model.number="positionData.posX"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :placeholder="t('balloons:form.fields.position.placeholder_x')"
                  >
                </div>
                <div class="col-md-4 mb-2">
                  <label for="positionY" class="form-label small">
                    {{ t('balloons:form.fields.position.y') }}
                  </label>
                  <input
                    id="positionY"
                    v-model.number="positionData.posY"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :placeholder="t('balloons:form.fields.position.placeholder_y')"
                  >
                </div>
                <div class="col-md-4 mb-2">
                  <label for="positionZ" class="form-label small">
                    {{ t('balloons:form.fields.position.z') }}
                  </label>
                  <input
                    id="positionZ"
                    v-model.number="positionData.posZ"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :placeholder="t('balloons:form.fields.position.placeholder_z')"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Associations Section -->
          <div class="row">
            <!-- Sheet Association -->
            <div class="col-md-6 mb-2">
              <label for="sheet" class="form-label">
                {{ t('balloons:form.fields.sheet.label') }}
              </label>
              <select
                id="sheet"
                v-model="formData.sheetId"
                class="form-select"
                :class="{ 'is-invalid': errors.sheet }"
                :disabled="loading.sheets"
              >
                <option value="">{{ t('balloons:form.fields.sheet.placeholder') }}</option>
                <option v-for="sheet in availableSheets" :key="sheet.id" :value="sheet.id">
                  {{ sheet.code }} - {{ sheet.name }}
                </option>
              </select>
              <div v-if="loading.sheets" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.sheet" class="invalid-feedback">
                {{ errors.sheet }}
              </div>
            </div>

            <!-- Symbol/Marker Association -->
            <div class="col-md-6 mb-2">
              <label for="symbol" class="form-label">
                {{ t('balloons:form.fields.symbol.label') }}
              </label>
              <select
                id="symbol"
                v-model="formData.symbolId"
                class="form-select"
                :class="{ 'is-invalid': errors.symbol }"
                :disabled="loading.markers"
              >
                <option value="">{{ t('balloons:form.fields.symbol.placeholder') }}</option>
                <option v-for="marker in availableMarkers" :key="marker.id" :value="marker.id">
                  {{ marker.code }} - {{ marker.name }}
                </option>
              </select>
              <div v-if="loading.markers" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.symbol" class="invalid-feedback">
                {{ errors.symbol }}
              </div>
            </div>
          </div>

          <!-- Advanced Options Toggle -->
          <div class="row">
            <div class="col-12 mb-2">
              <div class="form-check">
                <input
                  id="showAdvanced"
                  v-model="showAdvanced"
                  type="checkbox"
                  class="form-check-input"
                >
                <label for="showAdvanced" class="form-check-label">
                  {{ t('balloons:form.show_advanced') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Validation Summary -->
          <div v-if="validationSummary.length > 0" class="alert alert-warning">
            <h6>{{ t('balloons:form.validation.summary_title') }}</h6>
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
import { type IBaloon, Baloon } from '~/model/baloon.model'
import { type ISheet } from '~/model/sheet.model'
import { type IMarker } from '~/model/marker.model'
import { type IPosition } from '~/model/position.model'

// Composables
const { t } = useI18n('balloons')
const { $api } = useNuxtApp()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IBaloon
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  initialData: undefined
})

// Emits
const emit = defineEmits<{
  submit: [balloon: IBaloon]
  cancel: []
}>()

// Reactive Data  
const formData = ref<IBaloon>({
  id: undefined,
  creoId: null,
  code: null,
  name: null,
  baloonName: null,
  baloonValue: null,
  baloonType: null,
  box: null,
  position: null,
  sheet: null,
  symbol: null
})

const positionData = ref({
  posX: 0,
  posY: 0,
  posZ: 0
})

const errors = ref<Record<string, string>>({})
const loading = ref({
  submit: false,
  sheets: false,
  markers: false
})

const availableSheets = ref<ISheet[]>([])
const availableMarkers = ref<IMarker[]>([])
const showAdvanced = ref(false)

// Computed
const balloonTypes = computed(() => [
  'CIRCLE',
  'SQUARE',
  'DIAMOND',
  'TRIANGLE',
  'CUSTOM'
])

const validationSummary = computed(() => {
  return Object.values(errors.value).filter(Boolean)
})

const isFormValid = computed(() => {
  return validateForm() && validationSummary.value.length === 0
})

// Separate IDs for form binding
const formDataSheetId = computed({
  get: () => formData.value.sheet?.id,
  set: (value) => {
    if (value) {
      const sheet = availableSheets.value.find(s => s.id === value)
      formData.value.sheet = sheet || null
    } else {
      formData.value.sheet = null
    }
  }
})

const formDataSymbolId = computed({
  get: () => formData.value.symbol?.id,
  set: (value) => {
    if (value) {
      const symbol = availableMarkers.value.find(m => m.id === value)
      formData.value.symbol = symbol || null
    } else {
      formData.value.symbol = null
    }
  }
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.code?.trim()) {
    errors.value.code = t('balloons:form.validation.code_required')
  }
  
  if (!formData.value.name?.trim()) {
    errors.value.name = t('balloons:form.validation.name_required')
  }
  
  return Object.keys(errors.value).length === 0
}

const loadSheets = async () => {
  loading.value.sheets = true
  try {
    // Mock data - replace with actual API call
    availableSheets.value = [
      { id: 1, code: 'SHT001', name: 'Main Assembly Sheet' },
      { id: 2, code: 'SHT002', name: 'Detail Sheet A' },
      { id: 3, code: 'SHT003', name: 'Detail Sheet B' }
    ]
  } catch (error) {
    console.error('Error loading sheets:', error)
  } finally {
    loading.value.sheets = false
  }
}

const loadMarkers = async () => {
  loading.value.markers = true
  try {
    // Mock data - replace with actual API call
    availableMarkers.value = [
      { id: 1, code: 'MRK001', name: 'Circle Marker' },
      { id: 2, code: 'MRK002', name: 'Square Marker' },
      { id: 3, code: 'MRK003', name: 'Diamond Marker' }
    ]
  } catch (error) {
    console.error('Error loading markers:', error)
  } finally {
    loading.value.markers = false
  }
}

const updatePosition = () => {
  if (positionData.value.posX !== 0 || positionData.value.posY !== 0 || positionData.value.posZ !== 0) {
    formData.value.position = {
      posX: positionData.value.posX,
      posY: positionData.value.posY,
      posZ: positionData.value.posZ
    }
  } else {
    formData.value.position = null
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value.submit = true
  try {
    // Update position before submit
    updatePosition()
    
    const balloon = new Baloon(
      formData.value.id,
      formData.value.creoId,
      formData.value.code,
      formData.value.name,
      formData.value.baloonName,
      formData.value.baloonValue,
      formData.value.baloonType,
      formData.value.box,
      formData.value.position,
      formData.value.sheet,
      formData.value.symbol
    )
    
    emit('submit', balloon)
  } catch (error) {
    console.error('Error submitting form:', error)
    errors.value.form = t('balloons:form.validation.submit_error')
  } finally {
    loading.value.submit = false
  }
}

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
    if (newData.position) {
      positionData.value = {
        posX: newData.position.posX || 0,
        posY: newData.position.posY || 0,
        posZ: newData.position.posZ || 0
      }
      showAdvanced.value = true
    }
  }
}, { immediate: true })

watch(positionData, updatePosition, { deep: true })

// Lifecycle
onMounted(() => {
  loadSheets()
  loadMarkers()
})
</script>

<style scoped>
.form-label.small {
  font-size: 0.875rem;
}
</style>