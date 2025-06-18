/**
 * Global Error Handler Composable
 * 
 * Provides centralized error handling with consistent UI feedback,
 * logging, and user experience across the entire application.
 * 
 * @version 2.0.0
 */

import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

export interface ErrorInfo {
  id: string
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  timestamp: Date
  context?: string
  technical?: string
  retryable?: boolean
  onRetry?: () => Promise<void>
}

export interface ToastNotification extends ErrorInfo {
  duration?: number
  dismissible?: boolean
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

export interface ApiError {
  status?: number
  message?: string
  technical?: string
  retryable?: boolean
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// Global error state
const globalErrors = ref<ErrorInfo[]>([])
const toastQueue = ref<ToastNotification[]>([])
const isDebugMode = process.env.NUXT_DEBUG === 'true'

export const useErrorHandler = () => {
  const { t } = useI18n()

  // Helper to generate unique error ID
  const generateErrorId = (): string => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Helper to determine error type from various sources
  const determineErrorType = (error: any): 'error' | 'warning' | 'info' => {
    if (error?.status) {
      if (error.status >= 500) return 'error'
      if (error.status >= 400) return 'warning'
      return 'info'
    }
    return 'error'
  }

  // Helper to extract user-friendly message
  const getUserMessage = (error: any, context?: string): string => {
    // Try to get localized message first
    if (error?.code && t) {
      try {
        const localizedMessage = t(`errors.${error.code}`)
        if (localizedMessage !== `errors.${error.code}`) {
          return localizedMessage
        }
      } catch (e) {
        // Fallback to default messages
      }
    }

    // Fallback to error message or default
    if (error?.message) {
      return error.message
    }

    // Context-specific defaults
    switch (context) {
      case 'api':
        return t ? t('errors.api.general') : 'Server communication error'
      case 'validation':
        return t ? t('errors.validation.general') : 'Please check your input'
      case 'network':
        return t ? t('errors.network.general') : 'Network connection error'
      case 'auth':
        return t ? t('errors.auth.general') : 'Authentication error'
      default:
        return t ? t('errors.general') : 'An unexpected error occurred'
    }
  }

  // Helper to determine if error is retryable
  const isRetryableError = (error: any): boolean => {
    if (error?.retryable !== undefined) {
      return error.retryable
    }

    // Network errors are usually retryable
    if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      return true
    }

    // HTTP status codes that are retryable
    if (error?.status) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504]
      return retryableStatuses.includes(error.status)
    }

