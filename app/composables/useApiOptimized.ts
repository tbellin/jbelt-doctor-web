/**
 * Optimized API Composable - Enhanced Version
 * 
 * Features:
 * - Integrated error handling with useErrorHandler
 * - Automatic loading states with useLoadingState
 * - Response caching with TTL
 * - Request deduplication
 * - Retry logic for failed requests
 * - Performance monitoring
 * 
 * @version 2.0.0
 */

import { ref, computed } from 'vue'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import type { IFormat } from '~/model/format.model'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoadingState } from '~/composables/useLoadingState'
import { useDebug } from '~/composables/useDebug'

// Backward compatibility aliases
export type Model = IModel
export type Sheet = ISheet
export type Format = IFormat

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: number
  cached?: boolean
  duration?: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  id?: number
  login: string
  firstName: string
  lastName: string
  email: string
  langKey?: string
}

export type SheetWithRelations = ISheet

export interface SheetStatistics {
  totalCount: number
  sheetsWithDrawing: number
  sheetsWithoutDrawing: number
  formatTypeCounts: Record<string, number>
}

// Cache configuration
interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  endpoint: string
}

interface RequestConfig {
  retries?: number
  retryDelay?: number
  timeout?: number
  cache?: boolean | number // false, true (default TTL), or TTL in ms
  showLoading?: boolean
  loadingLabel?: string
  deduplicate?: boolean
}

// Cache storage
const responseCache = new Map<string, CacheEntry>()
const pendingRequests = new Map<string, Promise<any>>()

// Cache configuration
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100
const DEFAULT_RETRY_COUNT = 3
const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_TIMEOUT = 30000

