<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Generatore Excel</h4>
          </div>
          <div class="card-body">
            <!-- Sezione di controllo template -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h5>Controllo Template</h5>
                <button 
                  class="btn btn-info" 
                  @click="checkTemplate"
                  :disabled="loading.check"
                >
                  <span v-if="loading.check" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading.check ? 'Controllo...' : 'Verifica Template' }}
                </button>
                
                <!-- Risultati controllo -->
                <div v-if="templateStatus" class="mt-3">
                  <div v-if="templateStatus.success" class="alert alert-success">
                    <strong>✓ Template trovato!</strong><br>
                    Percorso: {{ templateStatus.path }}<br>
                    Dimensione: {{ formatBytes(templateStatus.size) }}
                  </div>
                  <div v-else class="alert alert-danger">
                    <strong>✗ Errore template:</strong><br>
                    {{ templateStatus.error }}
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <h5>Generazione Excel</h5>
                <button 
                  class="btn btn-success" 
                  @click="generateExcel"
                  :disabled="loading.generate || !templateValid"
                >
                  <span v-if="loading.generate" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading.generate ? 'Generando...' : 'Scarica Excel' }}
                </button>
                
                <!-- Risultati generazione -->
                <div v-if="generateStatus" class="mt-3">
                  <div v-if="generateStatus.success" class="alert alert-success">
                    <strong>✓ File generato con successo!</strong><br>
                    Dimensione: {{ formatBytes(generateStatus.size) }}
                  </div>
                  <div v-else class="alert alert-danger">
                    <strong>✗ Errore generazione:</strong><br>
                    {{ generateStatus.error }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Sezione personalizzazione -->
            <div class="row">
              <div class="col-12">
                <h5>Personalizza Contenuto</h5>
                <div class="row">
                  <div class="col-md-6">
                    <label for="j2-input" class="form-label">Testo per cella J2:</label>
                    <input 
                      id="j2-input"
                      v-model="customData.j2" 
                      type="text" 
                      class="form-control"
                      placeholder="Demo in J2"
                    >
                  </div>
                  <div class="col-md-6">
                    <label for="f3-input" class="form-label">Testo per cella F3:</label>
                    <input 
                      id="f3-input"
                      v-model="customData.f3" 
                      type="text" 
                      class="form-control"
                      placeholder="Demo in F3"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Log di debug -->
            <div v-if="debugMode && logs.length > 0" class="mt-4">
              <h5>Log Debug</h5>
              <div class="debug-log">
                <pre><code>{{ logs.join('\n') }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Configurazione runtime
const config = useRuntimeConfig()
const debugMode = computed(() => config.public.debug === 'true')

// Stati reattivi
const loading = ref({
  check: false,
  generate: false
})

const templateStatus = ref<{
  success: boolean
  path?: string
  size?: number
  error?: string
} | null>(null)

const generateStatus = ref<{
  success: boolean
  size?: number
  error?: string
} | null>(null)

const customData = ref({
  j2: 'Demo in J2',
  f3: 'Demo in F3'
})

const logs = ref<string[]>([])

// Computed
const templateValid = computed(() => 
  templateStatus.value?.success === true
)

// Metodi
const addLog = (message: string) => {
  if (debugMode.value) {
    const timestamp = new Date().toLocaleTimeString()
    logs.value.push(`[${timestamp}] ${message}`)
  }
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const checkTemplate = async () => {
  loading.value.check = true
  templateStatus.value = null
  
  try {
    addLog('Iniziando controllo template...')
    
    const response = await $fetch('/api/checkTemplate', {
      method: 'GET'
    })
    
    addLog(`Risposta API: ${JSON.stringify(response)}`)
    
    templateStatus.value = {
      success: true,
      path: response.path,
      size: response.size
    }
    
    addLog('Template verificato con successo')
    
  } catch (error: any) {
    addLog(`Errore controllo template: ${error.message}`)
    
    templateStatus.value = {
      success: false,
      error: error.message || 'Errore sconosciuto durante il controllo'
    }
  } finally {
    loading.value.check = false
  }
}

const generateExcel = async () => {
  loading.value.generate = true
  generateStatus.value = null
  
  try {
    addLog('Iniziando generazione Excel...')
    addLog(`Dati personalizzati: ${JSON.stringify(customData.value)}`)
    
    const response = await $fetch('/api/generateExcel', {
      method: 'POST',
      body: customData.value,
      responseType: 'blob'
    })
    
    // Crea il blob e avvia il download
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    addLog(`File scaricato con successo, dimensione: ${blob.size} bytes`)
    
    generateStatus.value = {
      success: true,
      size: blob.size
    }
    
  } catch (error: any) {
    addLog(`Errore generazione Excel: ${error.message}`)
    
    generateStatus.value = {
      success: false,
      error: error.message || 'Errore sconosciuto durante la generazione'
    }
  } finally {
    loading.value.generate = false
  }
}

// Lifecycle
onMounted(() => {
  addLog('Pagina Excel caricata')
  addLog(`Configurazione runtime caricata`)
  if (debugMode.value) {
    addLog(`Debug mode ATTIVO`)
    addLog(`API Base (Backend): ${config.public.apiBase}`)
    addLog(`Template Path: ${config.public.templatePath}`)
    addLog(`Frontend Port: ${config.public.frontendPort}`)
    addLog(`Backend Port: ${config.public.apiPort}`)
  } else {
    addLog(`Debug mode DISATTIVO - usa npm run dev:debug per attivarlo`)
  }
})

// Meta
useHead({
  title: 'Generatore Excel - Admin Dashboard'
})
</script>

<style scoped>
.debug-log {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.debug-log pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.btn {
  min-width: 120px;
}

.alert {
  font-size: 0.875rem;
}

.form-label {
  font-weight: 500;
}
</style>

<!-- Version: 1.1.0 -->