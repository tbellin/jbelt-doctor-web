<!--
  Global Loading Overlay Component
  
  Displays a sophisticated loading overlay with progress tracking,
  operation details, and cancellation support.
  
  @version 2.0.0
-->
<template>
  <Teleport to="body">
    <Transition name="loading-overlay">
      <div
        v-if="globalLoadingVisible && primaryOperation"
        class="loading-overlay"
        role="dialog"
        aria-live="polite"
        :aria-label="primaryOperation.label"
      >
        <div class="loading-backdrop" @click="handleBackdropClick"></div>
        
        <div class="loading-content">
          <!-- Main Loading Card -->
          <div class="loading-card">
            <!-- Header -->
            <div class="loading-header">
              <div class="loading-title">
                <i class="bi bi-arrow-clockwise loading-icon me-2"></i>
                {{ primaryOperation.label }}
              </div>
              
              <!-- Multiple operations indicator -->
              <div v-if="loadingOperations.length > 1" class="operations-badge">
                {{ loadingOperations.length }} operations
              </div>
              
              <!-- Cancel button -->
              <button
                v-if="primaryOperation.cancellable"
                type="button"
                class="btn-close loading-cancel"
                @click="cancelPrimaryOperation"
                :title="t ? t('common.cancel') : 'Cancel'"
                aria-label="Cancel operation"
              ></button>
            </div>

            <!-- Progress Section -->
            <div class="loading-body">
              <!-- Progress Bar -->
              <div v-if="showProgress" class="progress-section">
                <div class="progress loading-progress">
                  <div
                    class="progress-bar progress-bar-striped progress-bar-animated"
                    :class="progressBarClass"
                    role="progressbar"
                    :style="{ width: `${displayProgress}%` }"
                    :aria-valuenow="displayProgress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span v-if="displayProgress > 10" class="progress-text">
                      {{ displayProgress }}%
                    </span>
                  </div>
                </div>
                
                <div class="progress-info">
                  <span class="progress-label">
                    {{ displayProgress }}% Complete
                  </span>
                  <span v-if="estimatedTimeRemaining" class="time-remaining">
                    {{ formatTimeRemaining(estimatedTimeRemaining) }} remaining
                  </span>
                </div>
              </div>

              <!-- Indeterminate Loading -->
              <div v-else class="indeterminate-section">
                <div class="loading-spinner">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div class="loading-details">
                  <div class="operation-context" v-if="primaryOperation.context">
                    {{ primaryOperation.context }}
                  </div>
                  <div class="operation-duration">
                    {{ formatDuration(elapsedTime) }}
                  </div>
                </div>
              </div>

              <!-- Multiple Operations List -->
              <div v-if="loadingOperations.length > 1" class="operations-list">
                <details class="operations-details">
                  <summary class="operations-summary">
                    <i class="bi bi-list-ul me-2"></i>
                    View all {{ loadingOperations.length }} operations
                  </summary>
                  
                  <div class="operations-content">
                    <div
                      v-for="operation in loadingOperations"
                      :key="operation.id"
                      class="operation-item"
                      :class="{ 'operation-primary': operation.id === primaryOperation.id }"
                    >
                      <div class="operation-info">
                        <div class="operation-label">{{ operation.label }}</div>
                        <div v-if="operation.context" class="operation-context-small">
                          {{ operation.context }}
                        </div>
                      </div>
                      
                      <div class="operation-controls">
                        <div v-if="operation.progress !== undefined" class="operation-progress">
                          {{ operation.progress }}%
                        </div>
                        <button
                          v-if="operation.cancellable"
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          @click="cancelOperation(operation.id)"
                          :title="t ? t('common.cancel') : 'Cancel'"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            <!-- Footer -->
            <div class="loading-footer" v-if="showFooter">
              <!-- Emergency Cancel All -->
              <button
                v-if="loadingOperations.some(op => op.cancellable)"
                type="button"
                class="btn btn-sm btn-outline-secondary"
                @click="handleCancelAll"
              >
                <i class="bi bi-stop-circle me-1"></i>
                {{ t ? t('common.cancelAll') : 'Cancel All' }}
              </button>
              
              <!-- Debug Info -->
              <div v-if="isDebugMode" class="debug-info">
                <small class="text-muted">
                  Debug: {{ loadingStats.total }} ops, 
                  avg {{ Math.round(loadingStats.averageDuration) }}ms
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useLoadingState } from '~/composables/useLoadingState'
import { useI18n } from '~/composables/useI18n'

const {
  globalLoadingVisible,
  loadingOperations,
  primaryOperation,
  overallProgress,
  loadingStats,
  cancelOperation,
  cancelAllOperations,
  isLoading
} = useLoadingState()

const { t } = useI18n()

// Local state
const elapsedTime = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)