    return false
  }

  // Core error handling function
  const handleError = (
    error: any,
    context?: string,
    options?: {
      showToast?: boolean
      showInUI?: boolean
      logToConsole?: boolean
      onRetry?: () => Promise<void>
    }
  ): ErrorInfo => {
    const defaultOptions = {
      showToast: true,
      showInUI: false,
      logToConsole: isDebugMode,
      ...options
    }

    const errorInfo: ErrorInfo = {
      id: generateErrorId(),
      message: getUserMessage(error, context),
      type: determineErrorType(error),
      timestamp: new Date(),
      context,
      technical: error?.stack || error?.toString() || 'Unknown error',
      retryable: isRetryableError(error),
      onRetry: defaultOptions.onRetry
    }

    // Log to console if enabled
    if (defaultOptions.logToConsole) {
      console.group(`[ErrorHandler] ${errorInfo.type.toUpperCase()}: ${context || 'General'}`)
      console.error('User Message:', errorInfo.message)
      console.error('Technical Details:', errorInfo.technical)
      console.error('Original Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }

    // Add to global errors if UI display is requested
    if (defaultOptions.showInUI) {
      globalErrors.value.unshift(errorInfo)
      // Keep only last 50 errors
      if (globalErrors.value.length > 50) {
        globalErrors.value = globalErrors.value.slice(0, 50)
      }
    }

    // Show toast notification if requested
    if (defaultOptions.showToast) {
      showToast(errorInfo)
    }

    return errorInfo
  }

  // API-specific error handler
  const handleApiError = (
    error: any,
    endpoint?: string,
    options?: {
      showToast?: boolean
      onRetry?: () => Promise<void>
    }
  ): ErrorInfo => {
    const apiError: ApiError = {
      status: error?.response?.status || error?.status,
      message: error?.response?.data?.message || error?.message,
      technical: error?.response?.data?.detail || error?.stack,
      retryable: isRetryableError(error)
    }

    const context = endpoint ? `API: ${endpoint}` : 'API'
    
    return handleError(apiError, context, {
      showToast: options?.showToast ?? true,
      showInUI: false,
      logToConsole: true,
      onRetry: options?.onRetry
    })
  }

  // Validation-specific error handler
  const handleValidationErrors = (
    errors: ValidationError[],
    options?: {
      showToast?: boolean
    }
  ): ErrorInfo => {
    const validationError = {
      message: `Validation failed for ${errors.length} field(s)`,
      fields: errors,
      code: 'VALIDATION_ERROR'
    }

    return handleError(validationError, 'validation', {
      showToast: options?.showToast ?? true,
      showInUI: false,
      logToConsole: true
    })
  }

  // Toast notification system
  const showToast = (
    errorInfo: ErrorInfo,
    options?: {
      duration?: number
      dismissible?: boolean
      actions?: ToastNotification['actions']
    }
  ): void => {
    const toast: ToastNotification = {
      ...errorInfo,
      duration: options?.duration ?? (errorInfo.type === 'error' ? 5000 : 3000),
      dismissible: options?.dismissible ?? true,
      actions: options?.actions
    }

    // Add retry action if error is retryable
    if (errorInfo.retryable && errorInfo.onRetry && !toast.actions) {
      toast.actions = [{
        label: t ? t('common.retry') : 'Retry',
        action: async () => {
          try {
            await errorInfo.onRetry!()
            showSuccessToast(t ? t('messages.retrySuccess') : 'Operation completed successfully')
          } catch (retryError) {
            handleError(retryError, errorInfo.context)
          }
        },
        variant: 'primary'
      }]
    }

    toastQueue.value.push(toast)

    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }
  }

  // Success toast helper
  const showSuccessToast = (message: string, duration = 3000): void => {
    const successToast: ToastNotification = {
      id: generateErrorId(),
      message,
      type: 'success',
      timestamp: new Date(),
      duration,
      dismissible: true
    }

    toastQueue.value.push(successToast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(successToast.id)
      }, duration)
    }
  }

  // Info toast helper
  const showInfoToast = (message: string, duration = 3000): void => {
    const infoToast: ToastNotification = {
      id: generateErrorId(),
      message,
      type: 'info',
      timestamp: new Date(),
      duration,
      dismissible: true
    }

    toastQueue.value.push(infoToast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(infoToast.id)
      }, duration)
    }
  }

  // Remove toast by ID
  const removeToast = (id: string): void => {
    const index = toastQueue.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toastQueue.value.splice(index, 1)
    }
  }

  // Clear all toasts
  const clearAllToasts = (): void => {
    toastQueue.value = []
  }

  // Clear all errors
  const clearAllErrors = (): void => {
    globalErrors.value = []
  }

  // Remove specific error
  const removeError = (id: string): void => {
    const index = globalErrors.value.findIndex(error => error.id === id)
    if (index > -1) {
      globalErrors.value.splice(index, 1)
    }
  }

  // Get errors by context
  const getErrorsByContext = (context: string) => {
    return computed(() => 
      globalErrors.value.filter(error => error.context === context)
    )
  }

  // Check if there are any errors
  const hasErrors = computed(() => globalErrors.value.length > 0)
  const hasToasts = computed(() => toastQueue.value.length > 0)

  // Get recent errors (last 5)
  const recentErrors = computed(() => globalErrors.value.slice(0, 5))

  // Error statistics
  const errorStats = computed(() => {
    const stats = {
      total: globalErrors.value.length,
      errors: 0,
      warnings: 0,
      info: 0,
      byContext: {} as Record<string, number>
    }

    globalErrors.value.forEach(error => {
      stats[error.type]++
      if (error.context) {
        stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1
      }
    })

    return stats
  })

  return {
    // Core functions
    handleError,
    handleApiError,
    handleValidationErrors,

    // Toast functions
    showToast,
    showSuccessToast,
    showInfoToast,
    removeToast,
    clearAllToasts,

    // Error management
    removeError,
    clearAllErrors,
    getErrorsByContext,

    // State
    globalErrors: readonly(globalErrors),
    toastQueue: readonly(toastQueue),

    // Computed
    hasErrors,
    hasToasts,
    recentErrors,
    errorStats,

    // Utilities
    isDebugMode: isDebugMode
  }
}