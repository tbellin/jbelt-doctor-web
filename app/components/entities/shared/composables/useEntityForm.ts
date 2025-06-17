import { ref, computed, watch } from 'vue'

export interface EntityFormOptions<T = any> {
  initialData?: T
  validationRules?: Record<string, (value: any) => string | null>
  onSubmit?: (data: T) => Promise<void> | void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export function useEntityForm<T extends Record<string, any>>(options: EntityFormOptions<T> = {}) {
  const {
    initialData,
    validationRules = {},
    onSubmit,
    onCancel,
    mode = 'create'
  } = options

  // Reactive state
  const formData = ref<T>({} as T)
  const errors = ref<Record<string, string>>({})
  const loading = ref(false)
  const isDirty = ref(false)

  // Computed
  const isValid = computed(() => {
    // Check required fields based on validation rules
    const hasRequiredFields = Object.keys(validationRules).every(field => {
      const value = formData.value[field]
      if (validationRules[field]) {
        return validationRules[field](value) === null
      }
      return true
    })

    return hasRequiredFields && Object.keys(errors.value).length === 0
  })

  const validationSummary = computed(() => {
    return Object.values(errors.value).filter(Boolean)
  })

  // Methods
  const validateField = (fieldName: string): boolean => {
    // Clear previous error
    delete errors.value[fieldName]

    // Apply validation rule if exists
    const rule = validationRules[fieldName]
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
    let isFormValid = true

    // Validate all fields with rules
    Object.keys(validationRules).forEach(field => {
      if (!validateField(field)) {
        isFormValid = false
      }
    })

    return isFormValid
  }

  const resetForm = () => {
    formData.value = initialData ? { ...initialData } : ({} as T)
    errors.value = {}
    isDirty.value = false
  }

  const setFieldValue = (field: string, value: any) => {
    (formData.value as any)[field] = value
    isDirty.value = true
    
    // Auto-validate on change
    if (validationRules[field]) {
      validateField(field)
    }
  }

  const getFieldValue = (field: string) => {
    return (formData.value as any)[field]
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    loading.value = true
    try {
      if (onSubmit) {
        await onSubmit(formData.value)
      }
      isDirty.value = false
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    resetForm()
  }

  // Watchers
  watch(
    () => initialData,
    (newData) => {
      if (newData) {
        formData.value = { ...newData }
      }
      isDirty.value = false
    },
    { immediate: true, deep: true }
  )

  // Initialize form
  resetForm()

  return {
    // State
    formData,
    errors,
    loading,
    isDirty,
    mode,

    // Computed
    isValid,
    validationSummary,

    // Methods
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    getFieldValue,
    handleSubmit,
    handleCancel
  }
}

// Common validation rules
export const commonValidationRules = {
  required: (fieldName: string) => (value: any) => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`
    }
    return null
  },

  minLength: (fieldName: string, min: number) => (value: any) => {
    if (value && String(value).length < min) {
      return `${fieldName} must be at least ${min} characters long`
    }
    return null
  },

  maxLength: (fieldName: string, max: number) => (value: any) => {
    if (value && String(value).length > max) {
      return `${fieldName} must be at most ${max} characters long`
    }
    return null
  },

  email: (fieldName: string) => (value: any) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${fieldName} must be a valid email address`
    }
    return null
  },

  number: (fieldName: string) => (value: any) => {
    if (value && isNaN(Number(value))) {
      return `${fieldName} must be a valid number`
    }
    return null
  },

  positiveNumber: (fieldName: string) => (value: any) => {
    if (value && (isNaN(Number(value)) || Number(value) < 0)) {
      return `${fieldName} must be a positive number`
    }
    return null
  },

  range: (fieldName: string, min: number, max: number) => (value: any) => {
    const num = Number(value)
    if (value && (!isNaN(num) && (num < min || num > max))) {
      return `${fieldName} must be between ${min} and ${max}`
    }
    return null
  }
}