/**
 * Composable per la gestione delle chiamate API
 * Compatibile con Nuxt 3/4 e integrazione con backend JBelt
 * 
 * @version 1.0.0
 */

import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import type { IFormat } from '~/model/format.model'

// Backward compatibility aliases
export type Model = IModel
export type Sheet = ISheet
export type Format = IFormat

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: number
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

// Use the backend Sheet interface directly - it has everything we need
export type SheetWithRelations = ISheet

export interface SheetStatistics {
  totalCount: number
  sheetsWithDrawing: number
  sheetsWithoutDrawing: number
  formatTypeCounts: Record<string, number>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  const { logApiCall } = useDebug()

  // Gestione token di autenticazione - Prima usa auth store, poi fallback localStorage
  const getAuthToken = (): string | null => {
    // Try auth store first
    try {
      const { getToken } = useAuth()
      const token = getToken()
      if (token) {
        console.log('[API] Token found from auth store')
        return token
      }
    } catch (err) {
      console.log('[API] Auth store not available, trying localStorage')
    }
    
    // Fallback to localStorage
    if (process.client) {
      const possibleKeys = ['test_token', 'auth_token', 'authenticationToken', 'jhi-authenticationToken', 'token', 'jwt-token']
      
      for (const key of possibleKeys) {
        const token = localStorage.getItem(key)
        if (token) {
          console.log(`[API] Token found in localStorage with key: ${key}`)
          return token
        }
      }
      
      console.log('[API] No token found anywhere')
      return null
    }
    return null
  }

  // Helper per le chiamate HTTP con gestione automatica del token e debug logging
  const apiCall = async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const fullUrl = `${baseURL}${endpoint}`
    const method = options.method || 'GET'
    const startTime = Date.now()
    
    let requestBody: any = undefined
    
    // Parse request body per debug
    if (options.body) {
      try {
        requestBody = JSON.parse(options.body as string)
      } catch (e) {
        requestBody = options.body
      }
    }
    