export const useApiOptimized = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  const { logApiCall } = useDebug()
  const { handleApiError, showSuccessToast } = useErrorHandler()
  const { withApiLoading, startLoading, stopLoading } = useLoadingState()

  // Performance metrics
  const apiMetrics = ref({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    totalResponseTime: 0
  })

  // Cache management functions
  const getCacheKey = (endpoint: string, options: RequestInit): string => {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${endpoint}:${btoa(body)}`
  }

  const getCachedResponse = <T>(cacheKey: string): T | null => {
    const entry = responseCache.get(cacheKey)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      responseCache.delete(cacheKey)
      return null
    }

    apiMetrics.value.cacheHits++
    return entry.data
  }

  const setCachedResponse = <T>(
    cacheKey: string, 
    data: T, 
    endpoint: string, 
    ttl: number = DEFAULT_CACHE_TTL
  ): void => {
    // Implement LRU cache behavior
    if (responseCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = Array.from(responseCache.keys())[0]
      responseCache.delete(oldestKey)
    }

    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
      endpoint
    })
  }

  const clearCache = (pattern?: string): number => {
    if (!pattern) {
      const size = responseCache.size
      responseCache.clear()
      return size
    }

    let cleared = 0
    const regex = new RegExp(pattern)
    for (const [key, entry] of responseCache.entries()) {
      if (regex.test(entry.endpoint)) {
        responseCache.delete(key)
        cleared++
      }
    }
    return cleared
  }

  // Token management
  const getAuthToken = (): string | null => {
    // Try auth store first
    try {
      const { getToken } = useAuth()
      const token = getToken()
      if (token) return token
    } catch (err) {
      // Fallback to localStorage
    }
    
    if (process.client) {
      const possibleKeys = [
        'test_token', 'auth_token', 'authenticationToken', 
        'jhi-authenticationToken', 'token', 'jwt-token'
      ]
      
      for (const key of possibleKeys) {
        const token = localStorage.getItem(key)
        if (token) return token
      }
    }
    return null
  }

  // Retry logic
  const shouldRetry = (error: any, attempt: number, maxRetries: number): boolean => {
    if (attempt >= maxRetries) return false

    // Network errors are retryable
    if (!error.status) return true

    // Server errors are retryable
    if (error.status >= 500) return true

    // Rate limiting is retryable
    if (error.status === 429) return true

    // Timeout is retryable
    if (error.status === 408) return true

    return false
  }

  const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms))

  // Enhanced API call function
  const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    const {
      retries = DEFAULT_RETRY_COUNT,
      retryDelay = DEFAULT_RETRY_DELAY,
      timeout = DEFAULT_TIMEOUT,
      cache = true,
      showLoading = true,
      loadingLabel,
      deduplicate = true
    } = config

    const fullUrl = `${baseURL}${endpoint}`
    const method = options.method || 'GET'
    const startTime = Date.now()
    
    // Update metrics
    apiMetrics.value.totalRequests++

    // Check cache for GET requests
    const cacheKey = getCacheKey(endpoint, options)
    if (method === 'GET' && cache) {
      const cachedData = getCachedResponse<T>(cacheKey)
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          cached: true,
          duration: 0
        }
      }
    }

    // Deduplication for GET requests
    if (method === 'GET' && deduplicate && pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey)!
        return result
      } catch (error) {
        // If the pending request failed, continue with new request
      }
    }

    // Prepare request
    let requestBody: any = undefined
    if (options.body) {
      try {
        requestBody = JSON.parse(options.body as string)
      } catch (e) {
        requestBody = options.body
      }
    }

    // Loading state management
    let loadingId: string | undefined
    if (showLoading) {
      loadingId = startLoading({
        label: loadingLabel || `Loading ${endpoint}...`,
        context: `API: ${endpoint}`,
        cancellable: false,
        showGlobalIndicator: method !== 'GET' // Show global for mutations
      })
    }

    // Request function with retry logic
    const makeRequest = async (attempt: number = 1): Promise<ApiResponse<T>> => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options.headers as Record<string, string>
        }

        const token = getAuthToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const requestOptions: RequestInit = {
          ...options,
          headers,
          signal: controller.signal
        }

        console.log(`[APIOptimized] ${method} ${fullUrl} (attempt ${attempt})`)

        const response = await fetch(fullUrl, requestOptions)
        clearTimeout(timeoutId)

        const duration = Date.now() - startTime
        console.log(`[APIOptimized] Response: ${response.status} ${response.statusText} (${duration}ms)`)

        let data: T
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text() as any
        }

        if (!response.ok) {
          const error = {
            status: response.status,
            statusText: response.statusText,
            message: (data as any)?.message || `HTTP Error: ${response.status}`,
            response: { status: response.status, data }
          }

          // Check if retry is needed
          if (shouldRetry(error, attempt, retries)) {
            console.log(`[APIOptimized] Retrying request (${attempt}/${retries}) after ${retryDelay}ms`)
            await sleep(retryDelay * attempt) // Exponential backoff
            return makeRequest(attempt + 1)
          }

          throw error
        }

        // Cache successful GET responses
        if (method === 'GET' && cache) {
          const ttl = typeof cache === 'number' ? cache : DEFAULT_CACHE_TTL
          setCachedResponse(cacheKey, data, endpoint, ttl)
        }

        // Update metrics
        apiMetrics.value.successfulRequests++
        apiMetrics.value.totalResponseTime += duration
        apiMetrics.value.averageResponseTime = 
          apiMetrics.value.totalResponseTime / apiMetrics.value.successfulRequests

        // Log for debug panel
        logApiCall({
          method,
          url: fullUrl,
          requestBody,
          responseData: data,
          responseStatus: response.status,
          success: true,
          duration,
          cached: false
        })

        return {
          success: true,
          data,
          status: response.status,
          duration
        }

      } catch (error: any) {
        const duration = Date.now() - startTime

        // Handle timeout
        if (error.name === 'AbortError') {
          error.status = 408
          error.message = 'Request timeout'
        }

        // Check if retry is needed
        if (shouldRetry(error, attempt, retries)) {
          console.log(`[APIOptimized] Retrying request (${attempt}/${retries}) after ${retryDelay}ms`)
          await sleep(retryDelay * attempt) // Exponential backoff
          return makeRequest(attempt + 1)
        }

        // Update metrics
        apiMetrics.value.failedRequests++

        // Log error
        logApiCall({
          method,
          url: fullUrl,
          requestBody,
          responseData: undefined,
          responseStatus: error.status,
          success: false,
          error: error.message,
          duration
        })

        // Handle error with global error handler
        const errorInfo = handleApiError(error, endpoint, {
          showToast: true,
          onRetry: retries > 0 ? () => makeRequest(1) : undefined
        })

        return {
          success: false,
          error: errorInfo.message,
          status: error.status,
          duration
        }
      }
    }

    // Create request promise for deduplication
    const requestPromise = makeRequest()
    if (method === 'GET' && deduplicate) {
      pendingRequests.set(cacheKey, requestPromise)
      
      // Clean up after request completes
      requestPromise.finally(() => {
        pendingRequests.delete(cacheKey)
      })
    }

    try {
      const result = await requestPromise
      return result
    } finally {
      // Clean up loading state
      if (loadingId) {
        stopLoading(loadingId)
      }
    }
  }

  // Optimized helper methods for common operations
  const get = <T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'GET' }, config)
  }

  const post = <T>(endpoint: string, data: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, { cache: false, ...config })
  }

  const put = <T>(endpoint: string, data: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, { cache: false, ...config })
  }

  const del = <T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'DELETE' }, { 
      cache: false, 
      showLoading: true,
      loadingLabel: 'Deleting...',
      ...config 
    })
  }

  // Success feedback helper
  const withSuccessToast = async <T>(
    operation: () => Promise<ApiResponse<T>>,
    successMessage: string
  ): Promise<ApiResponse<T>> => {
    const result = await operation()
    if (result.success) {
      showSuccessToast(successMessage)
    }
    return result
  }

  // API sections with optimized calls
  const auth = {
    async login(credentials: LoginCredentials): Promise<ApiResponse<{ id_token: string }>> {
      const result = await post<{ id_token: string }>('/api/authenticate', credentials, {
        loadingLabel: 'Signing in...',
        showLoading: true,
        cache: false
      })

      if (result.success && result.data?.id_token) {
        if (process.client) {
          localStorage.setItem('auth_token', result.data.id_token)
        }
        // Clear cache on login (new permissions might apply)
        clearCache()
      }

      return result
    },

    async logout(): Promise<void> {
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
      // Clear all cache on logout
      clearCache()
      await navigateTo('/login')
    },

    isAuthenticated(): boolean {
      return !!getAuthToken()
    }
  }

  const users = {
    getAll: () => get<User[]>('/api/users', { 
      loadingLabel: 'Loading users...',
      cache: 5 * 60 * 1000 // 5 minutes cache
    }),
    
    getById: (id: number) => get<User>(`/api/users/${id}`, {
      cache: 10 * 60 * 1000 // 10 minutes cache
    }),
    
    create: (user: Omit<User, 'id'>) => 
      withSuccessToast(
        () => post<User>('/api/users', user, { loadingLabel: 'Creating user...' }),
        'User created successfully'
      ),
    
    update: (id: number, user: Partial<User>) =>
      withSuccessToast(
        () => put<User>(`/api/users/${id}`, user, { loadingLabel: 'Updating user...' }),
        'User updated successfully'
      ),
    
    delete: (id: number) =>
      withSuccessToast(
        () => del<void>(`/api/users/${id}`, { loadingLabel: 'Deleting user...' }),
        'User deleted successfully'
      )
  }

  const models = {
    getAll: () => get<Model[]>('/api/models', {
      loadingLabel: 'Loading models...',
      cache: 2 * 60 * 1000 // 2 minutes cache
    }),
    
    getById: (id: number) => get<Model>(`/api/models/${id}`, {
      cache: 5 * 60 * 1000
    }),
    
    getCount: () => get<string>('/api/models/count', {
      cache: 5 * 60 * 1000
    }).then(result => ({
      ...result,
      data: result.success && result.data ? parseInt(result.data) : 0
    })),
    
    searchByCode: (code: string) => get<Model[]>(
      `/api/models?code.contains=${encodeURIComponent(code)}`,
      { cache: 1 * 60 * 1000 } // 1 minute cache for searches
    ),
    
    create: (model: Omit<Model, 'id'>) =>
      withSuccessToast(
        () => post<Model>('/api/models', model, { loadingLabel: 'Creating model...' }),
        'Model created successfully'
      ),
    
    update: (id: number, model: Partial<Model>) =>
      withSuccessToast(
        () => put<Model>(`/api/models/${id}`, model, { loadingLabel: 'Updating model...' }),
        'Model updated successfully'
      ),
    
    delete: (id: number) =>
      withSuccessToast(
        () => del<void>(`/api/models/${id}`, { loadingLabel: 'Deleting model...' }),
        'Model deleted successfully'
      )
  }

  const sheets = {
    getAll: () => get<SheetWithRelations[]>('/api/sheets', {
      loadingLabel: 'Loading sheets...',
      cache: 2 * 60 * 1000
    }),
    
    getById: (id: number) => get<SheetWithRelations>(`/api/sheets/${id}`, {
      cache: 5 * 60 * 1000
    }),
    
    getCount: () => get<string>('/api/sheets/count', {
      cache: 5 * 60 * 1000
    }).then(result => ({
      ...result,
      data: result.success && result.data ? parseInt(result.data) : 0
    })),
    
    getStatistics: () => get<SheetStatistics>('/api/sheets/statistics', {
      cache: 5 * 60 * 1000
    }),
    
    create: (sheet: Omit<SheetWithRelations, 'id'>) =>
      withSuccessToast(
        () => post<SheetWithRelations>('/api/sheets', sheet, { 
          loadingLabel: 'Creating sheet...' 
        }),
        'Sheet created successfully'
      ),
    
    update: (id: number, sheet: Partial<SheetWithRelations>) =>
      withSuccessToast(
        () => put<SheetWithRelations>(`/api/sheets/${id}`, sheet, { 
          loadingLabel: 'Updating sheet...' 
        }),
        'Sheet updated successfully'
      ),
    
    delete: (id: number) =>
      withSuccessToast(
        () => del<void>(`/api/sheets/${id}`, { loadingLabel: 'Deleting sheet...' }),
        'Sheet deleted successfully'
      ),

    // Specialized methods
    getByDrawing: (drawingId: number) => get<SheetWithRelations[]>(
      `/api/sheets?drawingId.equals=${drawingId}`,
      { cache: 2 * 60 * 1000 }
    ),
    
    getByModel: (modelId: number) => get<SheetWithRelations[]>(
      `/api/models/${modelId}/sheets`,
      { cache: 2 * 60 * 1000 }
    )
  }

  // Cache management
  const cacheManager = {
    clear: clearCache,
    size: computed(() => responseCache.size),
    stats: computed(() => ({
      totalEntries: responseCache.size,
      cacheHits: apiMetrics.value.cacheHits,
      hitRate: apiMetrics.value.totalRequests > 0 
        ? (apiMetrics.value.cacheHits / apiMetrics.value.totalRequests * 100).toFixed(1)
        : '0'
    })),
    entries: computed(() => Array.from(responseCache.entries()).map(([key, entry]) => ({
      key,
      endpoint: entry.endpoint,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl
    })))
  }

  return {
    // Core functions
    apiCall,
    get,
    post,
    put,
    delete: del,
    withSuccessToast,

    // API sections
    auth,
    users,
    models,
    sheets,

    // Utilities
    cacheManager,
    metrics: computed(() => apiMetrics.value),
    clearCache,
    getAuthToken
  }
}