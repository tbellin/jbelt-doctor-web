// composables/useDebug.ts
export interface ApiLog {
  id: string
  timestamp: Date
  method: string
  url: string
  requestBody?: any
  responseData?: any
  responseStatus?: number
  success: boolean
  error?: string
  duration?: number
}

const apiLogs = ref<ApiLog[]>([])

export const useDebug = () => {
  const config = useRuntimeConfig()
  const isDebugMode = computed(() => config.public.debug === 'true' || config.public.debug === true)

  const logApiCall = (log: Omit<ApiLog, 'id' | 'timestamp'>) => {
    if (!isDebugMode.value) return

    const apiLog: ApiLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...log
    }
    
    apiLogs.value.unshift(apiLog) // Aggiungi all'inizio per mostrare i più recenti
    
    // Mantieni solo gli ultimi 50 log per evitare troppa memoria
    if (apiLogs.value.length > 50) {
      apiLogs.value = apiLogs.value.slice(0, 50)
    }

    console.log('🔍 API Call:', apiLog)
  }

  const clearLogs = () => {
    apiLogs.value = []
    console.log('🗑️ Debug logs cleared')
  }

  const exportLogs = () => {
    const logsJson = JSON.stringify(apiLogs.value, null, 2)
    const blob = new Blob([logsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('💾 Debug logs exported')
  }

  // Export specific log entry
  const exportSingleLog = (log: ApiLog) => {
    const dataStr = JSON.stringify(log, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-log-${log.id}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('💾 Single API log exported:', log.id)
  }

  // Export filtered logs (e.g., only sheet operations)
  const exportFilteredLogs = (filter: 'sheets' | 'models' | 'all' = 'all') => {
    let filteredLogs = apiLogs.value
    
    if (filter === 'sheets') {
      filteredLogs = apiLogs.value.filter(log => log.url.includes('/api/sheets'))
    } else if (filter === 'models') {
      filteredLogs = apiLogs.value.filter(log => log.url.includes('/api/models'))
    }
    
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-logs-${filter}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log(`💾 Filtered API logs exported (${filter}):`, filteredLogs.length, 'calls')
  }

  // Helper functions per l'analisi
  const getRequestModelsCount = (requestBody: any): number => {
    if (requestBody.models && requestBody.models.length > 0) {
      return requestBody.models.length
    }
    if (requestBody.modelIds && requestBody.modelIds.length > 0) {
      return requestBody.modelIds.length
    }
    return 0
  }

  const hasRequestDrawing = (requestBody: any): boolean => {
    return !!(requestBody.drawing || requestBody.drawingId)
  }

  // Export summary report for documentation
  const exportSummaryReport = () => {
    const sheetOperations = apiLogs.value.filter(log => log.url.includes('/api/sheets'))
    const modelOperations = apiLogs.value.filter(log => log.url.includes('/api/models'))
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalApiCalls: apiLogs.value.length,
        sheetOperations: sheetOperations.length,
        modelOperations: modelOperations.length,
        successfulCalls: apiLogs.value.filter(log => log.success).length,
        failedCalls: apiLogs.value.filter(log => !log.success).length
      },
      analysis: {
        sheetDataLossIssues: sheetOperations.filter(log => {
          if (!log.requestBody || !log.responseData) return false
          const requestModelsCount = getRequestModelsCount(log.requestBody)
          const hasModelsResponse = log.responseData.models && log.responseData.models.length > 0
          return requestModelsCount > 0 && !hasModelsResponse
        }).length,
        drawingDataLossIssues: sheetOperations.filter(log => {
          if (!log.requestBody || !log.responseData) return false
          const hasDrawingRequest = hasRequestDrawing(log.requestBody)
          const hasDrawingResponse = log.responseData.drawing
          return hasDrawingRequest && !hasDrawingResponse
        }).length
      },
      detailedLogs: {
        sheetOperations: sheetOperations.map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          method: log.method,
          url: log.url,
          success: log.success,
          requestData: {
            models: log.requestBody?.models || null,
            modelIds: log.requestBody?.modelIds || null,
            drawing: log.requestBody?.drawing || null,
            drawingId: log.requestBody?.drawingId || null,
            code: log.requestBody?.code || null,
            name: log.requestBody?.name || null
          },
          responseData: {
            models: log.responseData?.models || null,
            drawing: log.responseData?.drawing || null,
            id: log.responseData?.id || null
          },
          dataLoss: {
            models: getRequestModelsCount(log.requestBody || {}) > 0 && (!log.responseData?.models || log.responseData.models.length === 0),
            drawing: hasRequestDrawing(log.requestBody || {}) && !log.responseData?.drawing
          }
        })),
        modelOperations: modelOperations.map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          method: log.method,
          url: log.url,
          success: log.success,
          requestData: log.requestBody,
          responseData: log.responseData
        }))
      },
      fullLogs: apiLogs.value
    }
    
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-debug-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('📊 Debug summary report exported')
  }

  return {
    isDebugMode: readonly(isDebugMode),
    apiLogs: readonly(apiLogs),
    logApiCall,
    clearLogs,
    exportLogs,
    exportSingleLog,
    exportFilteredLogs,
    exportSummaryReport
  }
}