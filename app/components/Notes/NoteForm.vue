<template>
  <div class="note-form">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          {{ mode === 'create' ? t('notes:form.create_title') : t('notes:form.edit_title') }}
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
                {{ t('notes:form.fields.creoId.label') }}
              </label>
              <input
                id="creoId"
                v-model="formData.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.creoId }"
                :placeholder="t('notes:form.fields.creoId.placeholder')"
              >
              <div v-if="errors.creoId" class="invalid-feedback">
                {{ errors.creoId }}
              </div>
            </div>

            <!-- Code -->
            <div class="col-md-6 mb-2">
              <label for="code" class="form-label">
                {{ t('notes:form.fields.code.label') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="code"
                v-model="formData.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
                :placeholder="t('notes:form.fields.code.placeholder')"
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
                {{ t('notes:form.fields.name.label') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
                :placeholder="t('notes:form.fields.name.placeholder')"
                required
              >
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Note Name -->
            <div class="col-md-6 mb-2">
              <label for="noteName" class="form-label">
                {{ t('notes:form.fields.noteName.label') }}
              </label>
              <input
                id="noteName"
                v-model="formData.noteName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.noteName }"
                :placeholder="t('notes:form.fields.noteName.placeholder')"
              >
              <div v-if="errors.noteName" class="invalid-feedback">
                {{ errors.noteName }}
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Note Value -->
            <div class="col-md-6 mb-2">
              <label for="noteValue" class="form-label">
                {{ t('notes:form.fields.noteValue.label') }}
              </label>
              <textarea
                id="noteValue"
                v-model="formData.noteValue"
                class="form-control"
                :class="{ 'is-invalid': errors.noteValue }"
                :placeholder="t('notes:form.fields.noteValue.placeholder')"
                rows="3"
              ></textarea>
              <div v-if="errors.noteValue" class="invalid-feedback">
                {{ errors.noteValue }}
              </div>
            </div>

            <!-- Note Type and Order -->
            <div class="col-md-6">
              <div class="row">
                <!-- Note Type -->
                <div class="col-12 mb-2">
                  <label for="noteType" class="form-label">
                    {{ t('notes:form.fields.noteType.label') }}
                  </label>
                  <select
                    id="noteType"
                    v-model="formData.noteType"
                    class="form-select"
                    :class="{ 'is-invalid': errors.noteType }"
                  >
                    <option value="">{{ t('notes:form.fields.noteType.placeholder') }}</option>
                    <option v-for="type in noteTypes" :key="type" :value="type">
                      {{ t(`notes:form.fields.noteType.options.${type}`) }}
                    </option>
                  </select>
                  <div v-if="errors.noteType" class="invalid-feedback">
                    {{ errors.noteType }}
                  </div>
                </div>

                <!-- Order -->
                <div class="col-12 mb-2">
                  <label for="order" class="form-label">
                    {{ t('notes:form.fields.order.label') }}
                  </label>
                  <input
                    id="order"
                    v-model.number="formData.order"
                    type="number"
                    min="1"
                    max="999"
                    class="form-control"
                    :class="{ 'is-invalid': errors.order }"
                    :placeholder="t('notes:form.fields.order.placeholder')"
                  >
                  <div v-if="errors.order" class="invalid-feedback">
                    {{ errors.order }}
                  </div>
                  <div class="form-text">
                    {{ t('notes:form.fields.order.help') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Position Section -->
          <div class="row" v-if="formData.position || showAdvanced">
            <div class="col-12 mb-2">
              <label class="form-label">
                {{ t('notes:form.fields.position.label') }}
              </label>
              <div class="row">
                <div class="col-md-4 mb-2">
                  <label for="positionX" class="form-label small">
                    {{ t('notes:form.fields.position.x') }}
                  </label>
                  <input
                    id="positionX"
                    v-model.number="positionData.x"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :placeholder="t('notes:form.fields.position.placeholder_x')"
                  >
                </div>
                <div class="col-md-4 mb-2">
                  <label for="positionY" class="form-label small">
                    {{ t('notes:form.fields.position.y') }}
                  </label>
                  <input
                    id="positionY"
                    v-model.number="positionData.y"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :placeholder="t('notes:form.fields.position.placeholder_y')"
                  >
                </div>
                <div class="col-md-4 mb-2">
                  <label for="positionZ" class="form-label small">
                    {{ t('notes:form.fields.position.z') }}
                  </label>
                  <input
                    id="positionZ"
                    v-model.number="positionData.z"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :placeholder="t('notes:form.fields.position.placeholder_z')"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Balloon Association Section -->
          <div class="row">
            <div class="col-md-6 mb-2">
              <label for="balloon" class="form-label">
                {{ t('notes:form.fields.baloon.label') }}
              </label>
              <select
                id="balloon"
                v-model="formData.baloonId"
                class="form-select"
                :class="{ 'is-invalid': errors.baloon }"
                :disabled="loading.balloons"
              >
                <option value="">{{ t('notes:form.fields.baloon.placeholder') }}</option>
                <option v-for="balloon in availableBalloons" :key="balloon.id" :value="balloon.id">
                  {{ balloon.code }} - {{ balloon.name }}
                  <span v-if="balloon.baloonValue"> ({{ balloon.baloonValue }})</span>
                </option>
              </select>
              <div v-if="loading.balloons" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.baloon" class="invalid-feedback">
                {{ errors.baloon }}
              </div>
              <div class="form-text">
                {{ t('notes:form.fields.baloon.help') }}
              </div>
            </div>

            <!-- Advanced Options Toggle -->
            <div class="col-md-6 mb-2 d-flex align-items-end">
              <div class="form-check">
                <input
                  id="showAdvanced"
                  v-model="showAdvanced"
                  type="checkbox"
                  class="form-check-input"
                >
                <label for="showAdvanced" class="form-check-label">
                  {{ t('notes:form.show_advanced') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Validation Summary -->
          <div v-if="validationSummary.length > 0" class="alert alert-warning">
            <h6>{{ t('notes:form.validation.summary_title') }}</h6>
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
import { type INote, Note } from '~/model/note.model'
import { type IBaloon } from '~/model/baloon.model'
import { type IPosition } from '~/model/position.model'

// Composables
const { t } = useI18n('notes')
const { $api } = useNuxtApp()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: INote
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  initialData: undefined
})

// Emits
const emit = defineEmits<{
  submit: [note: INote]
  cancel: []
}>()

// Reactive Data
const formData = ref<INote>({
  id: undefined,
  creoId: null,
  code: null,
  name: null,
  noteName: null,
  noteValue: null,
  noteType: null,
  order: null,
  position: null,
  baloon: null
})

const positionData = ref({
  x: 0,
  y: 0,
  z: 0
})

const errors = ref<Record<string, string>>({})
const loading = ref({
  submit: false,
  balloons: false
})

const availableBalloons = ref<IBaloon[]>([])
const showAdvanced = ref(false)

// Computed
const noteTypes = computed(() => [
  'TEXT',
  'DIMENSION',
  'TOLERANCE',
  'SURFACE',
  'MATERIAL',
  'GENERAL',
  'REVISION',
  'CUSTOM'
])

const validationSummary = computed(() => {
  return Object.values(errors.value).filter(Boolean)
})

const isFormValid = computed(() => {
  return validateForm() && validationSummary.value.length === 0
})

// Separate ID for form binding
const formDataBaloonId = computed({
  get: () => formData.value.baloon?.id,
  set: (value) => {
    if (value) {
      const balloon = availableBalloons.value.find(b => b.id === value)
      formData.value.baloon = balloon || null
    } else {
      formData.value.baloon = null
    }
  }
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.code?.trim()) {
    errors.value.code = t('notes:form.validation.code_required')
  }
  
  if (!formData.value.name?.trim()) {
    errors.value.name = t('notes:form.validation.name_required')
  }
  
  if (formData.value.order !== null && formData.value.order !== undefined) {
    if (formData.value.order < 1 || formData.value.order > 999) {
      errors.value.order = t('notes:form.validation.order_range')
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const loadBalloons = async () => {
  loading.value.balloons = true
  try {
    // Mock data - replace with actual API call
    availableBalloons.value = [
      { id: 1, code: 'BAL001', name: 'Main Balloon', baloonValue: '1' },
      { id: 2, code: 'BAL002', name: 'Secondary Balloon', baloonValue: '2' },
      { id: 3, code: 'BAL003', name: 'Detail Balloon', baloonValue: 'A' }
    ]
  } catch (error) {
    console.error('Error loading balloons:', error)
  } finally {
    loading.value.balloons = false
  }
}

const updatePosition = () => {
  if (positionData.value.x !== 0 || positionData.value.y !== 0 || positionData.value.z !== 0) {
    formData.value.position = {
      x: positionData.value.x,
      y: positionData.value.y,
      z: positionData.value.z
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
    
    const note = new Note(
      formData.value.id,
      formData.value.creoId,
      formData.value.code,
      formData.value.name,
      formData.value.noteName,
      formData.value.noteValue,
      formData.value.noteType,
      formData.value.order,
      formData.value.position,
      formData.value.baloon
    )
    
    emit('submit', note)
  } catch (error) {
    console.error('Error submitting form:', error)
    errors.value.form = t('notes:form.validation.submit_error')
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
        x: newData.position.x || 0,
        y: newData.position.y || 0,
        z: newData.position.z || 0
      }
      showAdvanced.value = true
    }
  }
}, { immediate: true })

watch(positionData, updatePosition, { deep: true })

// Lifecycle
onMounted(() => {
  loadBalloons()
})
</script>

<style scoped>
.form-label.small {
  font-size: 0.875rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}
</style>