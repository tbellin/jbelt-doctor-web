<template>
  <div v-if="isDebugMode" class="debug-panel">
    <div class="card border-warning">
      <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <i class="bi bi-bug-fill me-2"></i>
          Debug API Panel ({{ apiLogs.length }} calls)
        </h6>
        <div class="btn-group btn-group-sm">
          <button 
            type="button" 
            class="btn btn-outline-dark"
            @click="toggleExpanded"
          >
            <i :class="isExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
            {{ isExpanded ? 'Chiudi' : 'Espandi' }}
          </button>
          <button 
            type="button" 
            class="btn btn-outline-dark"
            @click="clearLogs"
            :disabled="apiLogs.length === 0"
          >
            <i class="bi bi-trash"></i>
            Pulisci
          </button>
          <!-- Dropdown per export avanzato -->
          <div class="btn-group btn-group-sm" role="group">
            <button 
              type="button" 
              class="btn btn-outline-dark dropdown-toggle"
              data-bs-toggle="dropdown"
              :disabled="apiLogs.length === 0"
            >
              <i class="bi bi-download"></i>
              Esporta
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="exportLogs">
                  <i class="bi bi-file-earmark-text me-2"></i>
                  Tutti i Log
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="exportFilteredLogs('sheets')">
                  <i class="bi bi-file-earmark-spreadsheet me-2"></i>
                  Solo Operazioni Fogli
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="exportFilteredLogs('models')">
                  <i class="bi bi-gear me-2"></i>
                  Solo Operazioni Modelli
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="exportSummaryReport">
                  <i class="bi bi-clipboard-data me-2"></i>
                  Report Completo
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div v-if="isExpanded" class="card-body p-0">
        <!-- Statistiche rapide -->
        <div v-if="apiLogs.length > 0" class="p-3 bg-light border-bottom">
          <div class="row text-center">
            <div class="col-md-3">
              <div class="small text-muted">Totale API</div>
              <div class="fw-bold text-primary">{{ apiLogs.length }}</div>
            </div>
            <div class="col-md-3">
              <div class="small text-muted">Operazioni Fogli</div>
              <div class="fw-bold text-warning">{{ sheetOperationsCount }}</div>
            </div>
            <div class="col-md-3">
              <div class="small text-muted">Perdita ModelIds</div>
              <div class="fw-bold text-danger">{{ modelIdDataLossCount }}</div>
            </div>
            <div class="col-md-3">
              <div class="small text-muted">Perdita DrawingId</div>
              <div class="fw-bold text-danger">{{ drawingIdDataLossCount }}</div>
            </div>
          </div>
        </div>
        
        <div class="debug-logs" style="max-height: 400px; overflow-y: auto;">
          <div v-if="apiLogs.length === 0" class="text-center p-3 text-muted">
            <i class="bi bi-info-circle me-2"></i>
            Nessuna chiamata API registrata
          </div>
          
          <div 
            v-for="log in apiLogs" 
            :key="log.id"
            class="debug-log-entry border-bottom p-3"
            :class="{ 'bg-danger-subtle': !log.success, 'bg-success-subtle': log.success }"
          >
            <!-- Header della chiamata -->
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center">
                <span 
                  class="badge me-2"
                  :class="log.success ? 'bg-success' : 'bg-danger'"
                >
                  {{ log.method }}
                </span>
                <code class="text-primary">{{ getShortUrl(log.url) }}</code>
                <span v-if="log.duration" class="badge bg-secondary ms-2">
                  {{ log.duration }}ms
                </span>
                <!-- Badge speciale per operazioni su sheets/models -->
                <span v-if="isSheetOperation(log)" class="badge bg-warning text-dark ms-1">
                  <i class="bi bi-file-earmark-text"></i> SHEET
                </span>
                <span v-if="isModelOperation(log)" class="badge bg-info ms-1">
                  <i class="bi bi-gear"></i> MODEL
                </span>
              </div>
              <div class="d-flex align-items-center">
                <small class="text-muted me-2">
                  {{ formatTime(log.timestamp) }}
                </small>
                <button 
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  @click="exportSingleLog(log)"
                  title="Esporta questo log"
                >
                  <i class="bi bi-download"></i>
                </button>
              </div>
            </div>
            
            <!-- Status e errore -->
            <div class="mb-2">
              <span 
                class="badge me-2"
                :class="log.success ? 'bg-success' : 'bg-danger'"
              >
                {{ log.responseStatus || (log.success ? '200' : 'ERROR') }}
              </span>
              <span v-if="log.error" class="text-danger small">
                {{ log.error }}
              </span>
            </div>
            
            <!-- Accordion per i dettagli -->
            <div class="accordion accordion-flush" :id="`accordion-${log.id}`">
              <!-- Request Body -->
              <div v-if="log.requestBody" class="accordion-item">
                <h2 class="accordion-header" :id="`heading-req-${log.id}`">
                  <button 
                    class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="`#collapse-req-${log.id}`"
                    aria-expanded="false"
                  >
                    <i class="bi bi-upload me-2"></i>
                    Request Body
                  </button>
                </h2>
                <div 
                  :id="`collapse-req-${log.id}`" 
                  class="accordion-collapse collapse" 
                  :data-bs-parent="`#accordion-${log.id}`"
                >
                  <div class="accordion-body">
                    <!-- Analisi specifica per sheet operations -->
                    <div v-if="isSheetOperation(log) && log.requestBody" class="mb-3 p-2 bg-warning-subtle border border-warning rounded">
                      <h6 class="mb-2">
                        <i class="bi bi-info-circle me-1"></i>
                        Analisi Dati Sheet
                      </h6>
                      <div class="row">
                        <div class="col-md-6">
                          <strong>Campo models/modelIds:</strong>
                          <span v-if="log.requestBody.models && log.requestBody.models.length > 0" class="text-success ms-2">
                            ✅ Oggetti completi - {{ log.requestBody.models.length }} modelli
                            <div class="small text-muted">IDs: {{ log.requestBody.models.map(m => m.id).join(', ') }}</div>
                          </span>
                          <span v-else-if="log.requestBody.modelIds && log.requestBody.modelIds.length > 0" class="text-warning ms-2">
                            ⚠️ Solo IDs - {{ log.requestBody.modelIds.length }} modelli
                            <div class="small text-muted">{{ log.requestBody.modelIds.join(', ') }}</div>
                          </span>
                          <span v-else class="text-muted ms-2">⚪ Non impostato</span>
                        </div>
                        <div class="col-md-6">
                          <strong>Campo drawing/drawingId:</strong>
                          <span v-if="log.requestBody.drawing" class="text-success ms-2">
                            ✅ Oggetto completo - ID: {{ log.requestBody.drawing.id }}
                            <div class="small text-muted">{{ log.requestBody.drawing.name }}</div>
                          </span>
                          <span v-else-if="log.requestBody.drawingId" class="text-warning ms-2">
                            ⚠️ Solo ID - {{ log.requestBody.drawingId }}
                          </span>
                          <span v-else class="text-muted ms-2">⚪ Non impostato</span>
                        </div>
                      </div>
                    </div>
                    
                    <pre class="bg-light p-2 rounded small"><code>{{ formatJson(log.requestBody) }}</code></pre>
                  </div>
                </div>
              </div>
              
              <!-- Response Data -->
              <div v-if="log.responseData" class="accordion-item">
                <h2 class="accordion-header" :id="`heading-res-${log.id}`">
                  <button 
                    class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="`#collapse-res-${log.id}`"
                    aria-expanded="false"
                  >
                    <i class="bi bi-download me-2"></i>
                    Response Data
                    <span v-if="getResponseSize(log.responseData)" class="badge bg-info ms-2">
                      {{ getResponseSize(log.responseData) }}
                    </span>
                  </button>
                </h2>
                <div 
                  :id="`collapse-res-${log.id}`" 
                  class="accordion-collapse collapse" 
                  :data-bs-parent="`#accordion-${log.id}`"
                >
                  <div class="accordion-body">
                    <!-- Analisi specifica per sheet responses -->
                    <div v-if="isSheetOperation(log) && log.responseData" class="mb-3 p-2 bg-info-subtle border border-info rounded">
                      <h6 class="mb-2">
                        <i class="bi bi-info-circle me-1"></i>
                        Analisi Risposta Sheet
                      </h6>
                      <div class="row">
                        <div class="col-md-6">
                          <strong>Campo models:</strong>
                          <span v-if="log.responseData.models && log.responseData.models.length > 0" class="text-success ms-2">
                            ✅ Presente - {{ log.responseData.models.length }} modelli
                          </span>
                          <span v-else-if="log.responseData.models && log.responseData.models.length === 0" class="text-warning ms-2">
                            ⚠️ Array vuoto
                          </span>
                          <span v-else class="text-danger ms-2">❌ Assente</span>
                        </div>
                        <div class="col-md-6">
                          <strong>Campo drawing:</strong>
                          <span v-if="log.responseData.drawing" class="text-success ms-2">
                            ✅ Presente
                          </span>
                          <span v-else class="text-warning ms-2">⚪ Null</span>
                        </div>
                      </div>
                      
                      <!-- Confronto Request vs Response -->
                      <div v-if="log.requestBody" class="mt-2 pt-2 border-top">
                        <small class="text-muted">
                          <strong>🔄 Confronto Request → Response:</strong><br>
                          
                          <!-- Confronto Models -->
                          <div class="mb-1">
                            Models inviati: {{ getRequestModelsCount(log.requestBody) }} →
                            Models ricevuti: {{ log.responseData.models ? log.responseData.models.length : 0 }}
                            <span v-if="getRequestModelsCount(log.requestBody) > 0 && (!log.responseData.models || log.responseData.models.length === 0)" class="text-danger">
                              ❌ PERDITA DATI MODELS!
                            </span>
                            <span v-else-if="getRequestModelsCount(log.requestBody) > 0 && log.responseData.models && log.responseData.models.length > 0" class="text-success">
                              ✅ Models preservati
                            </span>
                          </div>
                          
                          <!-- Confronto Drawing -->
                          <div>
                            Drawing inviato: {{ hasRequestDrawing(log.requestBody) ? 'Si' : 'No' }} →
                            Drawing ricevuto: {{ log.responseData.drawing ? 'Si' : 'No' }}
                            <span v-if="hasRequestDrawing(log.requestBody) && !log.responseData.drawing" class="text-danger">
                              ❌ PERDITA DATI DRAWING!
                            </span>
                            <span v-else-if="hasRequestDrawing(log.requestBody) && log.responseData.drawing" class="text-success">
                              ✅ Drawing preservato
                            </span>
                          </div>
                        </small>
                      </div>
                    </div>
                    
                    <pre class="bg-light p-2 rounded small" style="max-height: 300px; overflow-y: auto;"><code>{{ formatJson(log.responseData) }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebug } from '~/composables/useDebug'

