/**
 * Composable per la gestione delle chiamate API
 * Compatibile con Nuxt 3/4 e integrazione con backend JBelt
 * 
 * @version 1.0.0
 */

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

export interface Model {
  id?: number
  code: string
  name: string
  modelType: string
  instanceType: string
}

export interface Sheet {
  id?: number
  code: string
  name: string
  creoId?: string
  formatType: string
}

export interface SheetStatistics {
  totalCount: number
  sheetsWithDrawing: number
  sheetsWithoutDrawing: number
  formatTypeCounts: Record<string, number>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  // Gestione token di autenticazione - Legge da localStorage come fa auth store
  const getAuthToken = (): string | null => {
    if (process.client) {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  // Helper per le chiamate HTTP con gestione automatica del token
  const apiCall = async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const fullUrl = `${baseURL}${endpoint}`
    console.log(`[API] ${options.method || 'GET'} ${fullUrl}`)
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      // Aggiungi token di autenticazione se presente
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('[API] Token presente, lunghezza:', token.length)
      } else {
        console.log('[API] Nessun token di autenticazione')
      }

      console.log('[API] Headers:', headers)

      const response = await fetch(fullUrl, {
        ...options,
        headers
      })

      console.log(`[API] Response status: ${response.status} ${response.statusText}`)

      const data = await response.json()
      console.log('[API] Response data:', data)

      if (!response.ok) {
        const errorResult = {
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
          status: response.status
        }
        console.error('[API] Errore risposta:', errorResult)
        return errorResult
      }

      const successResult = {
        success: true,
        data,
        status: response.status
      }
      console.log('[API] Successo:', successResult)
      return successResult
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
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
      if (result.success) {
        return {
          ...result,
          data: parseInt(result.data || '0')
        }
      }
      return result as ApiResponse<number>
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
    async getAll(): Promise<ApiResponse<Sheet[]>> {
      return apiCall<Sheet[]>('/api/sheets')
    },

    async getById(id: number): Promise<ApiResponse<Sheet>> {
      return apiCall<Sheet>(`/api/sheets/${id}`)
    },

    async getCount(): Promise<ApiResponse<number>> {
      const result = await apiCall<string>('/api/sheets/count')
      if (result.success) {
        return {
          ...result,
          data: parseInt(result.data || '0')
        }
      }
      return result as ApiResponse<number>
    },

    async getStatistics(): Promise<ApiResponse<SheetStatistics>> {
      return apiCall<SheetStatistics>('/api/sheets/statistics')
    },

    async searchByCode(code: string): Promise<ApiResponse<Sheet[]>> {
      return apiCall<Sheet[]>(`/api/sheets?code.contains=${encodeURIComponent(code)}`)
    },

    async searchByName(name: string): Promise<ApiResponse<Sheet[]>> {
      return apiCall<Sheet[]>(`/api/sheets?name.contains=${encodeURIComponent(name)}`)
    },

    async searchByFormat(formatType: string): Promise<ApiResponse<Sheet[]>> {
      return apiCall<Sheet[]>(`/api/sheets?formatType.equals=${encodeURIComponent(formatType)}`)
    },

    async create(sheet: Omit<Sheet, 'id'>): Promise<ApiResponse<Sheet>> {
      return apiCall<Sheet>('/api/sheets', {
        method: 'POST',
        body: JSON.stringify(sheet)
      })
    },

    async createBatch(sheets: Omit<Sheet, 'id'>[]): Promise<ApiResponse<Sheet[]>> {
      return apiCall<Sheet[]>('/api/sheets/batch', {
        method: 'POST',
        body: JSON.stringify(sheets)
      })
    },

    async update(id: number, sheet: Partial<Sheet>): Promise<ApiResponse<Sheet>> {
      return apiCall<Sheet>(`/api/sheets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sheet)
      })
    },

    async patch(id: number, updates: Partial<Sheet>): Promise<ApiResponse<Sheet>> {
      return apiCall<Sheet>(`/api/sheets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
    },

    async delete(id: number): Promise<ApiResponse<void>> {
      return apiCall<void>(`/api/sheets/${id}`, {
        method: 'DELETE'
      })
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
export type { ApiResponse, User, Model, Sheet, SheetStatistics }