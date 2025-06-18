<!--
  Global Toast Notifications Component
  
  Displays toast notifications from the global error handler.
  Supports different types (error, warning, info, success) with actions.
  
  @version 2.0.0
-->
<template>
  <Teleport to="body">
    <div 
      class="toast-container position-fixed top-0 end-0 p-3" 
      style="z-index: 1055;"
    >
      <TransitionGroup 
        name="toast" 
        tag="div"
        class="toast-stack"
      >
        <div
          v-for="toast in toastQueue"
          :key="toast.id"
          class="toast show mb-2"
          :class="getToastClasses(toast)"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <!-- Toast Header -->
          <div class="toast-header" :class="getHeaderClasses(toast)">
            <i :class="getIconClass(toast)" class="me-2"></i>
            <strong class="me-auto">{{ getToastTitle(toast) }}</strong>
            <small class="text-muted">{{ formatTime(toast.timestamp) }}</small>
            <button
              v-if="toast.dismissible"
              type="button"
              class="btn-close"
              @click="removeToast(toast.id)"
              aria-label="Close"
            ></button>
          </div>

          <!-- Toast Body -->
          <div class="toast-body">
            <div class="toast-message">
              {{ toast.message }}
            </div>

            <!-- Technical Details (Debug Mode) -->
            <div 
              v-if="isDebugMode && toast.technical" 
              class="mt-2 small text-muted"
            >
              <details>
                <summary class="cursor-pointer">Technical Details</summary>
                <pre class="mt-2 mb-0 small">{{ toast.technical }}</pre>
              </details>
            </div>

            <!-- Actions -->
            <div 
              v-if="toast.actions && toast.actions.length" 
              class="mt-3 d-flex gap-2"
            >
              <button
                v-for="action in toast.actions"
                :key="action.label"
                type="button"
                :class="getActionButtonClass(action.variant)"
                @click="handleActionClick(action, toast)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <!-- Progress Bar (for timed toasts) -->
          <div 
            v-if="toast.duration && toast.duration > 0"
            class="toast-progress"
            :style="getProgressStyle(toast)"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useErrorHandler, type ToastNotification } from '~/composables/useErrorHandler'
import { useI18n } from '~/composables/useI18n'

const { toastQueue, removeToast, isDebugMode } = useErrorHandler()
const { t } = useI18n()

// Progress tracking for timed toasts
const progressIntervals = new Map<string, NodeJS.Timeout>()

// Get toast classes based on type
const getToastClasses = (toast: ToastNotification): string => {
  const classes = ['border-0']
  
  switch (toast.type) {
    case 'error':
      classes.push('bg-danger', 'text-white')
      break
    case 'warning':
      classes.push('bg-warning', 'text-dark')
      break
    case 'info':
      classes.push('bg-info', 'text-white')
      break
    case 'success':
      classes.push('bg-success', 'text-white')
      break
  }
  
  return classes.join(' ')
}

// Get header classes
const getHeaderClasses = (toast: ToastNotification): string => {
  switch (toast.type) {
    case 'error':
      return 'bg-danger text-white border-0'
    case 'warning':
      return 'bg-warning text-dark border-0'
    case 'info':
      return 'bg-info text-white border-0'
    case 'success':
      return 'bg-success text-white border-0'
    default:
      return ''
  }
}

// Get icon class based on toast type
const getIconClass = (toast: ToastNotification): string => {
  switch (toast.type) {
    case 'error':
      return 'bi bi-exclamation-triangle-fill'
    case 'warning':
      return 'bi bi-exclamation-circle-fill'
    case 'info':
      return 'bi bi-info-circle-fill'
    case 'success':
      return 'bi bi-check-circle-fill'
    default:
      return 'bi bi-info-circle'
  }
}

// Get toast title based on type
const getToastTitle = (toast: ToastNotification): string => {
  if (toast.context) {
    return toast.context
  }
  
  switch (toast.type) {
    case 'error':
      return t ? t('notifications.error') : 'Error'
    case 'warning':
      return t ? t('notifications.warning') : 'Warning'
    case 'info':
      return t ? t('notifications.info') : 'Information'
    case 'success':
      return t ? t('notifications.success') : 'Success'
    default:
      return 'Notification'
  }
}

// Get action button class
const getActionButtonClass = (variant?: string): string => {
  const baseClasses = 'btn btn-sm'
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} btn-primary`
    case 'secondary':
      return `${baseClasses} btn-secondary`
    case 'danger':
      return `${baseClasses} btn-danger`
    default:
      return `${baseClasses} btn-outline-light`
  }
}

// Handle action click
const handleActionClick = (action: any, toast: ToastNotification): void => {
  try {
    action.action()
  } catch (error) {
    console.error('[ToastNotifications] Action error:', error)
  }
}

// Format timestamp
const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get progress bar style
const getProgressStyle = (toast: ToastNotification): Record<string, string> => {
  if (!toast.duration || toast.duration <= 0) {
    return { display: 'none' }
  }
  
  // This is a simple implementation. For actual progress,
  // you'd need to track elapsed time
  return {
    height: '3px',
    background: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    position: 'absolute',
    bottom: '0',
    left: '0'
  }
}

// Cleanup intervals on unmount
onUnmounted(() => {
  progressIntervals.forEach(interval => clearInterval(interval))
  progressIntervals.clear()
})
</script>

<style scoped>
.toast-container {
  max-width: 400px;
  width: 100%;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  position: relative;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.toast-message {
  word-wrap: break-word;
  line-height: 1.4;
}

.toast-progress {
  transition: width 0.1s linear;
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Debug mode styles */
details {
  cursor: pointer;
}

details summary {
  list-style: none;
  outline: none;
}

details summary::-webkit-details-marker {
  display: none;
}

details summary::before {
  content: '▶';
  display: inline-block;
  width: 1em;
  margin-right: 0.5em;
  transition: transform 0.2s;
}

details[open] summary::before {
  transform: rotate(90deg);
}

details pre {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  max-height: 150px;
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>