// Debug mode
const isDebugMode = process.env.NUXT_DEBUG === 'true'

// Computed properties
const showProgress = computed(() => {
  return primaryOperation.value?.progress !== undefined || overallProgress.value !== undefined
})

const displayProgress = computed(() => {
  if (primaryOperation.value?.progress !== undefined) {
    return primaryOperation.value.progress
  }
  return overallProgress.value || 0
})

const progressBarClass = computed(() => {
  if (displayProgress.value < 30) return 'bg-danger'
  if (displayProgress.value < 70) return 'bg-warning'
  return 'bg-success'
})

const estimatedTimeRemaining = computed(() => {
  if (!primaryOperation.value?.estimatedDuration || !primaryOperation.value?.progress) {
    return null
  }
  
  const progress = primaryOperation.value.progress
  const estimated = primaryOperation.value.estimatedDuration
  const remaining = (estimated * (100 - progress)) / 100
  
  return remaining > 1000 ? remaining : null
})

const showFooter = computed(() => {
  return loadingOperations.value.some(op => op.cancellable) || isDebugMode
})

// Timer for elapsed time
const startTimer = () => {
  if (timer.value) clearInterval(timer.value)
  
  timer.value = setInterval(() => {
    if (primaryOperation.value) {
      elapsedTime.value = Date.now() - primaryOperation.value.startTime.getTime()
    }
  }, 100)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  elapsedTime.value = 0
}

// Watch for loading state changes
watch(isLoading, (newIsLoading) => {
  if (newIsLoading) {
    startTimer()
  } else {
    stopTimer()
  }
}, { immediate: true })

// Event handlers
const handleBackdropClick = () => {
  // Only allow backdrop cancel if primary operation is cancellable
  if (primaryOperation.value?.cancellable) {
    cancelPrimaryOperation()
  }
}

const cancelPrimaryOperation = () => {
  if (primaryOperation.value) {
    cancelOperation(primaryOperation.value.id)
  }
}

const handleCancelAll = () => {
  if (confirm(t ? t('common.confirmCancelAll') : 'Cancel all operations?')) {
    cancelAllOperations()
  }
}

// Utility functions
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
}

const formatTimeRemaining = (ms: number): string => {
  if (ms < 1000) return '< 1s'
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Cleanup
onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.loading-content {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 500px;
}

.loading-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  overflow: hidden;
}

.loading-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.loading-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: #0d6efd;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.operations-badge {
  background: #0d6efd;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.loading-cancel {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.loading-cancel:hover {
  opacity: 1;
}

.loading-body {
  padding: 1.5rem;
}

.progress-section {
  margin-bottom: 1rem;
}

.loading-progress {
  height: 0.75rem;
  margin-bottom: 0.75rem;
  background-color: #e9ecef;
  border-radius: 0.375rem;
}

.progress-bar {
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 0.75rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.progress-label {
  font-weight: 500;
  color: #495057;
}

.time-remaining {
  color: #6c757d;
}

.indeterminate-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  flex-shrink: 0;
}

.loading-details {
  flex-grow: 1;
}

.operation-context {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.operation-duration {
  font-size: 0.75rem;
  color: #adb5bd;
  font-family: monospace;
}

.operations-list {
  margin-top: 1rem;
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.operations-details {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.operations-summary {
  padding: 0.75rem;
  background-color: #f8f9fa;
  cursor: pointer;
  list-style: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.operations-summary:hover {
  background-color: #e9ecef;
}

.operations-content {
  border-top: 1px solid #dee2e6;
  max-height: 200px;
  overflow-y: auto;
}

.operation-item {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f3f4;
}

.operation-item:last-child {
  border-bottom: none;
}

.operation-primary {
  background-color: rgba(13, 110, 253, 0.05);
  border-left: 3px solid #0d6efd;
}

.operation-info {
  flex-grow: 1;
}

.operation-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
}

.operation-context-small {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.125rem;
}

.operation-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.operation-progress {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0d6efd;
  font-family: monospace;
}

.loading-footer {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-info {
  font-family: monospace;
}

/* Animations */
.loading-overlay-enter-active {
  transition: all 0.3s ease-out;
}

.loading-overlay-leave-active {
  transition: all 0.3s ease-in;
}

.loading-overlay-enter-from {
  opacity: 0;
}

.loading-overlay-enter-from .loading-card {
  transform: scale(0.9) translateY(-20px);
}

.loading-overlay-leave-to {
  opacity: 0;
}

.loading-overlay-leave-to .loading-card {
  transform: scale(0.9) translateY(-20px);
}

/* Responsive */
@media (max-width: 576px) {
  .loading-content {
    width: 95%;
    margin: 1rem;
  }
  
  .loading-header {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .loading-body {
    padding: 1rem;
  }
  
  .loading-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .indeterminate-section {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .progress-info {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
}
</style>