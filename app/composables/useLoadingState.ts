/**
 * Global Loading State Composable
 * 
 * Provides centralized loading state management with consistent UI patterns,
 * progress tracking, and performance optimization across the application.
 * 
 * @version 2.0.0
 */

import { ref, computed, watch } from 'vue'

export interface LoadingOperation {
  id: string
  label: string
  progress?: number // 0-100
  cancellable?: boolean
  onCancel?: () => void
  context?: string
  startTime: Date
  estimatedDuration?: number // in milliseconds
}

export interface LoadingOptions {
  label?: string
  progress?: number
  cancellable?: boolean
  onCancel?: () => void
  context?: string
  estimatedDuration?: number
  showGlobalIndicator?: boolean
}

// Global loading state
const activeOperations = ref<Map<string, LoadingOperation>>(new Map())
const globalLoadingVisible = ref(false)

// Operation counters for debugging
let operationCounter = 0

export const useLoadingState = () => {
  // Generate unique operation ID
  const generateOperationId = (): string => {
    operationCounter++
    return `loading_${Date.now()}_${operationCounter}`
  }

  // Start a loading operation
  const startLoading = (options: LoadingOptions = {}): string => {
    const operationId = generateOperationId()
    
    const operation: LoadingOperation = {
      id: operationId,
      label: options.label || 'Loading...',
      progress: options.progress,
      cancellable: options.cancellable || false,
      onCancel: options.onCancel,
      context: options.context,
      startTime: new Date(),
      estimatedDuration: options.estimatedDuration
    }

    activeOperations.value.set(operationId, operation)

    // Show global indicator if requested or if it's the first operation
    if (options.showGlobalIndicator || activeOperations.value.size === 1) {
      globalLoadingVisible.value = true
    }

    return operationId
  }

  // Update loading operation
  const updateLoading = (
    operationId: string, 
    updates: Partial<Omit<LoadingOperation, 'id' | 'startTime'>>
  ): boolean => {
    const operation = activeOperations.value.get(operationId)
    if (!operation) {
      console.warn(`[useLoadingState] Operation ${operationId} not found`)
      return false
    }

    // Update operation with new values
    const updatedOperation = { ...operation, ...updates }
    activeOperations.value.set(operationId, updatedOperation)
    
    return true
  }

  // Stop a loading operation
  const stopLoading = (operationId: string): boolean => {
    const success = activeOperations.value.delete(operationId)
    
    // Hide global indicator if no operations are active
    if (activeOperations.value.size === 0) {
      globalLoadingVisible.value = false
    }

    return success
  }

  // Cancel a specific operation
  const cancelOperation = (operationId: string): boolean => {
    const operation = activeOperations.value.get(operationId)
    if (!operation) {
      return false
    }

    // Call cancel handler if available
    if (operation.cancellable && operation.onCancel) {
      try {
        operation.onCancel()
      } catch (error) {
        console.error(`[useLoadingState] Error canceling operation ${operationId}:`, error)
      }
    }

    return stopLoading(operationId)
  }

  // Cancel all operations (emergency stop)
  const cancelAllOperations = (): void => {
    const operations = Array.from(activeOperations.value.values())
    
    operations.forEach(operation => {
      if (operation.cancellable && operation.onCancel) {
        try {
          operation.onCancel()
        } catch (error) {
          console.error(`[useLoadingState] Error canceling operation ${operation.id}:`, error)
        }
      }
    })

    activeOperations.value.clear()
    globalLoadingVisible.value = false
  }

  // Get operations by context
  const getOperationsByContext = (context: string) => {
    return computed(() => 
      Array.from(activeOperations.value.values())
        .filter(op => op.context === context)
    )
  }

  // Computed properties
  const isLoading = computed(() => activeOperations.value.size > 0)
  
  const isLoadingContext = (context: string) => {
    return computed(() => 
      Array.from(activeOperations.value.values())
        .some(op => op.context === context)
    )
  }

  const loadingOperations = computed(() => 
    Array.from(activeOperations.value.values())
  )

  const primaryOperation = computed(() => {
    const operations = loadingOperations.value
    if (operations.length === 0) return null
    
    // Return the most recent operation
    return operations.reduce((latest, current) => 
      current.startTime > latest.startTime ? current : latest
    )
  })

  const overallProgress = computed(() => {
    const operations = loadingOperations.value
    if (operations.length === 0) return 0

    const operationsWithProgress = operations.filter(op => 
      op.progress !== undefined && op.progress >= 0
    )
    
    if (operationsWithProgress.length === 0) return undefined

    const totalProgress = operationsWithProgress.reduce(
      (sum, op) => sum + (op.progress || 0), 0
    )
    
    return Math.round(totalProgress / operationsWithProgress.length)
  })

  // Helper functions for common patterns

  // Async operation wrapper
  const withLoading = async <T>(
    operation: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    const operationId = startLoading(options)
    
    try {
      const result = await operation()
      return result
    } finally {
      stopLoading(operationId)
    }
  }

  // Async operation with progress tracking
  const withProgressLoading = async <T>(
    operation: (updateProgress: (progress: number) => void) => Promise<T>,
    options: Omit<LoadingOptions, 'progress'> = {}
  ): Promise<T> => {
    const operationId = startLoading({ ...options, progress: 0 })
    
    const updateProgress = (progress: number) => {
      updateLoading(operationId, { progress: Math.max(0, Math.min(100, progress)) })
    }
    
    try {
      const result = await operation(updateProgress)
      updateProgress(100)
      return result
    } finally {
      // Small delay to show 100% before hiding
      setTimeout(() => stopLoading(operationId), 100)
    }
  }

  // API call wrapper with automatic loading state
  const withApiLoading = async <T>(
    apiCall: () => Promise<T>,
    options: LoadingOptions & { endpoint?: string } = {}
  ): Promise<T> => {
    const context = options.endpoint ? `API: ${options.endpoint}` : 'API'
    const label = options.label || `Loading ${options.endpoint || 'data'}...`
    
    return withLoading(apiCall, {
      ...options,
      context,
      label,
      showGlobalIndicator: true
    })
  }

  // Page loading wrapper
  const withPageLoading = async <T>(
    pageLoad: () => Promise<T>,
    pageName: string
  ): Promise<T> => {
    return withLoading(pageLoad, {
      label: `Loading ${pageName}...`,
      context: 'page',
      showGlobalIndicator: true,
      estimatedDuration: 2000 // 2 seconds typical page load
    })
  }

  // Statistics for debugging
  const loadingStats = computed(() => {
    const operations = loadingOperations.value
    const now = new Date()
    
    return {
      total: operations.length,
      byContext: operations.reduce((acc, op) => {
        const context = op.context || 'general'
        acc[context] = (acc[context] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageDuration: operations.length > 0 
        ? operations.reduce((sum, op) => 
            sum + (now.getTime() - op.startTime.getTime()), 0
          ) / operations.length 
        : 0,
      longestRunning: operations.length > 0
        ? operations.reduce((longest, current) => 
            (now.getTime() - current.startTime.getTime()) > 
            (now.getTime() - longest.startTime.getTime()) 
              ? current 
              : longest
          )
        : null
    }
  })

  // Cleanup long-running operations (emergency timeout)
  const cleanupStaleOperations = (maxAge: number = 30000): number => {
    const now = new Date()
    let cleaned = 0
    
    Array.from(activeOperations.value.entries()).forEach(([id, operation]) => {
      const age = now.getTime() - operation.startTime.getTime()
      if (age > maxAge) {
        console.warn(`[useLoadingState] Cleaning up stale operation: ${id} (${age}ms old)`)
        stopLoading(id)
        cleaned++
      }
    })
    
    return cleaned
  }

  return {
    // Core functions
    startLoading,
    stopLoading,
    updateLoading,
    cancelOperation,
    cancelAllOperations,
    
    // Helper functions
    withLoading,
    withProgressLoading,
    withApiLoading,
    withPageLoading,
    
    // Queries
    getOperationsByContext,
    isLoadingContext,
    
    // State
    loadingOperations: readonly(loadingOperations),
    
    // Computed
    isLoading,
    primaryOperation,
    overallProgress,
    globalLoadingVisible: readonly(globalLoadingVisible),
    loadingStats,
    
    // Utilities
    cleanupStaleOperations
  }
}