import { ref } from 'vue'

export interface EntityAPIOptions {
  baseUrl: string
  entityName: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function useEntityAPI<T = any>(options: EntityAPIOptions) {
  const { baseUrl, entityName } = options
  
  // Reactive state
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get API client (using existing useApi or axios)
  const { $api } = useNuxtApp()

  // Methods
  const getAll = async (): Promise<APIResponse<T[]>> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${baseUrl}/${entityName}`)
      return {
        success: true,
        data: response
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to fetch ${entityName}`
      error.value = errorMessage
      console.error(`Error fetching ${entityName}:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const getById = async (id: number | string): Promise<APIResponse<T>> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${baseUrl}/${entityName}/${id}`)
      return {
        success: true,
        data: response
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to fetch ${entityName} with id ${id}`
      error.value = errorMessage
      console.error(`Error fetching ${entityName} by id:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const create = async (data: Partial<T>): Promise<APIResponse<T>> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${baseUrl}/${entityName}`, {
        method: 'POST',
        body: data
      })
      
      return {
        success: true,
        data: response,
        message: `${entityName} created successfully`
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to create ${entityName}`
      error.value = errorMessage
      console.error(`Error creating ${entityName}:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number | string, data: Partial<T>): Promise<APIResponse<T>> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${baseUrl}/${entityName}/${id}`, {
        method: 'PUT',
        body: data
      })
      
      return {
        success: true,
        data: response,
        message: `${entityName} updated successfully`
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to update ${entityName}`
      error.value = errorMessage
      console.error(`Error updating ${entityName}:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number | string): Promise<APIResponse<void>> => {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`${baseUrl}/${entityName}/${id}`, {
        method: 'DELETE'
      })
      
      return {
        success: true,
        message: `${entityName} deleted successfully`
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to delete ${entityName}`
      error.value = errorMessage
      console.error(`Error deleting ${entityName}:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const search = async (params: Record<string, any>): Promise<APIResponse<T[]>> => {
    loading.value = true
    error.value = null
    
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await $fetch(`${baseUrl}/${entityName}/search?${queryString}`)
      
      return {
        success: true,
        data: response
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to search ${entityName}`
      error.value = errorMessage
      console.error(`Error searching ${entityName}:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Batch operations
  const createBatch = async (items: Partial<T>[]): Promise<APIResponse<T[]>> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${baseUrl}/${entityName}/batch`, {
        method: 'POST',
        body: { items }
      })
      
      return {
        success: true,
        data: response,
        message: `${items.length} ${entityName} items created successfully`
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to create ${entityName} batch`
      error.value = errorMessage
      console.error(`Error creating ${entityName} batch:`, err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const deleteBatch = async (ids: (number | string)[]): Promise<APIResponse<void>> => {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`${baseUrl}/${entityName}/batch`, {
        method: 'DELETE',
        body: { ids }
      })
      
      return {
        success: true,
        message: `${ids.length} ${entityName} items deleted successfully`
      }
    } finally {
      loading.value = false
    }
  }

  // File operations (for entities with file support)
  const uploadFile = async (id: number | string, file: File): Promise<APIResponse<T>> => {
    loading.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await $fetch(`${baseUrl}/${entityName}/${id}/upload`, {
        method: 'POST',
        body: formData
      })
      
      return {
        success: true,
        data: response,
        message: 'File uploaded successfully'
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file'
      error.value = errorMessage
      console.error('Error uploading file:', err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const downloadFile = async (id: number | string): Promise<Blob | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${baseUrl}/${entityName}/${id}/download`, {
        responseType: 'blob'
      })
      
      return response as Blob
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to download file'
      error.value = errorMessage
      console.error('Error downloading file:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    loading,
    error,

    // CRUD Operations
    getAll,
    getById,
    create,
    update,
    remove,
    search,

    // Batch Operations
    createBatch,
    deleteBatch,

    // File Operations
    uploadFile,
    downloadFile,

    // Utils
    clearError
  }
}