    console.log(`[API] ${method} ${fullUrl}`)
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
      }

      // Aggiungi token di autenticazione se presente
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('[API] Token presente, lunghezza:', token.length)
      } else {
        console.log('[API] Nessun token di autenticazione')
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers
      })

      const duration = Date.now() - startTime
      console.log(`[API] Response status: ${response.status} ${response.statusText} (${duration}ms)`)

      const data = await response.json()
      console.log('[API] Response data:', data)

      if (!response.ok) {
        const errorResult = {
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
          status: response.status
        }
        
        // Log per debug panel
        logApiCall({
          method,
          url: fullUrl,
          requestBody,
          responseData: data,
          responseStatus: response.status,
          success: false,
          error: errorResult.error,
          duration
        })
        
        console.error('[API] Errore risposta:', errorResult)
        return errorResult
      }

      const successResult = {
        success: true,
        data,
        status: response.status
      }
      
      // Log per debug panel
      logApiCall({
        method,
        url: fullUrl,
        requestBody,
        responseData: data,
        responseStatus: response.status,
        success: true,
        duration
      })
      
      console.log('[API] Successo:', successResult)
      return successResult
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorResult = {
        success: false,
        error: errorMessage
      }
      
      // Log per debug panel
      logApiCall({
        method,
        url: fullUrl,
        requestBody,
        responseData: undefined,
        responseStatus: undefined,
        success: false,
        error: errorMessage,
        duration
      })
      
      console.error('[API] Errore fetch:', errorResult)
      return errorResult
    }
  }

  // ===== AUTENTICAZIONE =====
  const auth = {
    async login(credentials: LoginCredentials): Promise<ApiResponse<{ id_token: string }>> {
      const result = await apiCall<{ id_token: string }>('/api/authenticate', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      // Salva il token se login successful
      if (result.success && result.data?.id_token) {
        if (process.client) {
          localStorage.setItem('auth_token', result.data.id_token)
        }
      }

      return result
    },

    async logout(): Promise<void> {
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
      await navigateTo('/login')
    },

    isAuthenticated(): boolean {
      return !!getAuthToken()
    }
  }

  // ===== GESTIONE UTENTI =====
  const users = {
    async getAll(): Promise<ApiResponse<User[]>> {
      return apiCall<User[]>('/api/users')
    },

    async getById(id: number): Promise<ApiResponse<User>> {
      return apiCall<User>(`/api/users/${id}`)
    },

    async create(user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
      return apiCall<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(user)
      })
    },

    async update(id: number, user: Partial<User>): Promise<ApiResponse<User>> {
      return apiCall<User>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      })
    },

    async delete(id: number): Promise<ApiResponse<void>> {
      return apiCall<void>(`/api/users/${id}`, {
        method: 'DELETE'
      })
    }
  }

  // ===== GESTIONE MODELLI =====
  const models = {
    async getAll(): Promise<ApiResponse<Model[]>> {
      return apiCall<Model[]>('/api/models')
    },

    async getById(id: number): Promise<ApiResponse<Model>> {
      return apiCall<Model>(`/api/models/${id}`)
    },

    async getCount(): Promise<ApiResponse<number>> {
      const result = await apiCall<string>('/api/models/count')
      if (result.success && result.data) {
        return {
          ...result,
          data: parseInt(result.data)
        }
      }
      return {
        success: false,
        data: 0,
        error: result.error || 'Failed to get count'
      }
    },

    async searchByCode(code: string): Promise<ApiResponse<Model[]>> {
      return apiCall<Model[]>(`/api/models?code.contains=${encodeURIComponent(code)}`)
    },

    async create(model: Omit<Model, 'id'>): Promise<ApiResponse<Model>> {
      return apiCall<Model>('/api/models', {
        method: 'POST',
        body: JSON.stringify(model)
      })
    },

    async update(id: number, model: Partial<Model>): Promise<ApiResponse<Model>> {
      return apiCall<Model>(`/api/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(model)
      })
    },

    async delete(id: number): Promise<ApiResponse<void>> {
      return apiCall<void>(`/api/models/${id}`, {
        method: 'DELETE'
      })
    }
  }

  // ===== GESTIONE FOGLI =====
  const sheets = {
    async getAll(): Promise<ApiResponse<SheetWithRelations[]>> {
      // Use the standard endpoint that works
      return apiCall<SheetWithRelations[]>('/api/sheets')
    },

    async getById(id: number): Promise<ApiResponse<SheetWithRelations>> {
      return apiCall<SheetWithRelations>(`/api/sheets/${id}`)
    },

    async getCount(): Promise<ApiResponse<number>> {
      const result = await apiCall<string>('/api/sheets/count')
      if (result.success && result.data) {
        return {
          ...result,
          data: parseInt(result.data)
        }
      }
      return {
        success: false,
        data: 0,
        error: result.error || 'Failed to get count'
      }
    },

    async getStatistics(): Promise<ApiResponse<SheetStatistics>> {
      return apiCall<SheetStatistics>('/api/sheets/statistics')
    },

    async searchByCode(code: string): Promise<ApiResponse<SheetWithRelations[]>> {
      return apiCall<SheetWithRelations[]>(`/api/sheets?code.contains=${encodeURIComponent(code)}`)
    },

    async searchByName(name: string): Promise<ApiResponse<SheetWithRelations[]>> {
      return apiCall<SheetWithRelations[]>(`/api/sheets?name.contains=${encodeURIComponent(name)}`)
    },

    async searchByFormat(formatType: string): Promise<ApiResponse<SheetWithRelations[]>> {
      return apiCall<SheetWithRelations[]>(`/api/sheets?formatType.equals=${encodeURIComponent(formatType)}`)
    },

    async create(sheet: Omit<SheetWithRelations, 'id'>): Promise<ApiResponse<SheetWithRelations>> {
      return apiCall<SheetWithRelations>('/api/sheets', {
        method: 'POST',
        body: JSON.stringify(sheet)
      })
    },

    async createBatch(sheets: Omit<SheetWithRelations, 'id'>[]): Promise<ApiResponse<SheetWithRelations[]>> {
      return apiCall<SheetWithRelations[]>('/api/sheets/batch', {
        method: 'POST',
        body: JSON.stringify(sheets)
      })
    },

    async update(id: number, sheet: Partial<SheetWithRelations>): Promise<ApiResponse<SheetWithRelations>> {
      return apiCall<SheetWithRelations>(`/api/sheets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sheet)
      })
    },

    async patch(id: number, updates: Partial<SheetWithRelations>): Promise<ApiResponse<SheetWithRelations>> {
      return apiCall<SheetWithRelations>(`/api/sheets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
    },

    async delete(id: number): Promise<ApiResponse<void>> {
      return apiCall<void>(`/api/sheets/${id}`, {
        method: 'DELETE'
      })
    },

    // Metodi specifici per le relazioni Model-Sheet
    async getByDrawing(drawingId: number): Promise<ApiResponse<SheetWithRelations[]>> {
      return apiCall<SheetWithRelations[]>(`/api/sheets?drawingId.equals=${drawingId}`)
    },

    async getByModel(modelId: number): Promise<ApiResponse<SheetWithRelations[]>> {
      return apiCall<SheetWithRelations[]>(`/api/models/${modelId}/sheets`)
    }
  }

  // ===== GESTIONE FORMATI =====
  const formats = {
    async getAll(): Promise<ApiResponse<any[]>> {
      return apiCall<any[]>('/api/formats')
    },

    async getById(id: number): Promise<ApiResponse<any>> {
      return apiCall<any>(`/api/formats/${id}`)
    },

    async create(format: any): Promise<ApiResponse<any>> {
      return apiCall<any>('/api/formats', {
        method: 'POST',
        body: JSON.stringify(format)
      })
    }
  }

  // ===== GESTIONE AUTORI =====
  const authors = {
    async getAll(): Promise<ApiResponse<any[]>> {
      return apiCall<any[]>('/api/authors')
    },

    async create(author: any): Promise<ApiResponse<any>> {
      return apiCall<any>('/api/authors', {
        method: 'POST',
        body: JSON.stringify(author)
      })
    }
  }

  // ===== GESTIONE TEAM =====
  const teams = {
    async getAll(): Promise<ApiResponse<any[]>> {
      return apiCall<any[]>('/api/teams')
    },

    async create(team: any): Promise<ApiResponse<any>> {
      return apiCall<any>('/api/teams', {
        method: 'POST',
        body: JSON.stringify(team)
      })
    }
  }

  return {
    auth,
    users,
    models,
    sheets,
    formats,
    authors,
    teams
  }
}

// Export dei tipi per utilizzo nelle pagine
export type { ApiResponse, User, SheetStatistics, SheetWithRelations }