const { isDebugMode, apiLogs, clearLogs, exportLogs, exportSingleLog, exportFilteredLogs, exportSummaryReport } = useDebug()
const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('it-IT', { 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

const formatJson = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return String(obj)
  }
}

const getResponseSize = (data: any): string => {
  try {
    if (Array.isArray(data)) {
      return `${data.length} items`
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data)
      return `${keys.length} keys`
    }
    return ''
  } catch (e) {
    return ''
  }
}

// Helper per identificare operazioni su sheets
const isSheetOperation = (log: any): boolean => {
  return log.url.includes('/api/sheets')
}

// Helper per identificare operazioni su models
const isModelOperation = (log: any): boolean => {
  return log.url.includes('/api/models')
}

// Helper per URL più corto
const getShortUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname + urlObj.search
  } catch (e) {
    return url
  }
}

// Statistiche computed
const sheetOperationsCount = computed(() => {
  return apiLogs.value.filter(log => isSheetOperation(log)).length
})

const modelIdDataLossCount = computed(() => {
  return apiLogs.value.filter(log => {
    if (!isSheetOperation(log) || !log.requestBody || !log.responseData) return false
    const requestModelsCount = getRequestModelsCount(log.requestBody)
    const hasModelsResponse = log.responseData.models && log.responseData.models.length > 0
    return requestModelsCount > 0 && !hasModelsResponse
  }).length
})

const drawingIdDataLossCount = computed(() => {
  return apiLogs.value.filter(log => {
    if (!isSheetOperation(log) || !log.requestBody || !log.responseData) return false
    const hasDrawingRequest = hasRequestDrawing(log.requestBody)
    const hasDrawingResponse = log.responseData.drawing
    return hasDrawingRequest && !hasDrawingResponse
  }).length
})

// Helper functions per l'analisi dei dati di request
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
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
  width: 600px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.debug-log-entry {
  font-size: 0.875rem;
}

.debug-log-entry code {
  font-size: 0.8rem;
  word-break: break-all;
}

.debug-logs {
  background: white;
}

@media (max-width: 768px) {
  .debug-panel {
    width: 95vw;
    right: 2.5vw;
    bottom: 10px;
  }
}
</style>