<template>
  <div class="entity-form">
    <div class="card">
      <div class="card-header" v-if="showHeader">
        <h5 class="card-title mb-0">
          {{ title || (mode === 'create' ? t('common:create') : t('common:edit')) }} {{ entityName }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <slot 
            :formData="formData"
            :errors="errors"
            :loading="loading"
            :validateField="validateField"
            :mode="mode"
            :isFormValid="isFormValid"
          />
          
          <!-- Validation Summary -->
          <div v-if="validationSummary.length > 0" class="alert alert-warning">
            <h6>{{ t('common:validation.summary_title') }}</h6>
            <ul class="mb-0">
              <li v-for="error in validationSummary" :key="error">{{ error }}</li>
            </ul>
          </div>

          <!-- Form Actions -->
          <div class="d-flex justify-content-end gap-2" v-if="showActions">
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
import { ref, computed, watch } from 'vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  entityName: string
  initialData?: any
  showHeader?: boolean
  showActions?: boolean
  title?: string
  validationRules?: Record<string, (value: any) => string | null>
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  showHeader: true,
  showActions: true,
  validationRules: () => ({})
})

// Emits
const emit = defineEmits<{
  submit: [data: any]
  cancel: []
  validate: [isValid: boolean]
}>()

// Reactive Data
const formData = ref<any>({})
const errors = ref<Record<string, string>>({})
const loading = ref({
  submit: false
})

// Computed
const validationSummary = computed(() => {
  return Object.values(errors.value).filter(Boolean)
})

const isFormValid = computed(() => {
  const hasRequiredFields = Object.keys(props.validationRules).every(field => {
    const value = formData.value[field]
    return value !== null && value !== undefined && value !== ''
  })
  
  return hasRequiredFields && validationSummary.value.length === 0
})

// Methods
const validateField = (fieldName: string): boolean => {
  // Clear previous error
  delete errors.value[fieldName]
  
  // Apply validation rule if exists
  const rule = props.validationRules[fieldName]
  if (rule) {
    const error = rule(formData.value[fieldName])
    if (error) {
      errors.value[fieldName] = error
      return false
    }
  }
  
  return true
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true
  
  // Validate all fields with rules
  Object.keys(props.validationRules).forEach(field => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  
  emit('validate', isValid)
  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) return
  
  loading.value.submit = true
  try {
    emit('submit', { ...formData.value })
  } finally {
    loading.value.submit = false
  }
}

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  } else {
    formData.value = {}
  }
  errors.value = {}
}, { immediate: true })

// Expose methods for parent components
defineExpose({
  formData,
  validateForm,
  validateField,
  resetForm: () => {
    formData.value = props.initialData ? { ...props.initialData } : {}
    errors.value = {}
  }
})
</script>

<style scoped>
.entity-form {
  max-width: 100%;
}

.card-title {
  color: var(--bs-primary);
  font-weight: 600;
}

.form-text {
  font-size: 0.75rem;
  color: #6c757d;
}

.text-danger {
  color: #dc3545 !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>